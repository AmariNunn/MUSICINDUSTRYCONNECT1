import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// DATABASE CONNECTION - Prefers SUPABASE_DATABASE_URL if set, then Replit PostgreSQL
function getConnectionString(): string {
  // Use Supabase if configured
  if (process.env.SUPABASE_DATABASE_URL) {
    return process.env.SUPABASE_DATABASE_URL;
  }
  // Fallback to Replit built-in PostgreSQL
  if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
    const port = process.env.PGPORT || '5432';
    return `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
  }
  return process.env.DATABASE_URL || '';
}

const connectionString = getConnectionString();

if (!connectionString) {
  throw new Error(
    "Database connection not configured. Did you forget to provision a database?",
  );
}

const needsSsl =
  connectionString.includes("supabase.co") ||
  connectionString.includes("neon.tech") ||
  /[?&]sslmode=require/i.test(connectionString);
export const pool = new Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });
