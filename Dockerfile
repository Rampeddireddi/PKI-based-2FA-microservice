FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy all source code, including cron/ and scripts/
COPY . .

ENV NODE_ENV=production
ENV TZ=UTC

# Install cron + tzdata
RUN apt-get update && \
    apt-get install -y cron tzdata && \
    ln -fs /usr/share/zoneinfo/UTC /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    rm -rf /var/lib/apt/lists/*

# Ensure cron file permissions & register it
RUN chmod 644 cron/2fa-cron && crontab cron/2fa-cron

# Create mount points (will be bound to volumes)
RUN mkdir -p /data /cron

EXPOSE 8080

# Start cron daemon and your node server
CMD ["sh", "-c", "cron && node src/server.js"]
