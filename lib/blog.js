/**
 * The blog (KB D-047). Articles are Markdown files in content/blog/, read at build time.
 *
 * AI may draft; a person approves. A draft (`status: draft`) shows only on preview
 * deployments and local dev, with a banner and noindex. An article goes live only as
 * `status: published` with `approvedBy` and `approvedAt` set, and the build fails if
 * either is missing, so nothing reaches grupchat.net without a named person's approval.
 * The workflow and every field: content/blog/README.md.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";

const DIR = path.join(process.cwd(), "content", "blog");

export const PILLARS = [
  { slug: "tech-and-ai", name: "Tech, AI and people", blurb: "News and analysis on technology and AI, and what it changes for the people using it." },
  { slug: "planning-together", name: "Planning together", blurb: "Practical guides for trips, events and plans made with friends, family and colleagues." },
  { slug: "money-together", name: "Money together", blurb: "Pooling, contributions and keeping things fair when a group pays for something." },
  { slug: "experiences", name: "Experiences in Kenya", blurb: "Places to go and things to do as a group, and the people who run them." },
];
export const pillarFor = (slug) => PILLARS.find((p) => p.slug === slug) || null;

/** Drafts appear on preview deployments and in local dev, never on production. */
export const showDrafts = () =>
  process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development" || process.env.BLOG_SHOW_DRAFTS === "1";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const PEXELS = /^https:\/\/images\.pexels\.com\/photos\//;
const asDate = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v ? String(v).slice(0, 10) : "");
const decode = (s) => String(s).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const slugify = (s) => decode(String(s).replace(/<[^>]+>/g, "")).toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function fail(file, why) {
  throw new Error(`content/blog/${file}: ${why} (see content/blog/README.md)`);
}

/** Read and check one file. Throws on anything that would publish a bad or unapproved article. */
function load(file) {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = file.replace(/\.md$/, "");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(file, "file names are lowercase words joined by hyphens");
  for (const k of ["title", "description", "pillar", "status"]) if (!data[k]) fail(file, `"${k}" is required`);
  if (!pillarFor(data.pillar)) fail(file, `pillar "${data.pillar}" is not one of ${PILLARS.map((p) => p.slug).join(", ")}`);
  if (!["draft", "published"].includes(data.status)) fail(file, 'status is "draft" or "published"');
  if (String(data.title).length > 70) fail(file, "titles stay under 70 characters so search results show them whole");
  if (String(data.description).length > 165) fail(file, "descriptions stay under 165 characters");
  const date = asDate(data.date);
  const approvedAt = asDate(data.approvedAt);
  if (data.status === "published") {
    if (!data.approvedBy) fail(file, "a published article names the person who approved it (approvedBy)");
    if (!DATE.test(approvedAt)) fail(file, "a published article has approvedAt as YYYY-MM-DD");
    if (!DATE.test(date)) fail(file, "a published article has its publication date as YYYY-MM-DD");
  }
  if (data.cover && /^https?:\/\//.test(data.cover)) {
    if (!PEXELS.test(data.cover)) fail(file, "a cover from the web is a Pexels photo (images.pexels.com); anything else goes in public/blog/");
    if (!data.coverCredit || !data.coverSource) fail(file, "a Pexels cover credits the photographer (coverCredit, coverCreditUrl) and links the photo page (coverSource)");
  }
  if (data.cover && !data.coverAlt) fail(file, "a cover says what it shows (coverAlt)");
  if (data.pillar === "tech-and-ai" && data.status === "published" && !(data.sources || []).length) {
    fail(file, "news and analysis link the sources they rely on (sources)");
  }

  const headings = [];
  const md = new Marked({ gfm: true });
  md.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const id = slugify(text);
        if (depth === 2) headings.push({ id, text: decode(text.replace(/<[^>]+>/g, "")) });
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href) && !href.startsWith("https://www.grupchat.net");
        return `<a href="${href}"${title ? ` title="${title}"` : ""}${external ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`;
      },
      image({ href, title, text }) {
        return `<img src="${href}" alt="${text || ""}"${title ? ` title="${title}"` : ""} loading="lazy" decoding="async" />`;
      },
    },
  });
  const html = md.parse(content);
  const words = content.split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: String(data.title),
    description: String(data.description),
    pillar: data.pillar,
    tags: data.tags || [],
    author: data.author || "GrupChat Editorial",
    status: data.status,
    date: date || null,
    updated: asDate(data.updated) || null,
    aiAssisted: data.aiAssisted !== false,
    approvedBy: data.approvedBy || null,
    approvedAt: approvedAt || null,
    cover: data.cover || null,
    coverAlt: data.coverAlt || "",
    coverCredit: data.coverCredit || "",
    coverCreditUrl: data.coverCreditUrl || null,
    coverSource: data.coverSource || null,
    shareImage: shareImageFor(data.cover),
    sources: (data.sources || []).filter((s) => s && s.url),
    readingMinutes: Math.max(1, Math.round(words / 220)),
    headings,
    html,
  };
}

