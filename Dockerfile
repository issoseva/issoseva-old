FROM node:12-slim
WORKDIR /usr/src/app

# run yarn install in separate step so layers are cached
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# See .dockerignore for ignore list
COPY . .
RUN ls -lah && yarn build

ENTRYPOINT ["yarn", "start"]
