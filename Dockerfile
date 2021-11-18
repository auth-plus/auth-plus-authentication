FROM node:14.17.0-alpine3.13 AS dependency
WORKDIR /app
COPY . .
RUN npm ci

FROM node:14.17.0-alpine3.13 AS builder
WORKDIR /app
COPY . .
COPY --from=dependency /app/node_modules /app/node_modules

FROM node:14.17.0-alpine3.13 AS deploy
WORKDIR /app
COPY --from=dependency /app/node_modules /app/node_modules
COPY --from=builder /app/build /app/build
EXPOSE 5000
CMD ["npm", "start"]