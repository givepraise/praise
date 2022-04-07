FROM node:16.13.2-alpine

# Create app directory
WORKDIR /usr/src/

# Copy workspace config
COPY ./package*.json .
COPY ./.yarnrc.yml .
COPY ./yarn.lock .

# Copy packages
COPY ./.yarn ./.yarn
COPY ./packages/api ./packages/api

# Install dependencies for packages
RUN yarn set version berry
RUN echo $(ls -a /usr/src/packages/api)
RUN yarn

# Run the app
WORKDIR /usr/src/api
EXPOSE 8088
CMD ["yarn", "api:start"]