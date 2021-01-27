FROM node:14-alpine

ENV NODE_ENV=prod
ARG CODEARTIFACT_AUTH_TOKEN

COPY . /app
WORKDIR /app
RUN yarn --prod=false && \
  yarn build && \
  yarn --prod=true && \
  rm -rf src && \
  rm -rf .npmrc

CMD yarn start