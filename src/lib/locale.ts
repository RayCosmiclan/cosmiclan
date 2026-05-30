import { headers } from "next/headers";
import type { LocaleKey } from "@/components/public/cosmiclan-site-data";

const COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
] as const;

// Arab world → Amira Al-Mansoori (Arabic, RTL)
const ARAB = new Set([
  "SA",
  "AE",
  "QA",
  "KW",
  "BH",
  "OM", // GCC
  "JO",
  "LB",
  "SY",
  "IQ",
  "PS",
  "YE", // Levant + Iraq + Yemen
  "EG",
  "LY",
  "TN",
  "DZ",
  "MA",
  "SD",
  "MR", // North Africa
]);

// Europe (EU-27 + UK + EEA/EFTA) → Sofia Lindqvist (English)
const EUROPE = new Set([
  "AD",
  "AL",
  "AT",
  "BA",
  "BE",
  "BG",
  "BY",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FO",
  "FR",
  "GB",
  "GI",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MD",
  "ME",
  "MK",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "RS",
  "RU",
  "SE",
  "SI",
  "SK",
  "SM",
  "UA",
  "VA",
  "XK",
]);

const VALID_OVERRIDES = new Set<LocaleKey>(["default", "id", "ar", "eu"]);

function localeFromCountry(country: string | null): LocaleKey | null {
  if (!country) return null;
  const c = country.toUpperCase();
  if (c === "ID") return "id"; // Indonesia → Marsella
  if (ARAB.has(c)) return "ar"; // Arab world → Amira
  if (EUROPE.has(c)) return "eu"; // Europe → Sofia
  return "default"; // India (IN) + everything else → Gabriel
}

/**
 * Resolve which persona/locale to render.
 * `override` (e.g. ?face=ar) wins — for QA/preview, since localhost has no geo header.
 */
export async function getLocaleFromRequest(
  override?: string | null,
): Promise<LocaleKey> {
  if (override && VALID_OVERRIDES.has(override as LocaleKey)) {
    return override as LocaleKey;
  }
  try {
    const h = await headers();
    // Manual region pick (footer switcher) — persisted cookie beats IP geo.
    const cookie = h.get("cookie") || "";
    const picked = cookie.match(
      /(?:^|;\s*)cosmiclan-locale=(default|id|ar|eu)(?:;|$)/,
    );
    if (picked && VALID_OVERRIDES.has(picked[1] as LocaleKey)) {
      return picked[1] as LocaleKey;
    }
    for (const key of COUNTRY_HEADERS) {
      const matched = localeFromCountry(h.get(key));
      if (matched) return matched;
    }
    const accept = (h.get("accept-language") || "").toLowerCase();
    if (/(^|,)\s*id(-|;|,|$)/.test(accept)) return "id";
    if (/(^|,)\s*ar(-|;|,|$)/.test(accept)) return "ar";
  } catch {
    /* headers() unavailable in some contexts */
  }
  return "default";
}

export function isRtl(locale: LocaleKey): boolean {
  return locale === "ar";
}
