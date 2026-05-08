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
import { getLocaleFromRequest } from "@/lib/locale";

export default async function AboutPage() {
  const locale = await getLocaleFromRequest();
  return (
    <AboutContent
      copy={ABOUT_COPY[locale]}
      leader={LEADER_PROFILES[locale]}
      team={TEAM_BY_LOCALE[locale]}
      loopSteps={PROCESS_DETAIL_BY_LOCALE[locale]}
      loopCopy={LOOP_COPY[locale]}
      services={SERVICES_BY_LOCALE[locale]}
      socialLinks={SOCIAL_LINKS_BY_LOCALE[locale]}
      contactCopy={CONTACT_COPY[locale]}
      timeLocale={locale}
    />
  );
}
