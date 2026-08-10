import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dns from "node:dns";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const parsedUrl = new URL(process.env.DATABASE_URL);

// Fallback pooler IPv4 IP for Supabase connections on cloud hosts (like Render)
// that lack outbound IPv6 routing.
const SUPABASE_IPV4_POOLER_IP = "65.0.195.55";

const customLookup = (hostname: string, options: any, callback?: any) => {
  const cb = typeof options === "function" ? options : callback;
  if (hostname.includes("supabase.co") || hostname.includes("supabase.com")) {
    cb(null, SUPABASE_IPV4_POOLER_IP, 4);
  } else {
    dns.lookup(hostname, options, callback);
  }
};

const poolConfig: pg.PoolConfig & { lookup?: any } = {
  host: parsedUrl.hostname,
  port: Number(parsedUrl.port) || 5432,
  user: parsedUrl.username,
  password: decodeURIComponent(parsedUrl.password),
  database: parsedUrl.pathname.replace(/^\//, "") || "postgres",
  ssl: { rejectUnauthorized: false },
  lookup: customLookup,
};

export const pool = new Pool(poolConfig as any);

// Log connection errors immediately so Render logs show the exact Postgres error.
pool.on("error", (err) => {
  console.error("[DB Pool] Unexpected error on idle client:", err.message);
  console.error("[DB Pool] code:", (err as NodeJS.ErrnoException).code);
});

export const db = drizzle(pool, { schema });

export * from "./schema";


