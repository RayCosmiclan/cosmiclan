import { AGENTS } from "@/lib/agents";
import { TEMPLATES } from "./cosmiclan-templates";

export type LocaleKey = "default" | "id" | "ar" | "eu";
/** Localized record: always has `default`; other locales optional → fall back to default. */
export type L10n<T> = Partial<Record<LocaleKey, T>> & { default: T };
export function pick<T>(rec: L10n<T>, locale: LocaleKey): T {
  return rec[locale] ?? rec.default;
}

type LeaderVenture = { name: string; role: string; description: string };
type LeaderFact = { label: string; value: string };

export const LEADER_PROFILES: L10n<{
  name: string;
  role: string;
  focus: string;
  image: string;
  bio: string[];
  location: { city: string; country: string; line: string };
  ventures: LeaderVenture[];
  facts: LeaderFact[];
  venturesHeading: string;
  backgroundHeading: string;
}> = {
  default: {
    name: "Gabriel Antony Xaviour",
    role: "Founder and main orchestrator",
    focus:
      "22-year-old serial launcher building from Chennai. Founder of Larinova, growth lead at Rax Tech, and operator of Cosmiclan, a personal brand and operating system fronted by eight specialized AI agents.",
    image: "/images/team/gabriel.png",
    bio: [
      "Gabriel is a 22-year-old serial launcher and full-stack, AI-first builder based in Chennai. Cosmiclan is his personal brand and operating layer. Eight specialized AI agents (Marty, Ray, Aryaa, Donna, Ryuzaki, Stark, Todo, Jennie) front the public surfaces while Gabriel sets the taste bar, makes the calls, and ships the products.",
      "Three concurrent work streams run inside Cosmiclan. Larinova is his Chennai-registered AI medical automation company, building an AI scribe with native Indian language support for doctors, hospitals, and institutions. At Rax Tech, his father's 25-year-old hardware company, he leads growth and is shipping an internal tools suite: project and task management, Cosmiclaus (production pipeline management for hardware products through delivery), and an operations app spanning sales, HR, purchase, accounts, stores, general admin, and IT. He also runs a focused freelance and agency practice building landing pages, websites, and apps for select clients.",
      "The strategy is serial launcher discipline: take one business to profitability before starting the next, targeting eight businesses across his lifetime. Strong pull toward AI-powered sales and growth systems for small and mid-scale businesses. Hackathons are an active R&D lane. Most builds there are early prototypes of businesses queued behind the launcher pipeline.",
      "Workstation is Apple Vision Pro plus MacBook. Communication style is peer co-founder energy. Sharp answers over safe ones, pushback over hedging, no fluff.",
    ],
    location: {
      city: "Chennai",
      country: "India",
      line: "Based in Chennai, India. Building for the internet, for local companies, and for global operators.",
    },
    venturesHeading: "What I am building",
    ventures: [
      {
        name: "Larinova",
        role: "Founder",
        description:
          "AI medical automation from Chennai. Flagship is an AI scribe with native Indian language support for doctors and hospitals.",
      },
      {
        name: "Rax Tech",
        role: "Growth lead and product builder",
        description:
          "25-year-old hardware company. Building the internal tools stack: project management, Cosmiclaus production pipeline, and ops app.",
      },
      {
        name: "Cosmiclan",
        role: "Founder",
        description:
          "Selective freelance and agency practice. Landing pages, sites, web and mobile apps for clients who want shipping speed and taste.",
      },
      {
        name: "Hackathons",
        role: "Serial Developer",
        description:
          "Active hackathon participant. Most builds are early prototypes of businesses queued behind the serial launcher pipeline.",
      },
    ],
    backgroundHeading: "Background",
    facts: [
      {
        label: "Education",
        value:
          "BE Electronics and Communication, Loyola ICAM College of Engineering, Chennai (2020–2024)",
      },
      {
        label: "Experience",
        value:
          "Solutions Engineer at Marlin · Project Manager and Growth at Rax Tech · Blockchain Engineer at Hotpot",
      },
      { label: "Hackathons", value: "80+ wins" },
      { label: "Travel", value: "20+ countries" },
      {
        label: "Web3",
        value:
          "4+ years across Ethereum, Solana, and other ecosystems · ENS gabrielaxy.eth",
      },
      {
        label: "Strategy",
        value:
          "Serial launcher. One business to profitability before the next.",
      },
    ],
  },
  id: {
    name: "Marsella Maria Goretti Sebayang",
    role: "Pendiri dan orkestrator utama",
    focus:
      "Pendiri Cosmiclan dari Jakarta. Membangun studio creator-tech buatan Indonesia yang dirancang untuk skala global, dengan delapan creator AI sebagai lapisan operasional publik.",
    image: "/images/team/marsella.png",
    bio: [
      "Marsella adalah pemimpin dan orkestrator utama Cosmiclan. Asli Indonesia, lahir dan besar di Jakarta, ia membangun Cosmiclan sebagai brand lokal Indonesia yang berskala global. Delapan creator AI (Marty, Ray, Aryaa, Donna, Ryuzaki, Stark, Todo, Jennie) menjalankan lapisan publik, sementara Marsella menentukan arah, menjaga selera, dan memutuskan apa yang layak dirilis.",
      "Cosmiclan adalah studio creator-tech end-to-end: software, film, fotografi, brand, dan growth dibangun di satu atap. Lane utamanya saat ini meliputi produk perangkat lunak untuk klinik dan UMKM Indonesia, sistem internal untuk operasional perusahaan keluarga dan mitra B2B, serta praktik agensi terpilih untuk landing page, situs, dan aplikasi.",
      "Strateginya adalah disiplin serial launcher. Satu bisnis dibawa ke profit sebelum memulai yang berikutnya, dengan target delapan bisnis sepanjang karier. Fokus kuat pada sistem sales dan growth bertenaga AI untuk usaha kecil dan menengah Indonesia, dan partisipasi aktif di kompetisi creator dan hackathon regional sebagai jalur eksperimen produk.",
      "Workstation: Apple Vision Pro dan MacBook. Gaya komunikasi: nada co-founder peer. Jawaban tajam dibanding aman, dorongan balik dibanding berhati-hati berlebihan, tanpa basa-basi.",
    ],
    location: {
      city: "Jakarta",
      country: "Indonesia",
      line: "Berbasis di Jakarta, Indonesia. Brand lokal Indonesia yang dibangun untuk skala global, untuk creator, perusahaan lokal, dan operator dunia.",
    },
    venturesHeading: "Yang sedang dibangun",
    ventures: [
      {
        name: "Produk software",
        role: "Founder",
        description:
          "Otomasi bertenaga AI untuk klinik, UMKM, dan institusi Indonesia. Produk unggulan saat ini adalah AI scribe medis dengan dukungan bahasa lokal.",
      },
      {
        name: "Sistem internal B2B",
        role: "Pemimpin produk",
        description:
          "Suite alat internal yang mencakup manajemen tugas dan proyek, pipeline produksi hardware, serta aplikasi operasional lintas penjualan, HR, pembelian, akunting, gudang, dan IT.",
      },
      {
        name: "Cosmiclan",
        role: "Founder",
        description:
          "Praktik agensi terpilih yang mengerjakan landing page, situs, web app, dan aplikasi mobile untuk klien yang menginginkan kecepatan rilis plus pertimbangan produk.",
      },
      {
        name: "Hackathon",
        role: "Founder",
        description:
          "Partisipan aktif kompetisi dan hackathon. Sebagian besar build adalah prototipe awal dari bisnis yang antre di pipeline serial launcher.",
      },
    ],
    backgroundHeading: "Latar belakang",
    facts: [
      { label: "Domisili", value: "Jakarta, Indonesia" },
      {
        label: "Disiplin",
        value:
          "Software, motion, fotografi, brand, dan sistem growth dikerjakan ujung ke ujung",
      },
      {
        label: "Kompetisi",
        value: "Aktif di hackathon dan kompetisi creator regional",
      },
      {
        label: "Web3",
        value: "Pengalaman lintas ekosistem Ethereum, Avalanche, dan lainnya",
      },
      {
        label: "Strategi",
        value: "Serial launcher. Satu bisnis ke profit sebelum berikutnya.",
      },
    ],
  },
  eu: {
    name: "Sofia Lindqvist",
    role: "Founder and main orchestrator",
    focus:
      "Stockholm-born, Amsterdam-based founder of Cosmiclan — a creator-tech studio shipping premium, fast websites and brand systems, fronted by eight specialized AI agents.",
    image: "/images/team/sofia.png",
    bio: [
      "Sofia is the founder and main orchestrator of Cosmiclan. Born in Stockholm and based in Amsterdam, she built Cosmiclan to give startups and growing brands agency-grade web and design at honest speed and price. Eight specialized AI agents (Marty, Ray, Aryaa, Donna, Ryuzaki, Stark, Todo, Jennie) run the public surfaces while Sofia sets the taste bar and decides what ships.",
      "Cosmiclan is an end-to-end creator-tech studio: software, web, brand, motion, and growth under one roof. Its current lanes are a selective web and app practice for founders who want shipping speed plus product taste, and AI-assisted growth systems for small and mid-scale businesses across Europe.",
      "Before Cosmiclan, Sofia spent a decade in European product and design — leading web and brand for consumer startups and scaling a design studio. She works the way Northern-European product teams do: crisp, direct, evidence over opinion, no fluff.",
      "Communication style: clear and warm, with a designer's eye. Sharp answers over safe ones, and a bias toward shipping.",
    ],
    location: {
      city: "Amsterdam",
      country: "Netherlands",
      line: "Based in Amsterdam. Building for European founders, for local companies, and for global operators.",
    },
    venturesHeading: "What I am building",
    ventures: [
      {
        name: "Cosmiclan",
        role: "Founder",
        description:
          "Creator-tech studio. Premium websites, apps, and brand systems for clients who want speed and taste.",
      },
      {
        name: "Nordlys Studio",
        role: "Founder",
        description:
          "Stockholm–Amsterdam design studio. Brand and product design for European startups and consumer brands.",
      },
      {
        name: "Growth systems",
        role: "Product lead",
        description:
          "AI-assisted sales and growth tooling for small and mid-scale businesses across Europe.",
      },
      {
        name: "Design community",
        role: "Speaker",
        description:
          "Active in the European design and product community; talks on craft, speed, and shipping.",
      },
    ],
    backgroundHeading: "Background",
    facts: [
      {
        label: "Education",
        value:
          "MSc Interaction Design, KTH Royal Institute of Technology, Stockholm",
      },
      {
        label: "Experience",
        value:
          "Design lead at European product studios · scaled a consumer SaaS · founder of Nordlys Studio",
      },
      {
        label: "Focus",
        value: "Web, brand, and growth systems shipped end to end",
      },
      {
        label: "Reach",
        value: "Worked with teams across the EU, UK, and Nordics",
      },
      {
        label: "Strategy",
        value: "Ship fast, keep taste high, prove value before scaling.",
      },
    ],
  },
  ar: {
    name: "أميرة المنصوري",
    role: "المؤسِّسة والمنسِّقة الرئيسية",
    focus:
      "مؤسِّسة كوزميكلان من دبي — استوديو إبداعي تقني يبني مواقع ويب وأنظمة هوية بصرية سريعة وعالية الجودة، تُديرها ثمانية وكلاء ذكاء اصطناعي متخصّصون.",
    image: "/images/team/amira.png",
    bio: [
      "أميرة هي المؤسِّسة والمنسِّقة الرئيسية لكوزميكلان. وُلدت ونشأت في دبي، وبنت كوزميكلان لتقدّم للشركات الصغيرة والمتوسّطة في الخليج مواقع ويب وتصميمًا بمستوى الوكالات الكبرى وبسرعة وسعر عادلَين. يتولّى ثمانية وكلاء ذكاء اصطناعي الواجهات العامة، بينما تضع أميرة معيار الذوق وتقرّر ما الذي يُطلَق.",
      "كوزميكلان استوديو إبداعي تقني متكامل: برمجيات، ويب، هوية بصرية، موشن، ونموّ تحت سقف واحد. مساراته الحالية تشمل ممارسة مختارة لتصميم المواقع والتطبيقات، وأنظمة مبيعات ونموّ مدعومة بالذكاء الاصطناعي للشركات في منطقة الخليج.",
      "قبل كوزميكلان، أمضت أميرة سنوات في قطاع التصميم والرقمي الإقليمي — تقود الهوية والويب لعلامات تجارية في التجزئة والضيافة، وشاركت في تأسيس استوديو تصميم في دبي. تعمل بأسلوب احترافي راقٍ: العلاقات أولًا، جودة عالية، ووضوح بلا مبالغة.",
      "أسلوب التواصل: هادئ، واثق، يقدّم الإجابات الصريحة على الآمنة، مع انحياز نحو الإنجاز.",
    ],
    location: {
      city: "دبي",
      country: "الإمارات العربية المتحدة",
      line: "مقرّها دبي. تبني لأصحاب الأعمال في الخليج، وللشركات المحلية، وللمشغّلين حول العالم.",
    },
    venturesHeading: "ما الذي أبنيه",
    ventures: [
      {
        name: "كوزميكلان",
        role: "المؤسِّسة",
        description:
          "استوديو إبداعي تقني. مواقع وتطبيقات وأنظمة هوية بصرية متميّزة لعملاء يريدون السرعة والذوق.",
      },
      {
        name: "استوديو منارة",
        role: "شريكة مؤسِّسة",
        description:
          "استوديو تصميم في دبي. هوية وتصميم منتجات لعلامات التجزئة والضيافة في الخليج.",
      },
      {
        name: "أنظمة النموّ",
        role: "قائدة منتج",
        description:
          "أدوات مبيعات ونموّ مدعومة بالذكاء الاصطناعي للشركات الصغيرة والمتوسّطة في المنطقة.",
      },
      {
        name: "الهاكاثونات",
        role: "مرشدة",
        description:
          "مشارِكة ومرشِدة نشطة في مسابقات وهاكاثونات إقليمية كمسار للتجريب.",
      },
    ],
    backgroundHeading: "نبذة",
    facts: [
      { label: "التعليم", value: "بكالوريوس في التصميم البصري والتواصل، دبي" },
      {
        label: "الخبرة",
        value:
          "قيادة الهوية والويب في وكالات رقمية إقليمية · شريكة مؤسِّسة لاستوديو منارة",
      },
      {
        label: "التركيز",
        value: "الويب والهوية وأنظمة النموّ من البداية إلى النهاية",
      },
      {
        label: "السوق",
        value: "الإمارات والسعودية وقطر والكويت والبحرين وعُمان",
      },
      {
        label: "الاستراتيجية",
        value: "أطلِق بسرعة، حافِظ على الذوق، وأثبِت القيمة قبل التوسّع.",
      },
    ],
  },
};

