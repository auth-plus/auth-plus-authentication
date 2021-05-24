FROM node:14.17.0-alpine3.13 AS dependency
WORKDIR /app
COPY . .
RUN npm ci

FROM node:14.17.0-alpine3.13 AS builder
WORKDIR /app
COPY --from=dependency /app/node_modules ./node_modules
COPY . .
RUN npm run build


FROM node:14.17.0-alpine3.13 as deployable
WORKDIR /app
EXPOSE 5000
COPY --from=builder /app/build ./
COPY --from=dependency /app/node_modules ./node_modules
CMD [ "node", "index.js" ]