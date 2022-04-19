FROM node:16-alpine
ARG DOPPLER_TOKEN
ARG GITHUB_TOKEN

COPY . /app
WORKDIR /app
RUN apk --no-cache add tzdata gnupg curl && \
  curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh && \
  doppler secrets download doppler.encrypted.json && \
  cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
  echo "Asia/Seoul" > /etc/timezone && \
  npm config set 'https://npm.pkg.github.com/:_authToken' ${GITHUB_TOKEN} && \
  yarn --prod=false && yarn build && \
  yarn --prod=true && rm -rf src ~/.npmrc

CMD yarn start