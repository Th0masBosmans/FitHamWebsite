/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pages are ported incrementally; don't fail the build on lint while the
  // remaining routes are still being migrated.
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