export const TEAM_BY_LOCALE: L10n<
  Array<{
    name: string;
    role: string;
    focus: string;
    code: string;
    image: string;
    kind: "Leader" | "Agent";
  }>
> = {
  default: buildTeam("default"),
  id: buildTeam("id"),
  ar: buildTeam("ar"),
  eu: buildTeam("eu"),
};

function buildTeam(locale: LocaleKey) {
  const leader = pick(LEADER_PROFILES, locale);
  return [
    {
      name: leader.name,
      role: leader.role,
      focus: leader.focus,
      code: "00",
      image: leader.image,
      kind: "Leader" as const,
    },
    ...AGENTS.map((agent, index) => ({
      name: agent.name,
      role:
        {
          marty: "Chief of staff",
          stark: "Money and business",
          ryuzaki: "Knowledge and research",
          donna: "Personal life",
          todo: "Builder and innovator",
          aryaa: "Professional brand",
          jennie: "Creative expression",
          ray: "Rax Tech operator",
        }[agent.id] ?? "Agent operator",
      focus:
        {
          marty: "Coordination, inbox, priorities, and unified execution.",
          stark: "Revenue systems, strategy, offers, and compounding leverage.",
          ryuzaki: "AI, web3, frontier research, and technical depth.",
          donna: "Health, fitness, language, travel, and relationships.",
          todo: "Ideas, hackathons, experiments, builds, and shipping.",
          aryaa: "X, LinkedIn, authority, mystery, and professional presence.",
          jennie: "Fashion, video, photography, visual language, and taste.",
          ray: "Rax operations, leads, service delivery, and growth systems.",
        }[agent.id] ?? "Specialized execution lane.",
      code: String(index + 1).padStart(2, "0"),
      image: agent.image,
      kind: "Agent" as const,
    })),
  ];
}

