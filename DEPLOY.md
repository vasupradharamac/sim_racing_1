# Deploying to Cloudflare

This app is now a single Cloudflare Worker: the built React app is served as static
assets, and `/api/*` requests are handled by the Worker script in `worker/index.ts`,
backed by a Cloudflare D1 database.

I can't run these steps myself — this environment's network policy blocks outbound
requests to Cloudflare's API — so run the following from your own machine.

## 0. One-time setup

```bash
npm install
npx wrangler login
```

This opens a browser to authorize the Wrangler CLI against your Cloudflare account.

## 1. Create the D1 database

```bash
npx wrangler d1 create sim-racing-h2h-db
```

This prints a `database_id`. Copy it and paste it into `wrangler.jsonc`, replacing
`REPLACE_WITH_YOUR_D1_DATABASE_ID`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "sim-racing-h2h-db",
    "database_id": "paste-the-real-id-here"
  }
]
```

## 2. Apply the schema and seed data

The `migrations/` folder has two files:
- `0001_init.sql` — creates the `races` table.
- `0002_seed_data.sql` — the current race history (13 races through 2026-07-04,
  taken from `races_backup.json` — the Railway volume itself was no longer reachable
  to pull anything more recent since the trial had already ended and the container
  wasn't running).

Apply both to the **remote** (production) database:

```bash
npm run db:migrate:remote
```

If you log any new races between now and when this goes live, add them by hand
afterwards (either through the app's "Log New Race Result" form once deployed, or
by appending `INSERT OR IGNORE` rows to a new migration file).

## 3. Build and deploy

```bash
npm run deploy
```

This runs `vite build` (bundling the frontend into `dist/client`) and then
`wrangler deploy`, which publishes the Worker + static assets + D1 binding as one
unit. Wrangler will print the `*.workers.dev` URL your app is now live at.

## 4. (Optional) Custom domain

If you want this on your own domain instead of `*.workers.dev`:

```bash
npx wrangler deployments list   # sanity check the deploy went out
npx wrangler domains add yourdomain.com
```

Or attach a route to an existing zone via the Cloudflare dashboard
(Workers & Pages → your worker → Settings → Domains & Routes).

## Everyday development after this point

- `npm run dev` — local full-stack dev server (frontend + Worker + local D1).
- `npm run db:migrate:local` — apply new migrations to your local D1 database.
- `npm run db:migrate:remote` — apply new migrations to production.
- `npm run deploy` — build and ship to Cloudflare.

## Verifying data after deploy

```bash
npx wrangler d1 execute sim-racing-h2h-db --remote --command "SELECT count(*) FROM races;"
```

Should return 13 (or more, if you've logged new races since).
