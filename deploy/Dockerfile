FROM node:10

WORKDIR /usr/src/app

COPY * ./

RUN curl -o- -L https://yarnpkg.com/install.sh | bash

RUN yarn install

RUN yarn build