export const TEAM = TEAM_BY_LOCALE.default;
export const LEADER = LEADER_PROFILES.default;

export const LOCATION = LEADER_PROFILES.default.location;
export const GABRIEL_PROFILE = LEADER_PROFILES.default.bio;

export const SOCIALS_BY_LOCALE: L10n<Array<{ name: string; text: string }>> = {
  default: [
    { name: "Instagram", text: "" },
    { name: "X", text: "" },
    { name: "LinkedIn", text: "" },
  ],
  id: [
    { name: "Instagram", text: "" },
    { name: "X", text: "" },
    { name: "LinkedIn", text: "" },
  ],
  ar: [
    { name: "Instagram", text: "" },
    { name: "X", text: "" },
    { name: "LinkedIn", text: "" },
  ],
};

export const SOCIAL_LINKS_BY_LOCALE: L10n<
  Array<{ name: string; handle: string; url: string }>
> = {
  default: [
    {
      name: "Instagram",
      handle: "@cosmiclan_",
      url: "https://instagram.com/cosmiclan_",
    },
    { name: "X", handle: "@cosmiclan_", url: "https://x.com/cosmiclan_" },
    {
      name: "LinkedIn",
      handle: "cosmiclan",
      url: "https://www.linkedin.com/company/cosmiclan/",
    },
  ],
  id: [
    {
      name: "Instagram",
      handle: "@cosmiclan_",
      url: "https://instagram.com/cosmiclan_",
    },
    { name: "X", handle: "@cosmiclan_", url: "https://x.com/cosmiclan_" },
    {
      name: "LinkedIn",
      handle: "cosmiclan",
      url: "https://www.linkedin.com/company/cosmiclan/",
    },
  ],
  ar: [
    {
      name: "Instagram",
      handle: "@cosmiclan_",
      url: "https://instagram.com/cosmiclan_",
    },
    { name: "X", handle: "@cosmiclan_", url: "https://x.com/cosmiclan_" },
    {
      name: "LinkedIn",
      handle: "cosmiclan",
      url: "https://www.linkedin.com/company/cosmiclan/",
    },
  ],
};

