import { getServerSideSitemap } from "next-sitemap";
import fetch from "../../../../lib/fetch";
import slugify from "../../../../lib/slugify";

const URLS_PER_SITEMAP = 7000;

interface RouteProps {
  params: { index: number };
}

export async function GET(_: any, { params: { index } }: RouteProps) {
  const releases = await fetch<Array<{ id: number; title: string }>>(
    `/api/releases_short?limit=${URLS_PER_SITEMAP}&offset=${
      URLS_PER_SITEMAP * index
    }`
  );

  return getServerSideSitemap(
    releases.map(({ id, title }) => ({
      loc: `/release/${id}-${slugify(title)}`,
      lastmod: new Date().toISOString(),
    }))
  );
}
