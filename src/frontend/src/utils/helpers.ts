/**
 * Format a bigint nanosecond timestamp into a readable date string.
 */
export function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Build the full shareable URL for an article slug.
 */
export function getArticleUrl(slug: string): string {
  return `${window.location.origin}/article/${slug}`;
}

/**
 * Convert a title string into a URL-safe slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
