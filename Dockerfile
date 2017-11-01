FROM node:alpine
WORKDIR /home/node/app
COPY . .
RUN npm install --only=production