export const CONTACT_COPY: L10n<{
  kicker: string;
  heading: string;
  email: string;
  socialsHeading: string;
}> = {
  default: {
    kicker: "Contact",
    heading: "Talk to us.",
    email: "contact@cosmiclan.com",
    socialsHeading: "Elsewhere",
  },
  id: {
    kicker: "Kontak",
    heading: "Hubungi kami.",
    email: "contact@cosmiclan.com",
    socialsHeading: "Lainnya",
  },
  ar: {
    kicker: "تواصل",
    heading: "تحدّث إلينا.",
    email: "contact@cosmiclan.com",
    socialsHeading: "في أماكن أخرى",
  },
};

export const BLOG_COPY: L10n<{
  indexKicker: string;
  indexHeading: string;
  indexLede: string;
  backToBlogs: string;
  readMore: string;
  minutesShort: string;
  aiAssistedLabel: string;
  nextPost: string;
  onlyEnglishNote: string;
  emptyHeading: string;
  emptyBody: string;
  workLabel: string;
  aboutLabel: string;
  blogsLabel: string;
  contactLabel: string;
}> = {
  default: {
    indexKicker: "Blogs",
    indexHeading: "Notes from the operating system.",
    indexLede:
      "Posts about the way I work, the agents that front Cosmiclan, the products in motion, and the messy middle most of it lives in.",
    backToBlogs: "All blogs",
    readMore: "Read",
    minutesShort: "min",
    aiAssistedLabel: "AI-assisted",
    nextPost: "Up next",
    onlyEnglishNote: "Only available in English for now.",
    emptyHeading: "Drafts in motion.",
    emptyBody: "First post is being written. Come back soon.",
    workLabel: "Work",
    aboutLabel: "About",
    blogsLabel: "Blogs",
    contactLabel: "Contact",
  },
  id: {
    indexKicker: "Blog",
    indexHeading: "Catatan dari operating system.",
    indexLede:
      "Tulisan tentang cara saya bekerja, creator AI yang menjalankan Cosmiclan, produk yang sedang berjalan, dan zona tengah yang berantakan tempat sebagian besar itu tinggal.",
    backToBlogs: "Semua blog",
    readMore: "Baca",
    minutesShort: "menit",
    aiAssistedLabel: "Dibantu AI",
    nextPost: "Selanjutnya",
    onlyEnglishNote: "Saat ini hanya tersedia dalam bahasa Inggris.",
    emptyHeading: "Draft sedang berjalan.",
    emptyBody: "Tulisan pertama sedang disiapkan. Cek lagi nanti.",
    workLabel: "Karya",
    aboutLabel: "Tentang",
    blogsLabel: "Blog",
    contactLabel: "Kontak",
  },
  ar: {
    indexKicker: "المدوّنة",
    indexHeading: "ملاحظات من نظام التشغيل.",
    indexLede:
      "مقالات عن طريقة عملي، والوكلاء الذين يديرون واجهة كوزميكلان، والمنتجات قيد التنفيذ، والمنطقة الوسطى الفوضوية التي يعيش فيها معظم ذلك.",
    backToBlogs: "كل المدوّنات",
    readMore: "اقرأ",
    minutesShort: "دقيقة",
    aiAssistedLabel: "بمساعدة الذكاء الاصطناعي",
    nextPost: "التالي",
    onlyEnglishNote: "متوفّر حاليًا بالإنجليزية فقط.",
    emptyHeading: "مسوّدات قيد التنفيذ.",
    emptyBody: "تُكتب المقالة الأولى الآن. عُد قريبًا.",
    workLabel: "الأعمال",
    aboutLabel: "نبذة",
    blogsLabel: "المدوّنة",
    contactLabel: "تواصل",
  },
};

