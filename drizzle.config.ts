import { defineConfig } from "drizzle-kit";

function getUrl(): string {
  if (
    process.env.PGHOST &&
    process.env.PGUSER &&
    process.env.PGPASSWORD &&
    process.env.PGDATABASE
  ) {
    const port = process.env.PGPORT || "5432";
    return `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}?sslmode=require`;
  }

  const raw =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DATABASE_URL;

  if (!raw) {
    throw new Error(
      "No database URL found. Set DATABASE_URL or provision a Replit PostgreSQL database.",
    );
  }

  return raw;
}

function normalizeUrl(url: string): string {
  const isSupabasePooler =
    url.includes("pooler.supabase.com") || url.includes(".pooler.supabase.co");
  if (!isSupabasePooler) return url;
  if (/[?&]sslmode=/.test(url)) {
    return url.replace(/([?&]sslmode=)[^&]*/g, "$1no-verify");
  }
  return url + (url.includes("?") ? "&" : "?") + "sslmode=no-verify";
}

const url = normalizeUrl(getUrl());

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url },
});
