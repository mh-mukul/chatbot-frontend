# 1. Install dependencies
FROM node:20 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# 2. Build the application
FROM node:20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Only copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
CMD ["npm", "start"]
