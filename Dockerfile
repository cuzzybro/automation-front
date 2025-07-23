FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM alpine:3.20

RUN apk add --no-cache openjdk21-jre nodejs npm

ENV JMETER_VERSION=5.6.3

RUN wget https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz -O /tmp/jmeter.tgz \
    && tar -xzf /tmp/jmeter.tgz -C /opt \
    && rm /tmp/jmeter.tgz \
    && ln -s /opt/apache-jmeter-${JMETER_VERSION} /opt/jmeter

ENV PATH=/opt/jmeter/bin:$PATH

WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/test_suite ./test_suite
COPY --from=build /app/lib ./lib
COPY --from=build /app/public ./public

COPY package*.json ./
RUN npm install --production

EXPOSE 3000

VOLUME /jmeter-data

ENV JMETER_TEST_DIR=/jmeter-data

CMD [ "npm", "run", "start" ]

