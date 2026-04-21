import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

function getConnectionString(): string {
  const hasAnySupabaseSecret = Boolean(
    process.env.SUPABASE_DATABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  if (hasAnySupabaseSecret) {
    if (!process.env.SUPABASE_DATABASE_URL) {
      throw new Error(
        "Supabase secrets are configured but SUPABASE_DATABASE_URL is missing. " +
          "Set SUPABASE_DATABASE_URL to the Supabase Postgres connection string " +
          "(Project Settings → Database → Connection string, Transaction Pooler URI) " +
          "before starting the server. Refusing to fall back to the Replit database.",
      );
    }
    return process.env.SUPABASE_DATABASE_URL;
  }

  if (
    process.env.PGHOST &&
    process.env.PGUSER &&
    process.env.PGPASSWORD &&
    process.env.PGDATABASE
  ) {
    const port = process.env.PGPORT || "5432";
    return `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
  }
  return process.env.DATABASE_URL || "";
}

const rawConnectionString = getConnectionString();

if (!rawConnectionString) {
  throw new Error(
    "Database connection not configured. Did you forget to provision a database?",
  );
}

// Supabase's Transaction Pooler (PgBouncer) uses an intermediate self-signed CA
// in its certificate chain, which Node.js TLS rejects even with rejectUnauthorized:false.
// sslmode=no-verify keeps the connection encrypted over TLS while skipping chain
// verification — the same security posture as rejectUnauthorized:false on other providers.
function normalizeConnectionString(url: string): string {
  const isSupabasePooler =
    url.includes("pooler.supabase.com") || url.includes(".pooler.supabase.co");
  if (!isSupabasePooler) return url;

  // Replace any existing sslmode with no-verify
  if (/[?&]sslmode=/.test(url)) {
    return url.replace(/([?&]sslmode=)[^&]*/g, "$1no-verify");
  }
  // Append sslmode=no-verify
  return url + (url.includes("?") ? "&" : "?") + "sslmode=no-verify";
}

const connectionString = normalizeConnectionString(rawConnectionString);

const isSupabasePooler =
  rawConnectionString.includes("pooler.supabase.com") ||
  rawConnectionString.includes(".pooler.supabase.co");

const needsSslObject =
  !isSupabasePooler &&
  (rawConnectionString.includes("supabase.co") ||
    rawConnectionString.includes("supabase.com") ||
    rawConnectionString.includes("neon.tech") ||
    /[?&]sslmode=require/i.test(rawConnectionString));

export const pool = new Pool({
  connectionString,
  ssl: needsSslObject ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });

// Verify the DB is reachable at startup — fail fast rather than at first request.
pool.query("SELECT 1").catch((err: Error) => {
  console.error(
    "[db] Startup health check failed — cannot reach database:",
    err.message,
  );
  process.exit(1);
});
