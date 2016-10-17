BUILD                  := ./dist
NODE_MODULES           := ./node_modules
NPM_BIN                := $(shell npm bin)
DEV_CONTAINER_TAG      := joen/blogmachine:dev
DEV_CONTAINER_NAME     := blogmachine-dev
RUNNING_DEV_CONTAINER  := $(shell docker ps | grep blogmachine-dev | awk '{print $$2}')
EXISTING_DEV_CONTAINER = $(shell docker ps -a | grep blogmachine-dev | awk '{print $$2}')
DOCKER_MACHINE_IP      := $(shell docker-machine ip default)
SHRINKWRAP             = $(shell cat package.json | md5).pkghash


.PHONY: build clean install test lint watch devimg prodimg cleandevcontainer clean-build img nginximg

all: build

build: clean-build test $(SHRINKWRAP)
	$(NPM_BIN)/dreija-dev --app ./src/index.js --env DBHOSTNAME="http://db:5984"

$(SHRINKWRAP): $(NODE_MODULES)
	find . -name '*.pkghash' -delete
	npm prune
	npm shrinkwrap
	touch $(SHRINKWRAP)

lint: $(NODE_MODULES)
	$(NPM_BIN)/eslint  --ext .js,.jsx ./src

test: lint

clean-build:
	rm -rf $(BUILD)

clean: cleandevcontainer clean-build
	find . -name '*.pkghash' -delete
	rm -rf $(NODE_MODULES)

$(NODE_MODULES):
	npm install
	npm prune

devimg: build
	docker build -t "$(DEV_CONTAINER_TAG)" .

prodimg: clean-build
	NODE_ENV=production $(NPM_BIN)/dreija-dev --app ./src/index.js --env DBHOSTNAME="http://db:5984"
	docker build -t joen/blogmachine:prod .
	docker build -t joen/blogmachine:nginx -f Dockerfile-nginx .

cleandevcontainer:
	# Don't try to remove / kill nonexistant containers, otherwise errors
	if [[ "$(RUNNING_DEV_CONTAINER)" == "$(DEV_CONTAINER_TAG)" ]]; then \
		docker kill $(DEV_CONTAINER_NAME); \
	fi
	if [[ "$(EXISTING_DEV_CONTAINER)" == "$(DEV_CONTAINER_TAG)" ]]; then \
		docker rm $(DEV_CONTAINER_NAME); \
	fi

devimgup:
	# devimg cleandevcontainer
	docker run --rm -p 3030:3030 --link db:db --name $(DEV_CONTAINER_NAME) $(DEV_CONTAINER_TAG)

nginximg:
	docker build -t joen/blogmachine:nginx -f Dockerfile-nginx .

nginximgup:
	docker run --rm -p 80:80 -p 443:443 --link db:db --link blog:blog --name nginx joen/blogmachine:nginx

watch: $(NODE_MODULES)
	$(NPM_BIN)/dreija-dev --watch --app ./src/index.js --env DBHOSTNAME="http://db:5984"
