# Use Microsoft's official Node.js dev container image
# https://github.com/devcontainers/images/tree/main/src/javascript-node
FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Pin pnpm to match package.json packageManager (reproducible installs)
ARG PNPM_VERSION=10.28.2
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Install Chromium for Karma (ChromeHeadless) and Playwright system deps + utilities
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    chromium \
    # Playwright browser dependencies
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libxshmfence1 \
    # Development tools
    vim \
    htop \
    tree \
    bash-completion \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Karma ChromeHeadless: use Chromium when CHROME_BIN not set
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

USER node
