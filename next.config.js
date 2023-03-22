/** @type {import('next').NextConfig} */

const rewrites = () => {
  return [
    {
      source: "/api/:path*",
      destination: `${process.env.API_HOST}/api/:path*`,
    },
  ];
};

const nextConfig = {
  rewrites,
  experimental: {
    appDir: true,
  },
  output: "standalone",
};

module.exports = nextConfig;
