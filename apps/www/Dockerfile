ARG NODE_VERSION=26

FROM node:${NODE_VERSION}-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV TURBO_TELEMETRY_DISABLED=1

WORKDIR /app

RUN apk update && \
    apk add --no-cache \
    libc6-compat && \
    npm install -g pnpm@next-11 turbo

FROM base AS pre-builder

COPY . .

RUN turbo prune --scope=www --docker

FROM base AS builder

COPY --from=pre-builder /app/out/json/ .
COPY --from=pre-builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pre-builder /app/out/full/ .
COPY turbo.json turbo.json

ARG TURBO_TEAM \
    TURBO_TOKEN \
    VITE_SERVICE_ENDPOINT

ENV TURBO_TEAM=$TURBO_TEAM \
    TURBO_TOKEN=$TURBO_TOKEN \
    VITE_SERVICE_ENDPOINT=$VITE_SERVICE_ENDPOINT

RUN pnpm i

RUN pnpm turbo run build --filter=www...

FROM nginx:alpine

COPY /apps/www/docker/nginx.conf /etc/nginx/conf.d/configfile.template
COPY --from=builder /app/apps/www/dist /usr/share/nginx/html

ENV PORT=8080 \
    HOST=0.0.0.0

EXPOSE 8080

CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
