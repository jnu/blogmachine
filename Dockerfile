FROM node:argon
MAINTAINER Joe Nudell <joenudell@gmail.com>

# Set up yarn (npm replacement) debian package repo
# RUN apt-key adv --keyserver pgp.mit.edu --recv D101F7899D41F3C3
# RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# Set locale
RUN apt-get update && \
    # apt-get install yarn && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install -y --no-install-recommends locales
RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
RUN locale-gen en_US.UTF-8 && dpkg-reconfigure locales

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV LC_CTYPE en_US.UTF-8

# Set up yarn
RUN mkdir -p /opt/yarn && \
    cd /opt/yarn && \
    wget https://yarnpkg.com/latest.tar.gz && \
    tar zvxf latest.tar.gz

# Set up cached dependencies
RUN mkdir -p /tmp/npm-cache && \
    mkdir -p /usr/src/app

# Install dependencies
WORKDIR /tmp/npm-cache
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN /opt/yarn/dist/bin/yarn install

# Copy built app
WORKDIR /usr/src/app
COPY ./src /usr/src/app/src
COPY ./assets /usr/src/app/assets
#RUN ln -s /tmp/npm-cache/node_modules ./
RUN cp -r /tmp/npm-cache/node_modules ./node_modules
RUN NODE_ENV=production ./node_modules/.bin/dreija-dev --app ./src/index.js --env DBHOSTNAME="http://db:5984"

CMD [ "node", "dist/server.js" ]
EXPOSE 3030
