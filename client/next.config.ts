import withLess from 'next-with-less';
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  lessLoaderOptions: {
    lessOptions: {
      javascriptEnabled: true,
    },
  },
  images: {
      domains: ['localhost'],
  },
};

const withNextIntl = createNextIntlPlugin();

// Compose plugins:
export default withNextIntl(withLess(nextConfig));