/**
 * A cover at a given size. Pexels photos are served from Pexels' image CDN, which crops
 * and compresses by URL, so a phone downloads a phone-sized file. Local files pass through.
 */
export function coverSrc(cover, w, h) {
  if (!PEXELS.test(cover)) return cover;
  const u = new URL(cover);
  u.search = new URLSearchParams({ auto: "compress", cs: "tinysrgb", fit: "crop", w: String(w), h: String(h) }).toString();
  return u.toString();
}

/** Whether a cover comes from Pexels' CDN (worth a preconnect). */
export const isRemoteCover = (cover) => PEXELS.test(cover || "");

/** `srcset` for a 16:9 cover, or undefined when the file has one size. */
export function coverSrcSet(cover) {
  if (!PEXELS.test(cover)) return undefined;
  return [480, 800, 1200, 1600].map((w) => `${coverSrc(cover, w, Math.round((w * 9) / 16))} ${w}w`).join(", ");
}

/** "Pexels" for a Pexels page, else the site's host name. */
export const sourceName = (url) => (/pexels\.com/.test(url) ? "Pexels" : new URL(url).hostname.replace(/^www\./, ""));

/**
 * The image for link previews and structured data, 1200×630. Most scrapers (WhatsApp,
 * X, LinkedIn) ignore SVG, so an SVG cover is shared as the PNG beside it when there is one.
 */
function shareImageFor(cover) {
  if (!cover) return null;
  if (PEXELS.test(cover)) return coverSrc(cover, 1200, 630);
  if (!cover.endsWith(".svg")) return cover;
  const png = cover.replace(/\.svg$/, ".png");
  return fs.existsSync(path.join(process.cwd(), "public", png)) ? png : null;
}

let cache = null;
function all() {
  if (cache) return cache;
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".md") && f !== "README.md") : [];
  cache = files.map(load);
  return cache;
}

const newest = (a, b) => String(b.date || b.approvedAt || "").localeCompare(String(a.date || a.approvedAt || "")) || a.title.localeCompare(b.title);

/** Articles a visitor can open here: published ones, plus drafts on previews and in dev. */
export function listPosts({ pillar } = {}) {
  const drafts = showDrafts();
  return all()
    .filter((p) => p.status === "published" || drafts)
    .filter((p) => !pillar || p.pillar === pillar)
    .sort(newest);
}

/** Published articles only: what search engines and the feed are told about. */
export const listPublished = () => all().filter((p) => p.status === "published").sort(newest);

export function getPost(slug) {
  return listPosts().find((p) => p.slug === slug) || null;
}

export function relatedPosts(post, n = 3) {
  return listPosts().filter((p) => p.slug !== post.slug && p.pillar === post.pillar).slice(0, n);
}

/** Adds the RSS feed to a page's metadata without losing its canonical. */
export const withFeed = (meta) => ({ ...meta, alternates: { ...meta.alternates, types: { "application/rss+xml": "/blog/rss.xml" } } });

export const formatDate = (d) =>
  d ? new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";
