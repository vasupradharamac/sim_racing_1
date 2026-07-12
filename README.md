# H2H Telemetry — Sim Racing Head-to-Head Dashboard

A head-to-head dashboard for Harish and Shabesh tracking race history, scoreboards, and track records across F1, Assetto Corsa, and Automobilista 2.

Runs as a single Cloudflare Worker: a React/Vite frontend served as static assets, backed by a small Worker API and a Cloudflare D1 (SQLite) database.

## Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev
```

This uses the Cloudflare Vite plugin, which runs the full stack (frontend + Worker API + a local D1 database) in one dev server. On first run, apply the schema/seed data to the local database:

```bash
npm run db:migrate:local
```

## Deploy to Cloudflare

See [DEPLOY.md](DEPLOY.md) for the full step-by-step deployment guide.
