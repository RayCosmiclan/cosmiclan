export const COSMICLAN_PUBLIC_SEEN_COOKIE = "cosmiclan_public_seen";

const SESSION_KEY = "cosmiclan:public-seen";

export function hasSeenCosmiclanPublic() {
  if (typeof window === "undefined") return false;

  try {
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") return true;
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }

  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim() === `${COSMICLAN_PUBLIC_SEEN_COOKIE}=1`);
}

export function markCosmiclanPublicSeen() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Cookie fallback below still covers normal page transitions.
  }

  document.cookie = `${COSMICLAN_PUBLIC_SEEN_COOKIE}=1; path=/; SameSite=Lax`;
}
