import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fetch from "../../../lib/fetch";
import slugify from "../../../lib/slugify";
import { Release as TRelease } from "../../types";
import Release, { NotFound } from "./Release";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params: { slug },
}: PageProps): Promise<Metadata> {
  const releaseId = slug.match(/(\d+)-?/)?.[1];
  if (!releaseId) {
    return {};
  }
  const release = await getRelease(+releaseId);
  if (!release) {
    return {};
  }
  const { id, title, tags, images } = release;
  const description = `${title}: Experience the ultimate blend of ${tags.join(
    ", "
  )} with ${title}. Get ready for a unique and powerful musical experience!`;
  const canonical = `http://mightygoose.com/release/${id}-${slugify(title)}`;

  const year = release.discogs?.year;
  const ogDescription = [title].concat(year);

  return {
    title: `${title} | Mightygoose.com`,
    description,
    keywords: [title, ...tags],
    category: "music",
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: true,
      },
    },
    openGraph: {
      title,
      description: `${title} ${year ? `(${year})` : ""} ${
        tags.length ? `[${tags.join(", ")}]` : ""
      }`,
      url: canonical,
      siteName: "Mightygoose.com",
      images: [
        {
          url: images[0],
        },
      ],
      locale: "en-US",
      type: "website",
    },
  };
}

const getRelease = (id: number) => fetch<TRelease>(`/api/release/${id}`);

const Page = async ({ params: { slug } }: PageProps) => {
  const releaseId = slug.match(/(\d+)-?/)?.[1];
  if (!releaseId) {
    notFound();
  }
  const release = await getRelease(+releaseId);

  if (!release) {
    notFound();
  }

  const { album, artist } = release.deezer ||
    release.itunes ||
    release.spotify || {
      artist: release.title.split(" - ")[0],
      album: release.title.split(" - ")[1],
    };

  const jsonLd = {
    "@context": "http://schema.org",
    "@type": "MusicAlbum",
    name: album,
    byArtist: {
      "@type": "MusicGroup",
      name: artist,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Release release={release} />
    </>
  );
};

export default Page;
