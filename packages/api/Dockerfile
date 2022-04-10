FROM node:16.13.2-alpine

# Create app directory
WORKDIR /usr/src/

# Copy workspace config
COPY ./package*.json .
COPY ./.yarnrc.yml .
COPY ./yarn.lock .
COPY ./.env .
COPY ./.yarn ./.yarn

# Copy packages
COPY ./packages/api ./packages/api

# Install dependencies for packages
RUN yarn set version berry
RUN yarn

# Run the app
EXPOSE 8088
CMD ["yarn", "api:start"]