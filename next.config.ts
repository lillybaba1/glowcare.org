
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*.cloudworkstations.dev',
    '6000-firebase-studio-1751794696136.cluster-oayqgyglpfgseqclbygurw4xd4.cloudworkstations.dev',
  ],
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
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Use polling for file watching in development to avoid issues in some containerized environments.
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };

    // Exclude firebase from being bundled on the server.
    if (isServer) {
        config.externals = [...(config.externals || []), 'firebase'];
    }

    return config;
  },
};

export default nextConfig;
