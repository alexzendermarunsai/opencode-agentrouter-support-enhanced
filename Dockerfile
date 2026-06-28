FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY agenrouter_server.js ./

EXPOSE 4000

CMD ["node", "agenrouter_server.js"]
