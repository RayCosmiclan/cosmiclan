import { headers } from "next/headers";
import type { LocaleKey } from "@/components/public/cosmiclan-site-data";

const ID_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
] as const;

function pickLocaleFromCountry(country: string | null): LocaleKey | null {
  if (!country) return null;
  return country.toLowerCase() === "id" ? "id" : null;
}

function pickLocaleFromAcceptLanguage(value: string | null): LocaleKey | null {
  if (!value) return null;
  const tags = value
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);
  for (const tag of tags) {
    if (tag === "id" || tag.startsWith("id-")) return "id";
  }
  return null;
}

export async function getLocaleFromRequest(): Promise<LocaleKey> {
  try {
    const h = await headers();
    for (const key of ID_HEADERS) {
      const country = h.get(key);
      const matched = pickLocaleFromCountry(country);
      if (matched) return matched;
    }
    const accept = h.get("accept-language");
    const fromAccept = pickLocaleFromAcceptLanguage(accept);
    if (fromAccept) return fromAccept;
  } catch {
    /* noop — headers() unavailable in some contexts */
  }
  return "default";
}
