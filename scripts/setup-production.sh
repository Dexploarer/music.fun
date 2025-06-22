#!/usr/bin/env bash
set -euo pipefail

# Setup production environment for Train Station Dashboard
# Installs dependencies and configures monitoring/security tools.

npm ci --omit=dev

# Perform security audit and attempt automatic fixes
npm audit fix --force || true

# Install PM2 for process management and monitoring
npm install -g pm2
pm2 install pm2-logrotate

# Build the project
npm run build

echo "Production setup complete"
