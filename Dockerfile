FROM node:argon
MAINTAINER Joe Nudell <joenudell@gmail.com>

# Set locale
RUN apt-get update && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install -y --no-install-recommends locales
RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
RUN locale-gen en_US.UTF-8 && dpkg-reconfigure locales
RUN mkdir -p /tmp/npm-cache/base && \
    mkdir -p /tmp/npm-cache/current && \
    mkdir -p /usr/src/app
RUN npm install -g npm@3

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV LC_CTYPE en_US.UTF-8


# Install dependencies from an old version of npm shrinkwrap, so new versions
# can be layered incrementally on top of it.
WORKDIR /tmp/npm-cache/base
COPY Docker-npm-shrinkwrap-base.json npm-shrinkwrap.json
COPY Docker-package-base.json package.json
RUN npm install && \
    cp -a node_modules /tmp/npm-cache/current



# Build app
WORKDIR /usr/src/app/current

# Build deps - cached where possible
COPY package.json package.json
COPY npm-shrinkwrap.json npm-shrinkwrap.json
RUN npm install && \
    npm prune

# Copy built app
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN cp -a /tmp/npm-cache/current . && \
    make build-prod

CMD [ "node", "dist/server.js" ]
EXPOSE 3030
