import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
        pathname: '/external/**',
      },
      {
        protocol: 'https',
        hostname: 'shared.steamstatic.com',
        pathname: '/store_item_assets/steam/apps/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.steamgriddb.com',
        pathname: '/grid/**',
      },
    ],
  },
};

export default nextConfig;