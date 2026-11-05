FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/db ./db
COPY --from=builder /app/server.js ./server.js
EXPOSE 3000
CMD ["node", "server.js"]
