FROM node:14

RUN apt-get update && apt-get install -y build-essential libx11-dev libxkbfile-dev libsecret-1-dev

WORKDIR /app
ADD fs/package.json .
RUN yarn --ignore-engines
RUN yarn run prepare

RUN curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64 && install skaffold /usr/local/bin/
RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | /bin/bash
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && install kubectl /usr/local/bin/kubectl
RUN curl -fSL "https://github.com/genuinetools/img/releases/download/v0.5.11/img-linux-amd64" -o "/usr/local/bin/img" && chmod a+x "/usr/local/bin/img"

ADD fs/fake-docker-daemon.js .

RUN mkdir /source

WORKDIR /app

RUN ln -s $(which img) /usr/bin/docker

ENTRYPOINT [ "yarn", "run", "start", "/source", "--hostname", "0.0.0.0", "--port", "80" ]
