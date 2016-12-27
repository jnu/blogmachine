Blog
===========

Most of the magic happens in Dreija.

# Development

Requires `couchdb` and `redis` to be running. You can use the standard images
for these things (configure replication in CouchDB if desired).

```
$ docker run -d -p 5984:5984 -v /data/var/lib/couchdb:/usr/local/var/lib/couchdb --name db klaemo/couchdb:1.6.1
$ docker run --name redis -d -p 6379:6379 redis:alpine redis-server --appendonly yes
```

Requires using Node v4. Later versions **will not work** right now.

```
$ nvm use 4
```

Finally, run the watcher (installs dependencies as necessary):

```
$ make watch
```

Then live-reload development is available on `localhost:3030`.

# Deployment

Build the docker images (db, blog, and nginx). Couchdb does not require any
additional configuration; it is mounted with a data volume. The node and nginx
services are each built with static assets included, and are linked.

Then, push to Docker hub.

Then, on server, pull the images from docker hub and run them in order:

```
$ sudo docker run -d -p 5984:5984 -v /data/var/lib/couchdb:/usr/local/var/lib/couchdb --name db klaemo/couchdb
$ sudo docker run -d -p 3030:3030 --link db --name blog joen/blogmachine:dev
$ sudo docker run -d -p 80:80 -p 443:443 --link blog --link db --name nginx joen/blogmachine:nginx
```

Might have to remove existing images (could start with `--rm` to avoid this.)
