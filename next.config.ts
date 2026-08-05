import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // A stray lockfile above this directory makes Turbopack infer the wrong workspace root.
  turbopack: { root: import.meta.dirname },
  // Dev only: lets a phone on the same network load the dev server by LAN address.
  allowedDevOrigins: ['192.168.50.36'],
};

export default nextConfig;
