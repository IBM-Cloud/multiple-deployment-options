FROM node:6.9.1-alpine

COPY lib/ lib/
COPY app.js .
COPY package.json .

RUN npm install
EXPOSE 8080
CMD node app.js
