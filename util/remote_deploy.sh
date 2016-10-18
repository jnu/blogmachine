#!/bin/bash

# assumes couchdb is already running. if not, run
# sudo docker run -d -p 5984:5984 -v /data/var/lib/couchdb:/usr/local/var/lib/couchdb --name db klaemo/couchdb
#
# If database needs to be restored, figure out how to do that :D

sudo docker pull joen/blogmachine:prod
sudo docker pull joen/blogmachine:nginx

sudo docker kill blog
sudo docker rm blog
sudo docker run -d -p 3030:3030 --link db:db --name blog joen/blogmachine:prod

sudo docker kill nginx
sudo docker rm nginx
sudo docker run -d -p 80:80 -p 443:443 --link db:db --link blog:blog --name nginx joen/blogmachine:nginx
