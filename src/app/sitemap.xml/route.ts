import { getServerSideSitemapIndex } from "next-sitemap";
import fetch from "../../lib/fetch";

const URLS_PER_SITEMAP = 7000;

export async function GET() {
  const stat = await fetch<{ unique_releases: number }>("/api/stat");
  const releasePagesCount = Math.round(stat.unique_releases / URLS_PER_SITEMAP);
  const releaseSitemaps = Array.from(
    { length: releasePagesCount },
    (_, i) => `/sitemaps/releases/${i}.xml`
  );

  return getServerSideSitemapIndex(releaseSitemaps);
}
