# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Skip postinstall (nuxt prepare) until sources are present
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm exec nuxi prepare && pnpm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

COPY --from=builder /app/.output ./.output

EXPOSE 3000

USER node

CMD ["node", ".output/server/index.mjs"]
