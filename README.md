Blog
===========

Most of the magic happens in Dreija.

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
