import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse the DATABASE_URL to determine SSL requirements.
// Supabase (and most cloud Postgres providers) require SSL from external hosts
// such as Render. Without this, connections from Render receive:
//   "no pg_hba.conf entry for host ... SSL off"
// or "SSL connection is required".
// We enable SSL with rejectUnauthorized: false so self-signed or Supabase-managed
// certificates are accepted. This is safe for Supabase because the connection is
// still encrypted — rejectUnauthorized only skips CA chain validation.
const poolConfig: pg.PoolConfig = { connectionString: process.env.DATABASE_URL };

// Apply SSL unless the URL explicitly disables it via ?sslmode=disable
const disableSSL = process.env.DATABASE_URL.includes("sslmode=disable");
if (!disableSSL) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(poolConfig);

// Log connection errors immediately so Render logs show the exact Postgres error.
pool.on("error", (err) => {
  console.error("[DB Pool] Unexpected error on idle client:", err.message);
  console.error("[DB Pool] code:", (err as NodeJS.ErrnoException).code);
});

export const db = drizzle(pool, { schema });

export * from "./schema";
