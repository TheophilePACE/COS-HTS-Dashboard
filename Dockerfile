FROM node:slim
WORKDIR /home/node/app
COPY . .
RUN npm install