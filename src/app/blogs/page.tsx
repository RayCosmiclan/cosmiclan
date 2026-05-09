import Link from "next/link";
import Image from "next/image";
import { BLOG_COPY } from "@/components/public/cosmiclan-site-data";
import { BlogIndexClock } from "@/components/public/blog-index-clock";
import { BootReveal } from "@/components/public/boot-reveal";
import { RevealText } from "@/components/public/reveal-text";
import { listBlogPosts } from "@/lib/blog";
import { getLocaleFromRequest } from "@/lib/locale";
import styles from "@/components/public/cosmiclan-blog.module.css";

const MARQUEE_PHRASES = {
  default: [
    "Notes",
    "Field journal",
    "Operating system",
    "Loops",
    "Throughput",
  ],
  id: ["Catatan", "Jurnal lapangan", "Operating system", "Loop", "Throughput"],
};

export default async function BlogsPage() {
  const locale = await getLocaleFromRequest();
  const copy = BLOG_COPY[locale];
  const posts = await listBlogPosts(locale);

  const dateFormatter = new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : "en-IN",
    { day: "2-digit", month: "short", year: "numeric" },
  );

  const marqueeText = [...MARQUEE_PHRASES[locale === "id" ? "id" : "default"]]
    .concat([...MARQUEE_PHRASES[locale === "id" ? "id" : "default"]])
    .map((p, i, arr) => (
      <span key={i}>
        {i % 2 === 0 ? <em>{p}</em> : p}
        {i < arr.length - 1 ? " · " : ""}
      </span>
    ));

  return (
    <main className={styles.blogPage} data-variant="index">
      <div className={styles.ambientField} aria-hidden="true" />

      <nav className={styles.nav} aria-label="Cosmiclan navigation">
        <BootReveal />
        <div data-boot className={styles.navGroup}>
          <Link href="/">{copy.workLabel}</Link>
          <Link href="/about">{copy.aboutLabel}</Link>
          <Link href="/blogs" aria-current="page">
            {copy.blogsLabel}
          </Link>
        </div>
        <BlogIndexClock locale={locale} dataBoot />
        <div data-boot className={styles.navGroup}>
          <Link href="mailto:gabrielantony56@gmail.com">
            {copy.contactLabel}
          </Link>
        </div>
      </nav>

      <header className={styles.indexHero}>
        <RevealText as="p" effect="kicker" immediate className={styles.kicker}>
          {copy.indexKicker}
        </RevealText>
        <RevealText
          as="h1"
          effect="chars"
          immediate
          delay={0.15}
          className={styles.indexHeading}
        >
          {copy.indexHeading}
        </RevealText>
        <RevealText
          as="p"
          effect="words"
          immediate
          delay={0.4}
          className={styles.indexLede}
        >
          {copy.indexLede}
        </RevealText>
      </header>

      <div className={styles.blogMarquee} aria-hidden="true">
        <span>{marqueeText}</span>
        <span>{marqueeText}</span>
      </div>

      {posts.length === 0 ? (
        <section className={styles.emptyState}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="32"
              cy="32"
              r="30"
              stroke="rgba(243,240,234,0.2)"
              strokeWidth="1"
            />
            <line
              x1="20"
              y1="32"
              x2="44"
              y2="32"
              stroke="rgba(243,240,234,0.3)"
              strokeWidth="1"
            />
            <line
              x1="32"
              y1="20"
              x2="32"
              y2="44"
              stroke="rgba(243,240,234,0.3)"
              strokeWidth="1"
            />
          </svg>
          <h2>{copy.emptyHeading}</h2>
          <p>{copy.emptyBody}</p>
          <Link href="/" className={styles.emptyCta}>
            {copy.workLabel.replace(/,$/, "")}
          </Link>
        </section>
      ) : (
        <ol className={styles.indexList}>
          {posts.map((post, i) => (
            <li
              key={post.slug}
              className={styles.indexRow}
              style={
                post.hue !== undefined
                  ? ({
                      "--accent-hue": String(post.hue),
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <Link href={`/blogs/${post.slug}`} className={styles.indexLink}>
                <span className={styles.indexNumber}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={styles.indexCover}>
                  {post.cover ? (
                    <Image
                      src={post.cover}
                      alt=""
                      fill
                      sizes="(max-width: 920px) 90vw, 240px"
                    />
                  ) : (
                    <div className={styles.indexCoverFallback} />
                  )}
                  <span className={styles.indexCoverMark}>
                    {post.tags[0] ?? copy.indexKicker}
                  </span>
                </div>
                <div className={styles.indexBody}>
                  <span className={styles.indexMeta}>
                    {post.date ? dateFormatter.format(new Date(post.date)) : ""}
                    <span aria-hidden="true"> · </span>
                    {post.readingMinutes} {copy.minutesShort}
                    {post.aiAssisted ? (
                      <>
                        <span aria-hidden="true"> · </span>
                        {copy.aiAssistedLabel}
                      </>
                    ) : null}
                    {post.locale !== locale && locale === "id" ? (
                      <>
                        <span aria-hidden="true"> · </span>
                        {copy.onlyEnglishNote}
                      </>
                    ) : null}
                  </span>
                  <h2 className={styles.indexTitle}>{post.title}</h2>
                  {post.excerpt ? (
                    <p className={styles.indexExcerpt}>{post.excerpt}</p>
                  ) : null}
                  <span className={styles.indexCta}>
                    {copy.readMore}
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}

      <footer className={styles.footer}>
        <Link href="/" className={styles.backLink}>
          ← {copy.workLabel.replace(/,$/, "")}
        </Link>
        <span>© 2026 Cosmiclan</span>
      </footer>
    </main>
  );
}
