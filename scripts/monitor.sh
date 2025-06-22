#!/usr/bin/env bash
set -euo pipefail

# Basic performance monitoring using PM2
pm2 status trainstation-dashboard || echo "Application not running"

# Display resource usage
pm2 monit
