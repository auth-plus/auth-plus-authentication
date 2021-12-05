FROM node:14.17.0-alpine3.13 AS dependency
WORKDIR /app
COPY . .
RUN npm ci

FROM node:14.17.0-alpine3.13 AS builder
WORKDIR /app
COPY . .
COPY --from=dependency /app/node_modules ./node_modules
RUN npm run build

FROM node:14.17.0-alpine3.13 AS deploy
WORKDIR /app
COPY --from=dependency /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY package.json .
EXPOSE 5000
CMD ["npm", "start"]