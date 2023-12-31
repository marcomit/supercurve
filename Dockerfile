FROM node:18.16.0-alpine3.17
RUN mkdir -p /app
WORKDIR /app
COPY multi/server/package.json multi/server/package-lock.json ./
RUN npm install
COPY multi/server/ ./
EXPOSE 8080
CMD [ "node", "supercurve_server.js"]