import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
      {
        protocol: 'https',
        hostname: 'zcsmcvarypmqbtbfawqr.supabase.co',
        port: '', // Keep empty unless using a non-standard port
        pathname: '/storage/v1/object/sign/**', // allow any path under the signing endpoint
      },
    ],
  },
};

export default nextConfig;