FROM node:22.22.3-alpine3.22 AS app

WORKDIR /app

RUN chown node:node /app

USER node

COPY --chown=node:node tsconfig.json tailwind.config.js postcss.config.mjs package.json next.config.mjs components.json /app/

COPY --chown=node:node src /app/src

RUN yarn install

EXPOSE 3000

ENTRYPOINT [ "yarn", "dev", "-p", "3000" ]
