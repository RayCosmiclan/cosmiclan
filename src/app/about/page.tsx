import { pick } from "@/components/public/cosmiclan-site-data";
import {
  ABOUT_COPY,
  CONTACT_COPY,
  LEADER_PROFILES,
  LOOP_COPY,
  PROCESS_DETAIL_BY_LOCALE,
  SERVICES_BY_LOCALE,
  SOCIAL_LINKS_BY_LOCALE,
  TEAM_BY_LOCALE,
} from "@/components/public/cosmiclan-site-data";
import { AboutContent } from "@/components/public/about-content";
import { getLocaleFromRequest, isRtl } from "@/lib/locale";

export default async function AboutPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const locale = await getLocaleFromRequest(
    typeof sp.face === "string" ? sp.face : null,
  );
  return (
    <div dir={isRtl(locale) ? "rtl" : "ltr"}>
      <AboutContent
        copy={pick(ABOUT_COPY, locale)}
        leader={pick(LEADER_PROFILES, locale)}
        team={pick(TEAM_BY_LOCALE, locale)}
        loopSteps={pick(PROCESS_DETAIL_BY_LOCALE, locale)}
        loopCopy={pick(LOOP_COPY, locale)}
        services={pick(SERVICES_BY_LOCALE, locale)}
        socialLinks={pick(SOCIAL_LINKS_BY_LOCALE, locale)}
        contactCopy={pick(CONTACT_COPY, locale)}
        timeLocale={locale}
      />
    </div>
  );
}
