# Dockerfile multi-target pour Tournament Registration Manager
# Supporte les targets: api, web
# Usage:
#   docker build --target api -t trm-api .
#   docker build --target web --build-arg VITE_API_URL=https://api.example.com -t trm-web .

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# ============================================
# API BUILD
# ============================================
FROM base AS api-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/
COPY packages/fftt-client/package.json ./packages/fftt-client/
RUN pnpm install --frozen-lockfile

FROM base AS api-builder
COPY --from=api-deps /app/node_modules ./node_modules
COPY --from=api-deps /app/api/node_modules ./api/node_modules
COPY --from=api-deps /app/packages/fftt-client/node_modules ./packages/fftt-client/node_modules
COPY packages/fftt-client ./packages/fftt-client
COPY api ./api
WORKDIR /app/api
RUN pnpm build

FROM node:22-alpine AS api
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY --from=api-deps /app/node_modules ./node_modules
COPY --from=api-deps /app/api/node_modules ./api/node_modules
COPY --from=api-deps /app/packages/fftt-client ./packages/fftt-client
COPY --from=api-builder /app/api/build ./api/build
COPY api/package.json ./api/
# Script entrypoint pour migrations automatiques
COPY docker/api-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3333
EXPOSE 3333
WORKDIR /app/api
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "build/bin/server.js"]

# ============================================
# WEB BUILD
# ============================================
FROM base AS web-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/
# Installer les dépendances du workspace web (sans filtre, pnpm gère le workspace)
RUN pnpm install --frozen-lockfile

FROM base AS web-builder
COPY --from=web-deps /app/node_modules ./node_modules
COPY --from=web-deps /app/web/node_modules ./web/node_modules
COPY web ./web
WORKDIR /app/web
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm build

FROM nginx:alpine AS web
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=web-builder /app/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