export const SERVICES_BY_LOCALE: L10n<string[]> = {
  default: [
    "Websites and landing pages",
    "Web and mobile apps",
    "AI films, motion, and ads",
    "Branding and Pitch decks",
    "Video games",
    "Sales, growth, and marketing",
    "Business management",
    "AI Influencers",
    "Health and fitness systems",
  ],
  id: [
    "Website dan landing page",
    "Aplikasi web dan mobile",
    "Film AI, motion, dan iklan",
    "Branding dan pitch deck",
    "Video game",
    "Sales, growth, dan marketing",
    "Manajemen bisnis",
    "AI Influencers",
    "Sistem kesehatan dan kebugaran",
  ],
  ar: [
    "المواقع وصفحات الهبوط",
    "تطبيقات الويب والجوال",
    "أفلام ومحتوى موشن وإعلانات بالذكاء الاصطناعي",
    "الهوية البصرية وعروض التقديم",
    "ألعاب الفيديو",
    "المبيعات والنموّ والتسويق",
    "إدارة الأعمال",
    "مؤثّرو الذكاء الاصطناعي",
    "أنظمة الصحة واللياقة",
  ],
};

export const SOCIALS = SOCIALS_BY_LOCALE.default;
export const SERVICES = SERVICES_BY_LOCALE.default;

export const WORK_CATEGORIES = [
  "All",
  "Apps",
  "Landing",
  "Videos",
  "Creators",
  "Products",
] as const;
export type WorkCategory = (typeof WORK_CATEGORIES)[number];

export const PRODUCTS = [
  {
    slug: "marvis-infratech",
    name: "Marvis Infratech",
    type: "Infrastructure",
    category: "Landing" as WorkCategory,
    text: "Marvis Infratech gets a direct company showcase: positioning, capability proof, project visuals, and business credibility.",
    screenshot: "/images/projects/marvis-infratech.png",
  },
  {
    slug: "larinova",
    name: "Larinova",
    type: "Healthcare brand",
    category: "Landing" as WorkCategory,
    text: "Larinova's marketing site. Positioning for the AI medical automation company, the AI scribe with native Indian language support, and the surrounding clinic workflow story.",
    screenshot: "/images/projects/larinova.png",
  },
  {
    slug: "zencampus",
    name: "Zencampus",
    type: "Education brand",
    category: "Landing" as WorkCategory,
    text: "Zencampus marketing site. Education and campus product positioning, outcomes, and conversion lane for institutional buyers.",
    screenshot: "/images/projects/zencampus.png",
  },
  {
    slug: "larinova-app",
    name: "Larinova App",
    type: "Healthcare app",
    category: "Apps" as WorkCategory,
    text: "Larinova's clinical workflow app. Consultation, documents, schedules, follow-ups, and AI-assisted operations for doctors and clinics.",
    screenshot: "/images/projects/larinova.png",
  },
  {
    slug: "rax-tech",
    name: "Rax Tech",
    type: "Chennai / Europe / Gulf Connect",
    category: "Landing" as WorkCategory,
    text: "Rax Tech combines three regional business surfaces: Rax Tech Chennai, Rax Tech Europe, and Gulf Connect. The Cosmiclan system treats them as one services portfolio with separate local positioning, proof, and conversion lanes.",
    screenshot: "/images/projects/rax-tech.png",
    screenshots: [
      "/images/projects/rax-chennai.png",
      "/images/projects/rax-europe.png",
      "/images/projects/gulf-connect.png",
    ],
  },
  {
    slug: "tarqeem",
    name: "Tarqeem",
    type: "App",
    category: "Apps" as WorkCategory,
    text: "Tarqeem app showcase. The core workflow, users, and the proof behind its utility, treated as a real product surface, not a deck.",
    screenshot: "/images/projects/tarqeem.png",
  },
  {
    slug: "cosmiclaus",
    name: "Cosmiclaus",
    type: "App",
    category: "Apps" as WorkCategory,
    text: "Cosmiclaus uses the Rax apps platform as its product surface until the rebrand lands. The screenshot source is the live Rax app dashboard system, not a placeholder.",
    screenshot: "/images/projects/cosmiclaus.png",
  },
  {
    slug: "medato",
    name: "Medato",
    type: "Healthcare app",
    category: "Apps" as WorkCategory,
    text: "Medato app surface. Clarity, trust, workflow proof, and conversion-ready product storytelling for the healthcare clinical lane.",
    screenshot: "/images/projects/medato.png",
  },
  {
    slug: "larinova-film",
    name: "Larinova Promo",
    type: "Client-made promo",
    category: "Videos" as WorkCategory,
    text: "A product film for a healthcare workflow system: doctors, clinics, consultation flow, documentation, follow-up and operational clarity.",
    screenshot: "/videos/larinova-demo.jpg",
    video: "/videos/larinova-demo.mp4",
    poster: "/videos/larinova-demo.jpg",
  },
  {
    slug: "rax-europe-film",
    name: "Rax Tech Europe Energy Demo",
    type: "Client-made promo",
    category: "Videos" as WorkCategory,
    text: "An industrial energy-cost demo built to explain operational savings, technical proof, and high-value service positioning.",
    screenshot: "/videos/rax-europe-energy-cost-demo.jpg",
    video: "/videos/rax-europe-energy-cost-demo.mp4",
    poster: "/videos/rax-europe-energy-cost-demo.jpg",
  },
  // ─── 79 Cosmiclan templates (auto-generated, sellable landing-page templates) ───
  ...TEMPLATES,
];

export type Product = (typeof PRODUCTS)[number];

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((product) => product.slug === slug);
}

