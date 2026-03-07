/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'replicate.delivery', pathname: '/**' },
      { protocol: 'https', hostname: '*.replicate.delivery', pathname: '/**' },
      { protocol: 'https', hostname: 'tryon-api.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
