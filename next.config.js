/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['s3.filebase.com'],
    unoptimized: false,
  },
};

module.exports = nextConfig;

