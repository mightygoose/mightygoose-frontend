FROM node:14

RUN curl -L https://github.com/DarthSim/hivemind/releases/download/v1.1.0/hivemind-v1.1.0-linux-386.gz > /tmp/hivemind.gz
RUN gunzip -c /tmp/hivemind.gz > /tmp/hivemind
RUN chmod +x /tmp/hivemind

WORKDIR /app
COPY package.json /app
RUN npm install
COPY . .
RUN npm run postinstall

CMD /tmp/hivemind

