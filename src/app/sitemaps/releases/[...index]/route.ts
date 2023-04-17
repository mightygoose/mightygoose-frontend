import { getServerSideSitemap } from "next-sitemap";
import fetch from "../../../../lib/fetch";
import slugify from "../../../../lib/slugify";

const URLS_PER_SITEMAP = 7000;

interface RouteProps {
  params: { index: Array<string> };
}

export async function GET(_: any, { params: { index } }: RouteProps) {
  const pageIndex = +(index[0].match(/^\d+/)?.[0] || 0);
  const releases = await fetch<Array<{ id: number; title: string }>>(
    `/api/releases_short?limit=${URLS_PER_SITEMAP}&offset=${
      URLS_PER_SITEMAP * pageIndex
    }`,
    {},
    { next: { revalidate: 60 * 60 * 24 } }
  );

  return getServerSideSitemap(
    releases.map(({ id, title }) => ({
      loc: `http://mightygoose.com/release/${id}-${slugify(title)}`,
      lastmod: new Date().toISOString(),
    }))
  );
}
