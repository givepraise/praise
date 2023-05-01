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

# Make sure init-env.sh is executable
RUN chmod +x ./packages/frontend/build/init-env.sh

# Serve the app with Caddy
FROM caddy:2.6.4-alpine

# Install envsubst (part of gettext package)
RUN apk add --no-cache gettext

COPY ./packages/frontend/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /usr/src/packages/frontend/build /var/www/praise
