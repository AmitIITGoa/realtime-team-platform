# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
# Use npm ci if lockfile exists, else fallback to npm install
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

# Build
COPY . .
RUN npm run build

# Runtime with Node (no Nginx)
FROM node:20-alpine
RUN npm i -g serve@14
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
