# ── BASE: dependencias comunes ────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
 
# ── DEVELOPMENT: hot-reload con nodemon ───────────────────────────
FROM base AS development
ENV NODE_ENV=development
RUN npm install                  
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]