import withLess from 'next-with-less';
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Don't fail the production build on lint warnings/errors (TypeScript type
  // checking still runs). Run `npm run lint` separately to see them.
  eslint: {
    ignoreDuringBuilds: true,
  },
  lessLoaderOptions: {
    lessOptions: {
      javascriptEnabled: true,
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

// Compose plugins:
export default withNextIntl(withLess(nextConfig));
