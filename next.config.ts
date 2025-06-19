/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:5328/api/:path*' : '/api/',
      },
    ]
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
}

module.exports = nextConfig
