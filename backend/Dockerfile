FROM node:24-slim

# Install Chromium and all required system libraries
RUN apt-get update && apt-get install -y \
  chromium \
  libnspr4 \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpango-1.0-0 \
  libcairo2 \
  libdbus-1-3 \
  libgtk-3-0 \
  libx11-xcb1 \
  libxcb1 \
  libxss1 \
  libxtst6 \
  fonts-liberation \
  wget \
  xdg-utils \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the system Chromium instead of downloading its own
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .
COPY frontend/public/logo-kgrn.png ./assets/logo-kgrn.png

EXPOSE 5000

CMD ["npm", "start"]
