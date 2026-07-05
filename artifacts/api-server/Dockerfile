FROM node:20-alpine

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/ ./lib/

RUN pnpm install --ignore-scripts

COPY artifacts/api-server/ ./artifacts/api-server/

WORKDIR /app/artifacts/api-server

RUN node ./build.mjs

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
