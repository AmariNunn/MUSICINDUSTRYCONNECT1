import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

function getConnectionString(): string {
  // Prefer Replit's always-available built-in PostgreSQL when its env vars are present.
  // This avoids dependency on external services (e.g. Supabase) that may be paused.
  if (
    process.env.PGHOST &&
    process.env.PGUSER &&
    process.env.PGPASSWORD &&
    process.env.PGDATABASE
  ) {
    const port = process.env.PGPORT || "5432";
    return `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
  }

  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Fall back to Supabase if no built-in DB is configured.
  if (process.env.SUPABASE_DATABASE_URL) {
    return process.env.SUPABASE_DATABASE_URL;
  }

  throw new Error(
    "Database connection not configured. Provision a Replit PostgreSQL database or set DATABASE_URL.",
  );
}

const rawConnectionString = getConnectionString();

function normalizeConnectionString(url: string): string {
  const isSupabasePooler =
    url.includes("pooler.supabase.com") || url.includes(".pooler.supabase.co");
  if (!isSupabasePooler) return url;
  if (/[?&]sslmode=/.test(url)) {
    return url.replace(/([?&]sslmode=)[^&]*/g, "$1no-verify");
  }
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

pool.query("SELECT 1").catch((err: Error) => {
  console.error(
    "[db] Startup health check failed — cannot reach database:",
    err.message,
  );
  process.exit(1);
});
