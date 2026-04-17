import { Client } from "@replit/object-storage";

let cachedClient: Client | null = null;

export const GALLERY_KEY_PREFIX = "gallery/";
export const GALLERY_URL_PREFIX = "/api/gallery/media/";

export function getObjectStorageClient(): Client {
  if (!cachedClient) {
    cachedClient = new Client();
  }
  return cachedClient;
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
