#!/bin/bash

# Assumes couchdb is already running. If not, run
# sudo docker run -d -p 5984:5984 -v /data/var/lib/couchdb:/usr/local/var/lib/couchdb --name db klaemo/couchdb
#
# If database needs to be restored, figure out how to do that :D
#
# CouchDB is run in a standard couch container with a data volume. The NodeJS
# and NginX portions are run in two different containers from a single image.
# This ensures fingerprinted bundles referenced by the static markup will be
# found by nginx when it serves the assets.

sudo docker pull joen/blogmachine:prod

# Run NodeJS server (prerendering + API)
sudo docker kill blog
sudo docker rm blog
sudo docker run -d -p 3030:3030 --link db:db --name blog joen/blogmachine:prod node dist/server.js

# Run NginX (static asset server and reverse proxy)
sudo docker kill nginx
sudo docker rm nginx
sudo docker run -d -p 80:80 -p 443:443 --link db:db --link blog:blog --name nginx joen/blogmachine:prod nginx -g "daemon off;"
