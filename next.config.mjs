/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // BACKEND_URL is a server-side-only variable (no NEXT_PUBLIC_ prefix).
    // It is never baked into the client bundle — only the Next.js Node.js server reads it.
    //   Local dev:  BACKEND_URL=http://localhost:3131  (in .env.local)
    //   Production: BACKEND_URL=https://recruiters.magnahirejobs.in  (set on EC2 as env var)
    //
    // With this proxy in place:
    //   - Browser calls /api/* on the SAME origin (magnahirejobs.in) — no CORS preflight at all
    //   - Cookies are same-site — no SameSite=None needed
    //   - Session works perfectly across login / register / dashboard / apply
    const backend = (process.env.BACKEND_URL || 'http://localhost:3131').replace(/\/$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
