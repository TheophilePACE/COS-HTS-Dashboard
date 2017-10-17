FROM node:slim
WORKDIR /home/node/app
COPY api api
COPY public public
COPY src src
COPY .env .env
COPY defaultSettings.json defaultSettings.json 
COPY package.json package.json
COPY Procfile Procfile
RUN npm install
CMD npm run start-dev