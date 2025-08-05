/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: true, // Disable server-side optimization to prevent timeouts
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Disable server-side image optimization for Cloudinary
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'sharp': 'commonjs sharp',
      });
    }
    return config;
  },
  // Add environment variables for better error handling
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Optimize for Render deployment
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
};

module.exports = nextConfig;
