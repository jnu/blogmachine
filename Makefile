NPM_BIN := $(shell npm bin)

.PHONY: install build build-prod use-prod watch image deploy

install:
	yarn install

build: install
	$(NPM_BIN)/dreija --app ./src/index.js --env DBHOSTNAME="http://db:5984" --env REDISHOST="redis"

build-prod:install
	NODE_ENV=production $(NPM_BIN)/dreija --app ./src/index.js --env DBHOSTNAME="http://db:5984" --env REDISHOST="redis"

watch: install
	$(NPM_BIN)/dreija --watch --app ./src/index.js --env DBHOSTNAME="http://localhost:5984" --env REDISHOST="localhost"

image:
	docker build -t joen/blogmachine:prod .

deploy: image
	docker push joen/blogmachine:prod
	ssh jnuaws 'bash -s' < ./util/remote_deploy.sh
