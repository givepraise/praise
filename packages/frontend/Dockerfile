FROM node:18.15 as builder

# Create app directory
WORKDIR /usr/src/

# Copy workspace config
COPY ./package*.json .
COPY ./.eslintrc.js .
COPY ./.yarnrc.yml .
COPY ./yarn.lock .
COPY ./.yarn ./.yarn

# Copy packages
COPY ./packages/api-types ./packages/api-types
COPY ./packages/frontend ./packages/frontend

# Install dependencies
RUN corepack enable
RUN yarn

# Build the app
RUN yarn workspace frontend build

# Serve the app with Caddy
FROM caddy:2.6.4-alpine

COPY ./packages/frontend/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /usr/src/packages/frontend/build /var/www/praise