export const PROCESS_BY_LOCALE: L10n<string[]> = {
  default: [
    "Observe signals",
    "Research depth",
    "Generate options",
    "Build systems",
    "Verify proof",
    "Ship throughput",
  ],
  id: [
    "Membaca sinyal",
    "Riset mendalam",
    "Menghasilkan opsi",
    "Membangun sistem",
    "Memverifikasi bukti",
    "Mengirim hasil",
  ],
  ar: [
    "رصد الإشارات",
    "بحث معمّق",
    "توليد الخيارات",
    "بناء الأنظمة",
    "إثبات النتيجة",
    "الإطلاق والإنتاجية",
  ],
};

export const PROCESS = PROCESS_BY_LOCALE.default;

export type LoopStep = { step: string; essence: string; detail: string };

export const PROCESS_DETAIL_BY_LOCALE: L10n<LoopStep[]> = {
  default: [
    {
      step: "Observe signals",
      essence: "Read the surface for the real signal hiding under the noise.",
      detail:
        "Inboxes, dashboards, customer comments, quiet metrics, my own gut. The signal usually arrives small. Catching it early is half the work.",
    },
    {
      step: "Research depth",
      essence: "Go three layers deeper than the obvious answer.",
      detail:
        "Read the primary source, talk to the operator, run the numbers, then run them again. Most output is shallow because most research is shallow.",
    },
    {
      step: "Generate options",
      essence: "Hold three to five real alternatives before committing.",
      detail:
        "Cheap to write, expensive to ignore. Options expose the assumptions behind the default plan and reveal which constraint is actually binding.",
    },
    {
      step: "Build systems",
      essence: "Build the loop that builds the thing.",
      detail:
        "Single artifacts age out. The system that produces them keeps working. Every project leaves behind a reusable operating layer.",
    },
    {
      step: "Verify proof",
      essence: "If it shipped, the proof must be visible.",
      detail:
        "Screenshots, recordings, query results, real users using it. Anything else is rumor. The bar is what a stranger could verify in thirty seconds.",
    },
    {
      step: "Ship throughput",
      essence: "Put it in front of the world and keep moving.",
      detail:
        "Shipped is the end of one loop and the start of the next. Throughput beats theatre. Volume earns the right to be picky.",
    },
  ],
  id: [
    {
      step: "Membaca sinyal",
      essence:
        "Membaca permukaan untuk menemukan sinyal nyata yang tersembunyi di balik noise.",
      detail:
        "Inbox, dashboard, komentar pelanggan, metrik tenang, intuisi pribadi. Sinyal biasanya datang dalam ukuran kecil. Menangkapnya lebih awal adalah setengah pekerjaan.",
    },
    {
      step: "Riset mendalam",
      essence: "Turun tiga lapis lebih dalam dari jawaban paling jelas.",
      detail:
        "Baca sumber primer, bicara dengan operatornya, hitung ulang, lalu hitung lagi. Sebagian besar output dangkal karena sebagian besar risetnya dangkal.",
    },
    {
      step: "Menghasilkan opsi",
      essence: "Pegang tiga sampai lima alternatif nyata sebelum berkomitmen.",
      detail:
        "Murah untuk ditulis, mahal untuk diabaikan. Opsi mengungkap asumsi di balik rencana default dan menunjukkan kendala mana yang sebenarnya mengikat.",
    },
    {
      step: "Membangun sistem",
      essence: "Bangun loop yang membangun produknya.",
      detail:
        "Artefak tunggal akan usang. Sistem yang memproduksinya tetap bekerja. Setiap proyek meninggalkan lapisan operasional yang bisa dipakai ulang.",
    },
    {
      step: "Memverifikasi bukti",
      essence: "Kalau sudah dirilis, buktinya harus terlihat.",
      detail:
        "Screenshot, rekaman, hasil query, pengguna nyata yang memakainya. Selebihnya hanya rumor. Standarnya: orang asing bisa memverifikasi dalam tiga puluh detik.",
    },
    {
      step: "Mengirim hasil",
      essence: "Letakkan di depan dunia dan terus bergerak.",
      detail:
        "Yang dirilis adalah akhir satu loop dan awal loop berikutnya. Throughput mengalahkan teater. Volume yang memberi hak untuk pilih-pilih.",
    },
  ],
  ar: [
    {
      step: "رصد الإشارات",
      essence: "اقرأ السطح لتجد الإشارة الحقيقية المختبئة تحت الضجيج.",
      detail:
        "صناديق البريد، ولوحات البيانات، وتعليقات العملاء، والمقاييس الهادئة، وحدسي الشخصي. تصل الإشارة عادةً صغيرة. التقاطها مبكرًا هو نصف العمل.",
    },
    {
      step: "بحث معمّق",
      essence: "انزل ثلاث طبقات أعمق من الجواب البديهي.",
      detail:
        "اقرأ المصدر الأساسي، تحدّث إلى المشغّل، احسب الأرقام، ثم احسبها مجدّدًا. معظم المخرجات سطحية لأنّ معظم البحث سطحي.",
    },
    {
      step: "توليد الخيارات",
      essence: "احتفظ بثلاثة إلى خمسة بدائل حقيقية قبل الالتزام.",
      detail:
        "رخيصة في الكتابة، باهظة في التجاهل. الخيارات تكشف الافتراضات خلف الخطة الافتراضية وتُظهر أيّ قيد يُقيّد فعلًا.",
    },
    {
      step: "بناء الأنظمة",
      essence: "ابنِ الحلقة التي تبني الشيء.",
      detail:
        "الأعمال المنفردة تتقادم. النظام الذي ينتجها يستمرّ في العمل. كل مشروع يترك وراءه طبقة تشغيلية قابلة لإعادة الاستخدام.",
    },
    {
      step: "إثبات النتيجة",
      essence: "إن أُطلق، فلا بدّ أن يكون الدليل ظاهرًا.",
      detail:
        "لقطات الشاشة، والتسجيلات، ونتائج الاستعلامات، ومستخدمون حقيقيون يستعملونه. ما عدا ذلك مجرّد شائعة. المعيار هو ما يستطيع شخص غريب التحقّق منه في ثلاثين ثانية.",
    },
    {
      step: "الإطلاق والإنتاجية",
      essence: "ضعه أمام العالم واستمرّ في التقدّم.",
      detail:
        "الإطلاق هو نهاية حلقة وبداية أخرى. الإنتاجية تتفوّق على الاستعراض. الحجم هو ما يمنح الحقّ في الانتقائية.",
    },
  ],
};

