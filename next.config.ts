import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Disable the client-side error overlay in production
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
  // Custom settings for error handling
  onError: {
    // Override the default error page
    errorPage: '/error',
  },
};

export default nextConfig;
