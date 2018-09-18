FROM node:8.9-alpine

COPY lib/ lib/
COPY app.js .
COPY package.json .

RUN npm install
EXPOSE 8080
CMD node app.js
