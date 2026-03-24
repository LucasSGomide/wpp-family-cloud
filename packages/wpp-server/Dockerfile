# Stage 1 — install all deps (lockfile + manifests only, no source)
FROM node:22-slim AS deps
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/wpp-server/package.json packages/wpp-server/
RUN pnpm install --frozen-lockfile

# Stage 2 — build
FROM deps AS build
COPY . .
RUN pnpm nx build wpp-server

# Stage 3 — prune to production deps for wpp-server only
FROM build AS prune
RUN pnpm deploy --filter wpp-server --prod /deploy/wpp-server

# Stage 4 — runtime
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prune /deploy/wpp-server/node_modules ./node_modules
COPY --from=build /app/packages/wpp-server/dist ./dist
CMD ["node", "dist/index.js"]
