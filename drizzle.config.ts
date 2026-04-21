import { defineConfig } from "drizzle-kit";

const rawUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error(
    "SUPABASE_DATABASE_URL or DATABASE_URL must be set, ensure the database is provisioned",
  );
}

// Supabase Transaction Pooler uses an intermediate self-signed CA. sslmode=no-verify
// keeps TLS encryption while skipping chain verification (same as rejectUnauthorized:false).
function normalizeUrl(url: string): string {
  const isSupabasePooler =
    url.includes("pooler.supabase.com") || url.includes(".pooler.supabase.co");
  if (!isSupabasePooler) return url;
  if (/[?&]sslmode=/.test(url)) {
    return url.replace(/([?&]sslmode=)[^&]*/g, "$1no-verify");
  }
  return url + (url.includes("?") ? "&" : "?") + "sslmode=no-verify";
}

const url = normalizeUrl(rawUrl);

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url },
});
