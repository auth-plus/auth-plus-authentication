FROM node:12.18.4-alpine3.12 AS dependency
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:12.18.4-alpine3.12 AS builder
WORKDIR /app
COPY --from=dependency /app/node_modules ./node_modules
COPY . .
RUN ls
RUN npm run build


FROM node:12.18.4-alpine3.12 as deployable
WORKDIR /app
EXPOSE 5000
COPY --from=builder /app/build ./
COPY --from=dependency /app/node_modules ./node_modules
CMD [ "node", "index.js" ]