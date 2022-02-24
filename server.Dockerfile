FROM node:14

WORKDIR /app
ADD fs-server/package.json .
RUN yarn
ADD fs-server .
RUN mkdir /shared-git/ && cd /shared-git/ && git init --bare
ENTRYPOINT [ "node", "app.js" ]
