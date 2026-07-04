import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname),
  basePath: '/admin',
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
