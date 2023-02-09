# syntax=docker/dockerfile:1
FROM node:16.17.1
ENV NODE_ENV=development

WORKDIR .

COPY ["package.json", "package-lock.json", "./"]

RUN npm install

COPY . .

CMD ["node", "server.js"]
