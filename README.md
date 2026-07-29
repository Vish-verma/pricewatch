# PriceWatch

Track prices on product pages, get alerted when they drop.

## Stack
Next.js · TypeScript · Drizzle · Postgres · Hono · RabbitMQ · Better Auth

## Local development

Requires Node 22+, pnpm 10+, Docker.

\`\`\`bash
pnpm install
cp .env.example .env
pnpm db:up
\`\`\`

- Postgres: `localhost:5432`
- RabbitMQ management UI: http://localhost:15672 (pricewatch / localdev)

## Structure

\`\`\`
apps/web         Next.js dashboard + API
apps/worker      Scrape worker (Hono)
apps/scheduler   Cron ticker
packages/db      Drizzle schema + client
packages/schemas Shared Zod schemas
packages/queue   RabbitMQ helpers
\`\`\`

## Status
🚧 In progress — see /docs for architecture notes.