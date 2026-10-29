FROM node:24.22.0-alpine3.23 AS app

WORKDIR /app

RUN chown node:node /app

USER node

COPY --chown=node:node tsconfig.json postcss.config.mjs package.json package-lock.json next.config.mjs components.json /app/

COPY --chown=node:node src /app/src

RUN npm ci

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "dev", "--", "-p", "3000" ]
