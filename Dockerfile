FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
ARG PORT=3000
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${PORT}
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# SQL files read by dist/db/migrate.js (migrate service)
COPY --from=build /app/src/db/migrations ./src/db/migrations
USER node
EXPOSE ${PORT}
CMD ["node", "dist/main.js"]
