import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { BLOG_COPY } from "@/components/public/cosmiclan-site-data";
import { BlogIndexClock } from "@/components/public/blog-index-clock";
import { BootReveal } from "@/components/public/boot-reveal";
import { RevealText } from "@/components/public/reveal-text";
import { getBlogPost, listBlogPosts, listBlogSlugs } from "@/lib/blog";
import { getLocaleFromRequest } from "@/lib/locale";
import styles from "@/components/public/cosmiclan-blog.module.css";

export async function generateStaticParams() {
  const slugs = await listBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocaleFromRequest();
  const post = await getBlogPost(slug, locale);
  if (!post) notFound();

  const copy = BLOG_COPY[locale];
  const all = await listBlogPosts(locale);
  const idx = all.findIndex((p) => p.slug === slug);
  const next = idx >= 0 ? (all[idx + 1] ?? all[0]) : null;
  const dateFormatter = new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : "en-IN",
    { day: "2-digit", month: "long", year: "numeric" },
  );
  const accentVar =
    post.hue !== undefined
      ? ({ "--accent-hue": String(post.hue) } as React.CSSProperties)
      : undefined;

  return (
    <main className={styles.blogPage} data-variant="post" style={accentVar}>
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

      <article className={styles.postArticle}>
        <header className={styles.postHeader}>
          <p className={styles.postMeta}>
            {post.date ? dateFormatter.format(new Date(post.date)) : ""}
            <span aria-hidden="true"> · </span>
            {post.readingMinutes} {copy.minutesShort}
            {post.aiAssisted ? (
              <>
                <span aria-hidden="true"> · </span>
                {copy.aiAssistedLabel}
              </>
            ) : null}
          </p>
          <RevealText
            as="h1"
            effect="chars"
            immediate
            delay={0.1}
            className={styles.postTitle}
          >
            {post.title}
          </RevealText>
          {post.excerpt ? (
            <RevealText
              as="p"
              effect="words"
              immediate
              delay={0.45}
              className={styles.postLede}
            >
              {post.excerpt}
            </RevealText>
          ) : null}
          {post.locale !== locale && locale === "id" ? (
            <p className={styles.postLocaleNote}>{copy.onlyEnglishNote}</p>
          ) : null}
        </header>

        <figure className={styles.postCover}>
          {post.cover ? (
            <img
              src={post.cover}
              alt={post.title}
              className={styles.postCoverImage}
              loading="eager"
            />
          ) : (
            <div className={styles.postCoverFallback}>
              <span className={styles.postCoverMark}>
                {post.tags[0] ?? copy.indexKicker}
              </span>
            </div>
          )}
        </figure>

        <div className={styles.postBody}>
          <MDXRemote source={post.content} />
        </div>
      </article>

      {next && next.slug !== post.slug ? (
        <aside className={styles.postNext} aria-label={copy.nextPost}>
          <span className={styles.postNextKicker}>{copy.nextPost}</span>
          <Link
            href={`/blogs/${next.slug}`}
            className={styles.postNextLink}
            style={
              next.hue !== undefined
                ? ({ "--accent-hue": String(next.hue) } as React.CSSProperties)
                : undefined
            }
          >
            <span className={styles.postNextTitle}>{next.title}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </aside>
      ) : null}

      <footer className={styles.footer}>
        <Link href="/blogs" className={styles.backLink}>
          ← {copy.backToBlogs}
        </Link>
        <span>© 2026 Cosmiclan</span>
      </footer>
    </main>
  );
}
