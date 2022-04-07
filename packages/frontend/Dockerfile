FROM node:16.13.2-alpine as builder

# Create app directory
WORKDIR /usr/src/

# Copy workspace config
COPY ./package*.json .
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

# 
FROM nginx:alpine
COPY ./packages/frontend/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy from the stage 1
COPY --from=builder /usr/src/packages/frontend/build /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]