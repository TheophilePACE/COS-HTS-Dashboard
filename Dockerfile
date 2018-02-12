FROM node:alpine
WORKDIR /home/node/app

COPY ./api ./api
COPY package.json .env ./defaultSettings.json ./
RUN npm install --only=production
CMD npm run startApi
