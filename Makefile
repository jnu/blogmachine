BUILD                  := ./dist
NODE_MODULES           := ./node_modules
NPM_BIN                := $(shell npm bin)
DEV_CONTAINER_TAG      := joen/blogmachine:dev
DEV_CONTAINER_NAME     := blogmachine-dev
SHRINKWRAP             = .pkghash-$(shell cat package.json | md5)


.PHONY: all build build-prod set-env-prod lint test clean watch prodimg nginximg appimg deploy

all: test build

$(DIST): $(SHRINKWRAP)
	$(NPM_BIN)/dreija-dev --app ./src/index.js --env DBHOSTNAME="http://db:5984"

build: $(DIST)

set-env-prod:
	export NODE_ENV=production

build-prod: set-env-prod $(SHRINKWRAP) test build

$(SHRINKWRAP): $(NODE_MODULES)
	find . -name '*.pkghash' -delete
	npm prune
	npm shrinkwrap
	touch $(SHRINKWRAP)

lint: $(NODE_MODULES)
	$(NPM_BIN)/eslint  --ext .js,.jsx ./src

test: lint

clean: clean-build
	rm -rf $(BUILD)
	find . -name '*.pkghash' -delete
	rm -rf $(NODE_MODULES)

$(NODE_MODULES):
	npm install
	npm prune

prodimg: build-prod
	docker build -t joen/blogmachine:prod .
	docker build -t joen/blogmachine:nginx -f Dockerfile-nginx .

nginximg: build-prod
	docker build -t joen/blogmachine:nginx -f Dockerfile-nginx .

watch: $(NODE_MODULES)
	$(NPM_BIN)/dreija-dev --watch --app ./src/index.js --env DBHOSTNAME="http://db:5984"

appimg: nginximg prodimg
	docker push joen/blogmachine:nginx
	docker push joen/blogmachine:prod

deploy: build-prod appimg
	ssh jnuaws 'bash -s' < ./util/remote_deploy.sh
