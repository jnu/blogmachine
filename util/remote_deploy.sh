#!/bin/bash

# CouchDB and Redis are run with standard prefab images with persistent data
# volumes.
#
# The NodeJS and NginX portions are run in two different containers from a
# single image. This ensures fingerprinted bundles referenced by the static
# markup will be found by nginx when it serves the assets.
#
# Additional static & php repos are run in their own containers which are
# linked to the main NginX reverse proxy.
#
# Multinode: everything currently runs on a single node. Nothing actually needs
# to be colocated, and Redis & the static assets could add more nodes and get
# immediate benefits with load balancing. CouchDB must be upgraded to v2 to be
# set up as a cluster.

# Run CouchDB. TODO upgrade to CouchDB 2. (May already be up.)
# If database needs to be restored, configure the replicator from the UI.
sudo docker pull klaemo/couchdb:1.6.1
sudo docker run -d -p 5984:5984 -v /data/var/lib/couchdb:/usr/local/var/lib/couchdb --name db klaemo/couchdb:1.6.1

# Run redis w/ persistent storage. (May already be up.)
sudo docker pull redis:alpine
sudo docker run --name redis -d redis:alpine redis-server --appendonly yes

# Get custom images
sudo docker pull joen/jnuworks:php
sudo docker pull joen/jnuworks:static
sudo docker pull joen/blogmachine:prod

# Run php (with mysql and its own nginx)
sudo docker kill php
sudo docker rm php
sudo docker run -d \
                -p 5001:80 \
                -v /data/var/lib/mysql:/var/lib/mysql \
                --name php \
                joen/jnuworks:php

# Run static server
sudo docker kill static
sudo docker rm static
sudo docker run -d \
                -p 5000:80 \
                --link php:php \
                --name static \
                joen/jnuworks:static \
                nginx -g "daemon off;"


# Run NodeJS server (prerendering + API)
sudo docker kill blog
sudo docker rm blog
sudo docker run -d \
                -p 3030:3030 \
                --link db:db \
                --link redis:redis \
                --name blog \
                -v /home/ubuntu/secrets:/etc/secrets \
                joen/blogmachine:prod \
                node dist/server.js -s /etc/secrets/secrets.json -h http://jnu.works

# Run NginX (static asset server and reverse proxy)
sudo docker kill nginx
sudo docker rm nginx
sudo docker run -d \
                -p 80:80 \
                -p 443:443 \
                --link db:db \
                --link blog:blog \
                --link static:static \
                --link php:php \
                --name nginx \
                -v /home/ubuntu/secrets:/etc/secrets \
                joen/blogmachine:prod \
                nginx -g "daemon off;"

# Clean up unused images
sudo docker images | grep \<none\> | awk '{print $3}' | xargs sudo docker rmi
