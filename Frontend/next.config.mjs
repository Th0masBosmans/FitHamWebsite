/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint (.eslintrc.json) draait mee bij elke build: een fout houdt de build tegen.
  webpack(config) {
    // Nodig voor @jsquash/jpeg, dat foto's in de browser verkleint (WebAssembly).
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
