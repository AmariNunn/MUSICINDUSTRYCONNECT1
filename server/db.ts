import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// DATABASE CONNECTION - Works with Replit PostgreSQL, Supabase, or any PostgreSQL provider
// Build connection string from Replit PG* vars if available, otherwise use DATABASE_URL
function getConnectionString(): string {
  // Check for Replit-provided database first
  if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
    const port = process.env.PGPORT || '5432';
    return `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
  }
  // Fallback to DATABASE_URL
  return process.env.NEW_DATABASE_URL || process.env.DATABASE_URL || '';
}

const connectionString = getConnectionString();

if (!connectionString) {
  throw new Error(
    "Database connection not configured. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
