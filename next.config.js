const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: isProd ? 'export' : undefined,
  basePath: isProd ? '/dialogue-tree' : ''
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer(nextConfig);
