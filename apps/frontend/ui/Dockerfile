# syntax=docker/dockerfile:1.7

FROM cgr.dev/chainguard/node:latest-dev AS deps
WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

FROM cgr.dev/chainguard/node:latest-dev AS builder
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build

FROM cgr.dev/chainguard/node:latest AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=builder --chown=node:node /app/dist/ui/browser ./browser
COPY --chown=node:node server.mjs ./
EXPOSE 4000
CMD ["server.mjs"]
