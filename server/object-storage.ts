import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const GALLERY_KEY_PREFIX = "gallery/";
export const GALLERY_URL_PREFIX = "/api/gallery/media/";
export const GALLERY_BUCKET = "gallery";

let cachedClient: SupabaseClient | null = null;

function getSupabaseStorage(): SupabaseClient {
  if (!cachedClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Supabase storage is not configured: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
      );
    }
    cachedClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedClient;
}

export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export interface GalleryStorageClient {
  upload(key: string, body: Buffer, contentType?: string): Promise<StorageResult<true>>;
  downloadAsBytes(key: string): Promise<StorageResult<Buffer>>;
  delete(key: string): Promise<StorageResult<true>>;
}

async function ensureBucket(supabase: SupabaseClient): Promise<void> {
  const { data, error } = await supabase.storage.getBucket(GALLERY_BUCKET);
  if (data) return;
  if (error && !/not.?found|does not exist/i.test(error.message)) {
    // Some other error — surface it.
    throw new Error(`Failed to inspect storage bucket: ${error.message}`);
  }
  const { error: createErr } = await supabase.storage.createBucket(GALLERY_BUCKET, {
    public: false,
  });
  if (createErr && !/already exists/i.test(createErr.message)) {
    throw new Error(`Failed to create storage bucket: ${createErr.message}`);
  }
}

let bucketReady: Promise<void> | null = null;
function ensureBucketOnce(supabase: SupabaseClient): Promise<void> {
  if (!bucketReady) {
    bucketReady = ensureBucket(supabase).catch((err) => {
      bucketReady = null;
      throw err;
    });
  }
  return bucketReady;
}

export function getObjectStorageClient(): GalleryStorageClient {
  const supabase = getSupabaseStorage();
  return {
    async upload(key, body, contentType) {
      try {
        await ensureBucketOnce(supabase);
        const { error } = await supabase.storage
          .from(GALLERY_BUCKET)
          .upload(key, body, {
            contentType: contentType ?? "application/octet-stream",
            upsert: false,
          });
        if (error) return { ok: false, error: error.message };
        return { ok: true, value: true };
      } catch (err: any) {
        return { ok: false, error: err?.message ?? String(err) };
      }
    },
    async downloadAsBytes(key) {
      try {
        const { data, error } = await supabase.storage
          .from(GALLERY_BUCKET)
          .download(key);
        if (error || !data) return { ok: false, error: error?.message ?? "Not found" };
        const arrayBuffer = await data.arrayBuffer();
        return { ok: true, value: Buffer.from(arrayBuffer) };
      } catch (err: any) {
        return { ok: false, error: err?.message ?? String(err) };
      }
    },
    async delete(key) {
      try {
        const { error } = await supabase.storage
          .from(GALLERY_BUCKET)
          .remove([key]);
        if (error) return { ok: false, error: error.message };
        return { ok: true, value: true };
      } catch (err: any) {
        return { ok: false, error: err?.message ?? String(err) };
      }
    },
  };
}

export function isGalleryKey(key: string): boolean {
  return (
    typeof key === "string" &&
    key.startsWith(GALLERY_KEY_PREFIX) &&
    !key.includes("..") &&
    /^[A-Za-z0-9_\-./]+$/.test(key)
  );
}

export function galleryUrlToKey(url: string): string | null {
  if (!url.startsWith(GALLERY_URL_PREFIX)) return null;
  const key = url.slice(GALLERY_URL_PREFIX.length);
  return isGalleryKey(key) ? key : null;
}

export async function deleteGalleryObject(key: string): Promise<void> {
  if (!isGalleryKey(key)) return;
  try {
    await getObjectStorageClient().delete(key);
  } catch {
    // best-effort: don't fail post deletion on missing/blob errors
  }
}
