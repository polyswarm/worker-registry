FROM python:3.5
LABEL maintainer="PolySwarm Developers <info@polyswarm.io>"

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN set -x && apt-get update -y && apt-get install libgmp-dev -y
RUN set -x && pip install --no-cache-dir -r requirements.txt

COPY . .
RUN set -x && pip install .

CMD ["worker-registry"]
