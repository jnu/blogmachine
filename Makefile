NPM_BIN   := $(shell npm bin)
DOCKER_IP := $(shell docker-machine ip)
PWD       := $(shell echo $PWD)


.PHONY: install build build-prod just-build-prod just-watch watch
	    static-image image deploy

install:
	yarn install

build: install
	$(NPM_BIN)/dreija --app ./src/index.js --env DBHOST="db" --env REDISHOST="redis"

build-prod: install just-build-prod

just-build-prod:
	NODE_ENV=production $(NPM_BIN)/dreija --app ./src/index.js --env DBHOST="db" --env REDISHOST="redis"

watch: install just-watch

just-watch:
	$(NPM_BIN)/dreija --watch --app ./src/index.js --env DBHOST="$(DOCKER_IP)" --env REDISHOST="$(DOCKER_IP)" --secrets ./secrets/secrets.json

image:
	docker build -t joen/blogmachine:prod .

static-image:
	git submodule update --init --recursive
	make image -C ./static

deploy: image static-image
	docker push joen/jnuworks:static
	docker push joen/blogmachine:prod
	scp -r ./secrets jnuaws:~/secrets
	ssh jnuaws 'bash -s' < ./util/remote_deploy.sh
