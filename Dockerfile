FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY src/server.js ./src/server.js

EXPOSE 5000

CMD ["node", "src/server.js"]