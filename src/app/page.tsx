import { CosmiclanLanding } from "@/components/public/cosmiclan-landing";
import { COSMICLAN_PUBLIC_SEEN_COOKIE } from "@/components/public/cosmiclan-public-session";
import {
  CATEGORY_LABELS,
  LANDING_COPY,
  LAYOUT_LABELS,
} from "@/components/public/cosmiclan-site-data";
import { getLocaleFromRequest } from "@/lib/locale";
import { cookies } from "next/headers";

const SPLASH_VARIANTS = [
  "stars",
  "tunnel",
  "matrix",
  "grid",
  "pulse",
  "type",
] as const;
type SplashVariant = (typeof SPLASH_VARIANTS)[number];

function pickSplashVariant(value: unknown): SplashVariant | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return undefined;
  return SPLASH_VARIANTS.find((v) => v === raw);
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocaleFromRequest();
  const sp = (await searchParams) ?? {};
  const splashOverride = pickSplashVariant(sp.splash);
  const cookieStore = await cookies();
  const hasSeenPublicSite =
    cookieStore.get(COSMICLAN_PUBLIC_SEEN_COOKIE)?.value === "1";

  return (
    <CosmiclanLanding
      copy={LANDING_COPY[locale]}
      categoryLabels={CATEGORY_LABELS[locale]}
      layoutLabels={LAYOUT_LABELS[locale]}
      initialShowSplash={splashOverride !== undefined || !hasSeenPublicSite}
      splashVariant={splashOverride}
    />
  );
}
