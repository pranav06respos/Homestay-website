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

// Fallback pooler IPs for Supabase IPv4 compatibility on cloud hosts (like Render)
// that lack outbound IPv6 routing.
const SUPABASE_IPV4_FALLBACKS = [
  "65.0.195.55",    // ap-south-1 (Mumbai)
  "44.208.221.186", // us-east-1 (N. Virginia)
  "18.198.30.239",  // eu-central-1 (Frankfurt)
];

let cachedPoolerIp: string | null = null;

function resolveIPv4Pooler(callback: (ip: string) => void) {
  if (cachedPoolerIp) {
    return callback(cachedPoolerIp);
  }
  dns.resolve4("aws-0-ap-south-1.pooler.supabase.com", (err, addresses) => {
    if (!err && addresses && addresses.length > 0) {
      cachedPoolerIp = addresses[0];
    } else {
      cachedPoolerIp = SUPABASE_IPV4_FALLBACKS[0];
    }
    callback(cachedPoolerIp);
  });
}

const customLookup = (hostname: string, options: any, callback: any) => {
  // If Node is attempting to connect to a direct Supabase host (which has IPv6 AAAA only),
  // route the TCP connection via Supabase's IPv4 pooler gateway while preserving the TLS SNI header.
  if (hostname.includes("supabase.co") || hostname.includes("supabase.com")) {
    resolveIPv4Pooler((ip) => {
      callback(null, ip, 4);
    });
  } else {
    dns.lookup(hostname, options, callback);
  }
};

const poolConfig: pg.PoolConfig & { lookup?: any } = {
  connectionString: process.env.DATABASE_URL,
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

