/** @type {import('next').NextConfig} */
const nextConfig = {
  // De site werd stap voor stap overgezet; laat de build niet struikelen over
  // lintmeldingen. (ESLint is in dit project trouwens niet ingesteld.)
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    // Nodig voor @jsquash/jpeg, dat foto's in de browser verkleint (WebAssembly).
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
