# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Stage 1: Build Angular production bundle
# -----------------------------------------------------------------------------
FROM node:20-bookworm-slim AS build

ARG PNPM_VERSION=10.28.2

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
ENV NODE_ENV=production
ENV NG_CLI_ANALYTICS=false

RUN corepack enable && corepack prepare "pnpm@${PNPM_VERSION}" --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm ci

COPY angular.json tsconfig.json tsconfig.base.json tsconfig.app.json ./
COPY src ./src

RUN pnpm run build

# -----------------------------------------------------------------------------
# Stage 2: Serve static assets with nginx (non-root, port 8080)
# -----------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="erp-frontend-ng" \
      org.opencontainers.image.description="ERP Aspire Angular frontend (production static assets)"

# Empty = static SPA only (API routing handled by ingress/reverse proxy).
# Set to gateway base URL (e.g. http://api-gateway:5000) to proxy API paths in-container.
ENV API_GATEWAY_URL=""

COPY --from=build --chown=nginx:nginx /app/dist/temp-ng-project/browser /usr/share/nginx/html

COPY docker/proxy-params.conf /etc/nginx/proxy-params.conf
COPY docker/default.static.conf /etc/nginx/site-templates/default.static.conf
COPY docker/default.conf.template /etc/nginx/site-templates/default.conf.template
COPY docker/99-generate-nginx-site.sh /docker-entrypoint.d/99-generate-nginx-site.sh

RUN chmod +x /docker-entrypoint.d/99-generate-nginx-site.sh

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider "http://127.0.0.1:8080/health" || exit 1
