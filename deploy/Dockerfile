FROM node:10

WORKDIR /usr/src/app

COPY * ./

RUN curl -o- -L https://yarnpkg.com/install.sh | bash

RUN apt-get install sudo
RUN sudo apt-get install python3

RUN pip3 install awscli --upgrade --user

RUN yarn install

RUN yarn build

RUN aws s3 cp ./build/ s3://debt-destroyer.io/ --recursive
