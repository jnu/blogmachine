BUILD                  := ./dist
NODE_MODULES           := ./node_modules
NPM_BIN                := $(shell npm bin)
DEV_CONTAINER_TAG      := joen/blogmachine:dev
DEV_CONTAINER_NAME     := blogmachine-dev
RUNNING_DEV_CONTAINER  := $(shell docker ps | grep blogmachine-dev | awk '{print $$2}')
EXISTING_DEV_CONTAINER = $(shell docker ps -a | grep blogmachine-dev | awk '{print $$2}')
DOCKER_MACHINE_IP      := $(shell docker-machine ip default)
SHRINKWRAP             = $(shell cat package.json | md5).pkghash


.PHONY: build clean install test lint watch devimg cleandevcontainer clean-build img

all: build

build: clean-build test $(SHRINKWRAP)
	NODE_ENV=production $(NPM_BIN)/webpack --bail

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

cleandevcontainer:
	# Don't try to remove / kill nonexistant containers, otherwise errors
	if [[ "$(RUNNING_DEV_CONTAINER)" == "$(DEV_CONTAINER_TAG)" ]]; then \
		docker kill $(DEV_CONTAINER_NAME); \
	fi
	if [[ "$(EXISTING_DEV_CONTAINER)" == "$(DEV_CONTAINER_TAG)" ]]; then \
		docker rm $(DEV_CONTAINER_NAME); \
	fi

devimgup: devimg cleandevcontainer
	docker run --rm -p 3030:3030 -e DBHOSTNAME="$(DOCKER_MACHINE_IP)" --name $(DEV_CONTAINER_NAME) $(DEV_CONTAINER_TAG)

watch: $(NODE_MODULES)
	DBHOSTNAME="$(DOCKER_MACHINE_IP)" node dreija/bin/dreija-dev.js --app ./src/index.js
