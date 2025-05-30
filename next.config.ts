
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  // Add basePath and assetPrefix for GitHub Pages deployment
  basePath: '/EmojiTetriz', // Replace with your repository name
  assetPrefix: '/EmojiTetriz/', // Replace with your repository name and add a trailing slash
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent 'async_hooks' from being bundled on the client
      // This is a common issue when server-side libraries like OpenTelemetry
      // (used by Genkit) are processed by the client-side bundler.
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}), // Spread existing fallbacks if any
        async_hooks: false,
      };
    }
    return config;
  },
};

export default nextConfig;
