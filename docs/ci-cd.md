# CI/CD & Deployment Guide - Train Station Dashboard

## Overview
This guide explains how the project is built, tested and deployed to production.
It complements the existing security documentation and admin guide.

## GitHub Actions Workflow
The repository includes `.github/workflows/ci.yml` which performs the following:

1. **Install dependencies** using `npm ci`.
2. **Run linting** via `npm run lint`.
3. **Execute tests** using `npm test`.
4. **Build the application** with `npm run build`.
5. **Deploy** to production by executing `scripts/deploy.sh` when changes land on `main`.

## Production Environment
A new `env.production.template` file provides a starting point for production
configuration. Copy it to `.env.production` and supply real credentials. The
`scripts/setup-production.sh` script installs dependencies, runs security audits
and builds the project.

## Performance Monitoring
The deployment scripts use **PM2** to keep the application running and to collect
basic metrics. Run `./scripts/monitor.sh` to view real-time CPU and memory usage.

## Security Hardening
During setup, `npm audit fix --force` is executed to patch vulnerable packages
where possible. Additional hardening steps are documented in
`docs/security/SECURITY_IMPLEMENTATION_GUIDE.md`.
