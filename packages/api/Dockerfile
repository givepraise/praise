FROM node:18.14.0

# Create app directory
WORKDIR /usr/src/

# Copy workspace config
COPY ./package*.json .
COPY ./.yarnrc.yml .
COPY ./yarn.lock .
COPY ./.yarn ./.yarn

# Copy packages
COPY ./packages/api2 ./packages/api2

# Install dependencies for packages
RUN yarn set version berry
RUN yarn

# Run the app
CMD ["yarn", "api:start"]


