FROM node:14-alpine

RUN apk add dumb-init

RUN mkdir -p /app

WORKDIR /app

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]

ADD . .

RUN cross-env NODE_ENV=production yarn install

CMD ["yarn", "start"]