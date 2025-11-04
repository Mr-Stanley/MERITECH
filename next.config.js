/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.filebase.com',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ['s3.filebase.com'],
    unoptimized: false,
  },
};

module.exports = nextConfig;