export const LOOP_COPY: L10n<{
  kicker: string;
  heading: string;
  outroStrong: string;
  outro: string;
}> = {
  default: {
    kicker: "The operating loop",
    heading: "Six steps. Repeated until something works.",
    outroStrong: "Then run it again.",
    outro:
      "Every product, film, deck, and growth play passes through the same six steps. The loop is the unit of work, not the project.",
  },
  id: {
    kicker: "Loop operasi",
    heading: "Enam langkah. Diulang sampai sesuatu bekerja.",
    outroStrong: "Lalu jalankan lagi.",
    outro:
      "Setiap produk, film, deck, dan langkah growth melewati enam langkah yang sama. Yang dihitung sebagai unit kerja adalah loop-nya, bukan proyeknya.",
  },
  ar: {
    kicker: "حلقة التشغيل",
    heading: "ستّ خطوات. تُكرَّر حتى ينجح شيء ما.",
    outroStrong: "ثم كرّرها من جديد.",
    outro:
      "كل منتج وفيلم وعرض تقديمي وخطوة نموّ يمرّ بالخطوات الستّ نفسها. وحدة العمل هي الحلقة، لا المشروع.",
  },
};

export const LANDING_COPY: L10n<{
  workLabel: string;
  aboutLabel: string;
  blogsLabel: string;
  contactLabel: string;
  copiedLabel: string;
  intro: string;
  contactPrefix: string;
  projectHint: string;
  layoutLabel: string;
  rightsReserved: string;
  timezone: { label: string; intl: string; tz: string };
}> = {
  default: {
    workLabel: "Work",
    aboutLabel: "About",
    blogsLabel: "Blogs",
    contactLabel: "Contact",
    copiedLabel: "Copied",
    intro:
      "One orchestrator. Eight agents. One sovereign brand. Cosmiclan builds software, art, content, products, and operations at an uncommon caliber. Deploying specialized agents across every frontier of human endeavor.",
    contactPrefix: "Contact:",
    projectHint: "Scroll the work. Open the selected project.",
    layoutLabel: "Work layout",
    rightsReserved: "All rights reserved. © 2026 Cosmiclan",
    timezone: { label: "IST", intl: "en-IN", tz: "Asia/Kolkata" },
  },
  id: {
    workLabel: "Karya",
    aboutLabel: "Tentang",
    blogsLabel: "Blog",
    contactLabel: "Kontak",
    copiedLabel: "Disalin",
    intro:
      "Satu builder, delapan creator AI, satu perusahaan. Cosmiclan merilis aplikasi, film, desain, growth, game, dan operasional di bawah satu brand — dengan creator AI terspesialisasi sebagai lapisan publik.",
    contactPrefix: "Kontak:",
    projectHint: "Geser untuk melihat karya. Buka proyek yang terpilih.",
    layoutLabel: "Tata letak karya",
    rightsReserved: "Hak cipta dilindungi. © 2026 Cosmiclan",
    timezone: { label: "WIB", intl: "id-ID", tz: "Asia/Jakarta" },
  },
  ar: {
    workLabel: "الأعمال",
    aboutLabel: "نبذة",
    blogsLabel: "المدوّنة",
    contactLabel: "تواصل",
    copiedLabel: "تم النسخ",
    intro:
      "منسّقة واحدة. ثمانية وكلاء. علامة تجارية سيادية واحدة. تبني كوزميكلان البرمجيات والفنّ والمحتوى والمنتجات والعمليات بمستوى نادر، عبر نشر وكلاء متخصّصين في كل حدّ من حدود المساعي الإنسانية.",
    contactPrefix: "تواصل:",
    projectHint: "تصفّح الأعمال. افتح المشروع المحدّد.",
    layoutLabel: "تخطيط الأعمال",
    rightsReserved: "جميع الحقوق محفوظة. © 2026 Cosmiclan",
    timezone: { label: "GST", intl: "ar-AE", tz: "Asia/Dubai" },
  },
};

export const CATEGORY_LABELS: L10n<Record<WorkCategory, string>> = {
  default: {
    All: "All",
    Apps: "Apps",
    Landing: "Landing",
    Videos: "Videos",
    Creators: "Creators",
    Products: "Products",
  },
  id: {
    All: "Semua",
    Apps: "Aplikasi",
    Landing: "Landing",
    Videos: "Video",
    Creators: "Creator",
    Products: "Produk",
  },
  ar: {
    All: "الكل",
    Apps: "تطبيقات",
    Landing: "صفحات هبوط",
    Videos: "فيديوهات",
    Creators: "صنّاع المحتوى",
    Products: "منتجات",
  },
};

export const LAYOUT_LABELS: L10n<Record<string, string>> = {
  default: { Vertical: "Vertical", Horizontal: "Horizontal", Grid: "Grid" },
  id: { Vertical: "Vertikal", Horizontal: "Horizontal", Grid: "Grid" },
  ar: { Vertical: "عمودي", Horizontal: "أفقي", Grid: "شبكة" },
};

