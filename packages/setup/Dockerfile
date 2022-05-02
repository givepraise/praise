FROM node:16.13.2-alpine

# Create app directory
WORKDIR /usr/praise/

# Install dependencies for packages
RUN yarn set version berry
RUN yarn

# Run the app
CMD ["yarn", "workspace",  "setup",  "start"]