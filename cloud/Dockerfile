FROM node:12-slim
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY fieldbook server www config.json server.js ./
RUN yarn build
CMD node ./server.js
