/**
 * User photo store for virtual try-on
 * Stores the user's uploaded photo (base64) in sessionStorage
 */

const STORAGE_KEY = "fitforit-tryon-photo";

export function getUserPhoto(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setUserPhoto(base64DataUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, base64DataUrl);
  } catch {
    // Storage might be full - base64 images can be large
  }
}

export function clearUserPhoto(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
