FROM node:14.17.0-alpine3.13 AS dependency
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]