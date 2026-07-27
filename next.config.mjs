/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Supabase Storage, Google и т.б. — осылар үшін сурет прокси ашық
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2gb',
    },
  },
  // Vercel-де /uploads/* маршруттары қажет емес (Supabase Storage қолданылады),
  // бірақ локалды dev үшін кэш және range-headers сақтаймыз.
  async headers() {
    return [
      {
        source: '/uploads/videos/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Accept-Ranges', value: 'bytes' },
        ],
      },
      {
        source: '/uploads/posters/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
