FROM node:18.15-alpine

# Create app directory
WORKDIR /usr/src/

# Copy workspace config
COPY ./package*.json .
COPY ./yarn.lock .

# Copy packages
COPY ./packages/setup ./packages/setup

# Install dependencies for packages
RUN corepack enable
RUN yarn

# Run the app
CMD ["yarn", "workspace",  "setup",  "start"]