export const ABOUT_COPY: L10n<{
  aboutLabel: string;
  workLabel: string;
  blogsLabel: string;
  contactLabel: string;
  title: string;
  titleAccent: string;
  aboutOrganism: string;
  heroLines: [string, string];
  leaderKicker: string;
  baseLabel: string;
  aboutGrid: [string, string];
  servicesKicker: string;
  servicesHeading: string;
  teamKicker: string;
  teamHeading: string;
  socialsKicker: string;
  socialsHeading: string;
  aboutGridProcess: string;
}> = {
  default: {
    aboutLabel: "About",
    workLabel: "Work",
    blogsLabel: "Blogs",
    contactLabel: "Contact",
    title: "High Agency.",
    titleAccent: "Raw",
    aboutOrganism: "About the organism",
    heroLines: [
      "Cosmiclan is a high-agency creator-tech operating system: a team of humans, creators, and product systems built to imagine, ship, and scale at machine speed.",
      "",
    ],
    leaderKicker: "00 / Main orchestrator",
    baseLabel: "Base",
    aboutGrid: [
      "We build like a studio, operate like a systems lab, and publish like a media engine. Every product gets its own stack for content, socials, growth, lead flow, branding, issue detection and continuous improvement.",
      "The team is not decorative. Each creator owns a lane, learns from the best external references, keeps principles compact, and turns research into repeatable operating systems instead of bloated context.",
    ],
    aboutGridProcess: "Process",
    servicesKicker: "Services",
    servicesHeading:
      "Software, motion, design, growth, and operations, built end to end.",
    teamKicker: "Team of creators",
    teamHeading: "Specialized execution lanes around one orchestrator.",
    socialsKicker: "Socials",
    socialsHeading:
      "Instagram, X and LinkedIn are treated as distribution systems.",
  },
  id: {
    aboutLabel: "Tentang",
    workLabel: "Karya",
    blogsLabel: "Blog",
    contactLabel: "Kontak",
    title: "High Agency.",
    titleAccent: "Raw",
    aboutOrganism: "Tentang organismenya",
    heroLines: [
      "Cosmiclan adalah operating system creator-tech buatan Indonesia: tim manusia, creator, dan sistem produk yang dibangun untuk berimajinasi, merilis, dan menskalakan dengan kecepatan mesin.",
      "Brand lokal Indonesia dari Jakarta, dirancang untuk skala global.",
    ],
    leaderKicker: "00 / Pendiri dan orkestrator utama",
    baseLabel: "Pusat",
    aboutGrid: [
      "Kami membangun seperti studio, beroperasi seperti laboratorium sistem, dan menerbitkan seperti mesin media. Setiap produk punya stacknya sendiri: konten, sosial, growth, alur lead, branding, deteksi isu, dan peningkatan berkelanjutan.",
      "Tim ini bukan dekorasi. Setiap creator memiliki lane, belajar dari referensi eksternal terbaik, menjaga prinsip tetap padat, dan mengubah riset menjadi sistem operasi yang bisa diulang, bukan konteks yang membengkak.",
    ],
    aboutGridProcess: "Proses",
    servicesKicker: "Layanan",
    servicesHeading:
      "Perangkat lunak, motion, desain, growth, dan operasional, dibangun ujung ke ujung.",
    teamKicker: "Tim creator",
    teamHeading:
      "Lane eksekusi yang terspesialisasi mengelilingi satu orkestrator.",
    socialsKicker: "Sosial",
    socialsHeading:
      "Instagram, X, dan LinkedIn diperlakukan sebagai sistem distribusi.",
  },
  ar: {
    aboutLabel: "نبذة",
    workLabel: "الأعمال",
    blogsLabel: "المدوّنة",
    contactLabel: "تواصل",
    title: "وكالة عالية.",
    titleAccent: "ناتج خام",
    aboutOrganism: "عن الكائن",
    heroLines: [
      "كوزميكلان نظام تشغيل إبداعي تقني عالي الفاعلية: فريق من البشر وصنّاع المحتوى وأنظمة المنتجات، مبنيّ ليتخيّل ويُطلق ويتوسّع بسرعة الآلة.",
      "علامة تجارية من دبي، مصمّمة للانتشار العالمي.",
    ],
    leaderKicker: "00 / المنسّق الرئيسي",
    baseLabel: "المقرّ",
    aboutGrid: [
      "نبني كاستوديو، ونعمل كمختبر أنظمة، وننشر كمحرّك إعلامي. لكل منتج حزمته الخاصة من المحتوى، والسوشال، والنموّ، وتدفّق العملاء المحتملين، والهوية البصرية، ورصد الأعطال، والتحسين المستمرّ.",
      "الفريق ليس للزينة. كل صانع محتوى يملك مساره، ويتعلّم من أفضل المراجع الخارجية، ويبقي المبادئ مركّزة، ويحوّل البحث إلى أنظمة تشغيل قابلة للتكرار بدلًا من سياق متضخّم.",
    ],
    aboutGridProcess: "العملية",
    servicesKicker: "الخدمات",
    servicesHeading:
      "البرمجيات، والموشن، والتصميم، والنموّ، والعمليات، مبنيّة من البداية إلى النهاية.",
    teamKicker: "فريق من صنّاع المحتوى",
    teamHeading: "مسارات تنفيذ متخصّصة حول منسّق واحد.",
    socialsKicker: "السوشال",
    socialsHeading: "نتعامل مع Instagram وX وLinkedIn كأنظمة توزيع.",
  },
};
