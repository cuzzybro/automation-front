# Start with Node.js 23 Alpine base image
FROM node:23-alpine

# Install necessary tools and Azul Zulu OpenJDK 21 JRE
RUN apk add --no-cache curl && \
    curl -fsSL https://cdn.azul.com/zulu/bin/zulu21.36.17-ca-jre21.0.4-linux_musl_x64.tar.gz | tar -xz -C /opt && \
    ln -s /opt/zulu21.36.17-ca-jre21.0.4-linux_musl_x64 /opt/jre && \
    apk del curl && \
    rm -rf /var/cache/apk/*

# Install JMeter 5.6.3
RUN apk add --no-cache curl && \
    curl -fsSL https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.6.3.tgz | tar -xz -C /opt && \
    ln -s /opt/apache-jmeter-5.6.3 /opt/jmeter && \
    apk del curl && \
    rm -rf /var/cache/apk/*

# Set environment variables for Java and JMeter
ENV JAVA_HOME=/opt/jre
ENV PATH=$JAVA_HOME/bin:/opt/jmeter/bin:$PATH

# Verify installations
# RUN node --version && \
#     npm --version && \
#     java --version && \
#     jmeter --version

# Set working directory
WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
