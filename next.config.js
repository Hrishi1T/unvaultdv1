/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "vkqfvbcdsgqczisqkeap.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};


module.exports = nextConfig;
