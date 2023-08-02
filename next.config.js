/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.com',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: '"pbxt.replicate.delivery"',
      },
      {
        protocol: 'https',
        hostname: 'sketch-canvas-images.s3.ca-central-1.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
