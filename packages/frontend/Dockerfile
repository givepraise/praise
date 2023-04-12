FROM node:18.15 as builder

# Create app directory
WORKDIR /usr/src/

# Copy workspace config
COPY ./package*.json .
COPY ./yarn.lock .

# Copy packages
COPY ./packages/api-types ./packages/api-types
COPY ./packages/frontend ./packages/frontend

# Install dependencies for packages
RUN corepack enable
RUN yarn
RUN yarn workspace frontend build

# note: never use the :latest tag in a production site
FROM caddy:2.6.4-alpine

COPY ./packages/frontend/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /usr/src/packages/frontend/build /var/www/praise
