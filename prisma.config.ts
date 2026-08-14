import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI commands (migrate, db seed, studio) don't get Next.js's automatic
// .env.local loading, so load it explicitly here. Values already present from
// .env are not overwritten.
loadEnv({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Direct (non-pooled) connection: migrations run DDL, which doesn't play
    // well with Neon's pgbouncer pooler. The app itself uses the pooled URL
    // via the Neon driver adapter in src/lib/prisma.ts, not this value.
    url: process.env.POSTGRES_URL_NON_POOLING,
  },
});
