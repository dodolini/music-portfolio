declare module 'next-with-less' {
  import type { NextConfig } from 'next';
  interface WithLessOptions extends NextConfig {
    lessLoaderOptions?: Record<string, unknown>;
  }
  export default function withLess(config: WithLessOptions): NextConfig;
}
