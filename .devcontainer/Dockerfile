# Use Microsoft's official Node.js dev container image
# https://github.com/devcontainers/images/tree/main/src/javascript-node
FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Enable Corepack for pnpm/yarn management
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install Playwright system dependencies and common utilities
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
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

# Set the default user to 'node'
USER node
