NPM_BIN   := $(shell npm bin)
DOCKER_IP := $(shell docker-machine ip)


.PHONY: install build build-prod use-prod just-watch watch image deploy

install:
	yarn install

build: install
	$(NPM_BIN)/dreija --app ./src/index.js --env DBHOST="db" --env REDISHOST="redis"

build-prod:install
	NODE_ENV=production $(NPM_BIN)/dreija --app ./src/index.js --env DBHOST="db" --env REDISHOST="redis"

watch: install just-watch

just-watch:
	$(NPM_BIN)/dreija --watch --app ./src/index.js --env DBHOST="$(DOCKER_IP)" --env REDISHOST="$(DOCKER_IP)" --secrets ./secrets.json

image:
	docker build -t joen/blogmachine:prod .

deploy: image
	docker push joen/blogmachine:prod
	scp ./secrets.json jnuaws:~/secrets.json
	scp -r ./nginx/ssl jnuaws:~/ssl
	ssh jnuaws 'bash -s' < ./util/remote_deploy.sh
