import HomePage from "./HomePage";
import getReleases from "./releases/getReleases";

const title = "Home | Mightygoose.com";
const description =
  "MightyGoose.com is the ultimate music blog aggregator for fans of Rock, Electronic, Jazz, Pop, Hip-Hop and more. Follow your favorite genres, bands, and labels and get the best music content";

export const metadata = {
  title,
  description,
  category: "music",
  alternates: {
    canonical: `http://mightygoose.com/`,
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
    description,
    url: "http://mightygoose.com",
    siteName: "Mightygoose.com",
    locale: "en-US",
    type: "website",
  },
};

const Home = async () => {
  const releases = await getReleases({ limit: 3 });
  return <HomePage releases={releases} />;
};

export default Home;
