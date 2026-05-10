/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "e.snmc.io",
      },
      {
        protocol: "https",
        hostname: "t2.genius.com",
      },
      {
        protocol: "https",
        hostname: "images.genius.com",
      },
    ],
  },
};

module.exports = nextConfig;