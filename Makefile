NPM_BIN := $(shell npm bin)

.PHONY: install build build-prod use-prod watch prodimg nginximg app deploy

install:
	yarn install

build: install
	$(NPM_BIN)/dreija --app ./src/index.js --env DBHOSTNAME="http://db:5984"

build-prod:install
	NODE_ENV=production $(NPM_BIN)/dreija --app ./src/index.js --env DBHOSTNAME="http://db:5984"

watch: install
	$(NPM_BIN)/dreija --watch --app ./src/index.js --env DBHOSTNAME="http://db:5984"

prodimg:
	docker build -t joen/blogmachine:prod .

nginximg: build-prod
	docker build -t joen/blogmachine:nginx -f Dockerfile-nginx .

app: nginximg prodimg

deploy: app
	docker push joen/blogmachine:nginx
	docker push joen/blogmachine:prod
	ssh jnuaws 'bash -s' < ./util/remote_deploy.sh
