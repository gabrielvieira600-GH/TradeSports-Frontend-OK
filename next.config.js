/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      { source: '/nbaoeste', destination: '/NBAoeste' },
      { source: '/nbaleste', destination: '/NBAleste' },
      { source: '/nfloeste', destination: '/NFLoeste' },
      { source: '/nflleste', destination: '/NFLleste' },
    ];
  },
};

export default nextConfig;
