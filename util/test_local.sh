# nginx
docker run -d \
           -p 80:80 \
           -p 443:443 \
           --link db:db \
           --link blog:blog \
           --name nginx \
           -v $PWD/secrets:/etc/secrets \
           --volumes-from static \
           joen/blogmachine:prod \
           nginx -g "daemon off;"
