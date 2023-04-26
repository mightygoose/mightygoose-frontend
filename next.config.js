/** @type {import('next').NextConfig} */

const rewrites = () => {
  return [
    {
      source: "/api/:path*",
      destination: `${process.env.API_HOST}/api/:path*`,
    },
  ];
};

const redirects = async () => {
  return [
    {
      source: "/posts/tags/:tag",
      destination: `/releases?tag=:tag`,
      permanent: true,
    },
    {
      source: "/post/:id",
      destination: `/release/:id`,
      permanent: true,
    },
    {
      source: "/post/:id/:slug",
      destination: `/release/:id-:slug`,
      permanent: true,
    },
  ];
};

const nextConfig = {
  rewrites,
  redirects,
  experimental: {
    appDir: true,
  },
  output: "standalone",
};

module.exports = nextConfig;
