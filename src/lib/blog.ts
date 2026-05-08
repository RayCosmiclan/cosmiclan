import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { LocaleKey } from "@/components/public/cosmiclan-site-data";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BlogPostMeta = {
  slug: string;
  locale: LocaleKey;
  availableLocales: LocaleKey[];
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  hue?: number;
  cover?: string;
  aiAssisted?: boolean;
  readingMinutes: number;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

function localeSuffix(locale: LocaleKey): string {
  return locale === "id" ? ".id" : "";
}

function fileNameForSlug(slug: string, locale: LocaleKey): string {
  return `${slug}${localeSuffix(locale)}.mdx`;
}

async function safeReadFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw err;
  }
}

async function listFiles(): Promise<string[]> {
  try {
    const all = await fs.readdir(BLOG_DIR);
    return all.filter((name) => name.endsWith(".mdx"));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw err;
  }
}

function parseFile(slug: string, locale: LocaleKey, raw: string): BlogPost {
  const { data, content } = matter(raw);
  const stats = readingTime(content);
  return {
    slug,
    locale,
    availableLocales: [locale],
    title: String(data.title ?? slug),
    excerpt: String(data.excerpt ?? ""),
    date: String(data.date ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    hue: typeof data.hue === "number" ? data.hue : undefined,
    cover: typeof data.cover === "string" ? data.cover : undefined,
    aiAssisted:
      typeof data.aiAssisted === "boolean" ? data.aiAssisted : undefined,
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
    content,
  };
}

export async function listBlogPosts(
  locale: LocaleKey,
): Promise<BlogPostMeta[]> {
  const files = await listFiles();
  const slugs = new Set<string>();
  for (const file of files) {
    const base = file.replace(/\.mdx$/, "");
    const slug = base.endsWith(".id") ? base.slice(0, -3) : base;
    slugs.add(slug);
  }

  const posts: BlogPostMeta[] = [];
  for (const slug of slugs) {
    const post = await getBlogPost(slug, locale);
    if (post) {
      const { content: _content, ...meta } = post;
      posts.push(meta);
    }
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return posts;
}

export async function getBlogPost(
  slug: string,
  locale: LocaleKey,
): Promise<BlogPost | null> {
  const localizedPath = path.join(BLOG_DIR, fileNameForSlug(slug, locale));
  const defaultPath = path.join(BLOG_DIR, fileNameForSlug(slug, "default"));

  const localizedRaw =
    locale === "default" ? null : await safeReadFile(localizedPath);
  const defaultRaw = await safeReadFile(defaultPath);

  const chosenRaw = localizedRaw ?? defaultRaw;
  if (!chosenRaw) return null;

  const chosenLocale: LocaleKey = localizedRaw ? locale : "default";
  const post = parseFile(slug, chosenLocale, chosenRaw);

  const available: LocaleKey[] = [];
  if (defaultRaw) available.push("default");
  // check if id sibling exists
  if (locale === "id" && localizedRaw) {
    available.push("id");
  } else {
    const idSibling = await safeReadFile(
      path.join(BLOG_DIR, fileNameForSlug(slug, "id")),
    );
    if (idSibling) available.push("id");
  }
  post.availableLocales = Array.from(new Set(available));
  return post;
}

export async function listBlogSlugs(): Promise<string[]> {
  const files = await listFiles();
  const slugs = new Set<string>();
  for (const file of files) {
    const base = file.replace(/\.mdx$/, "");
    const slug = base.endsWith(".id") ? base.slice(0, -3) : base;
    slugs.add(slug);
  }
  return Array.from(slugs);
}
