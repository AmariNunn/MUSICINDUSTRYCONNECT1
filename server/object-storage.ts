import { Client } from "@replit/object-storage";

let cachedClient: Client | null = null;

export function getObjectStorageClient(): Client {
  if (!cachedClient) {
    cachedClient = new Client();
  }
  return cachedClient;
}

export function isObjectStorageConfigured(): boolean {
  return Boolean(
    process.env.REPLIT_DB_URL ||
      process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID ||
      process.env.REPL_ID,
  );
}
