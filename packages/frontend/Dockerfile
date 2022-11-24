FROM node:16.18-alpine as builder

# Create app directory
WORKDIR /usr/src/

# Copy workspace config
COPY ./package*.json .
COPY ./.eslintrc.js .
COPY ./.yarnrc.yml .
COPY ./yarn.lock .
COPY ./.yarn ./.yarn

# Copy packages
COPY ./packages/api ./packages/api
COPY ./packages/frontend ./packages/frontend

# Install dependencies for packages
RUN yarn set version berry
RUN yarn
RUN yarn workspace api build
RUN yarn workspace frontend build

# note: never use the :latest tag in a production site
FROM caddy:2.5.2-alpine

COPY ./packages/frontend/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /usr/src/packages/frontend/build /var/www/praise