/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Fase 13 — habilita next/image para avatares Google.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
    ],
  },

  async headers() {
    return [
      // HTML não-imutável: revalida a cada request (evita bundle JS antigo após deploy)
      {
        source: '/((?!_next/static|favicon|.*\\.(jpg|jpeg|png|svg|webp|ico|woff2?|ttf)).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',      value: 'camera=(self), microphone=()' },
          // Fase 13 — adicionado HSTS (audit M18)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
