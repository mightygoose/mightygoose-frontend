import type { Metadata } from "next";
import Releases from "./Releases";
import getReleases from "./getReleases";

interface PageProps {
  searchParams: {
    tag: string | Array<string>;
  };
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const tags = ([] as Array<string>).concat(searchParams.tag || []);
  const tagsText = tags.length ? ` tagged ${tags.join(", ")}` : "";

  const title = `Latest Releases${tagsText} | Mightygoose.com`;
  const description = `MightyGoose.com is the ultimate music blog aggregator for fans of ${
    tags.length ? tags.join(", ") : "Rock, Electronic, Jazz, Pop, Hip-Hop"
  } and more. Discover latest added releases${tagsText}`;

  const queryString = tags.length
    ? tags.map((tag) => `tag=${tag}`).join("&")
    : "";

  const canonical = `http://mightygoose.com/releases${
    queryString ? `?${queryString}` : ""
  }`;

  return {
    title,
    description,
    keywords: [...tags],
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
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const tags = ([] as Array<string>).concat(searchParams.tag || []);
  const releases = await getReleases({ tags });
  return <Releases initial={releases} tags={tags} />;
};

export default Page;
