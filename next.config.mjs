/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // @react-pdf/renderer n'est pas bundlé : il est chargé tel quel côté serveur
    // (génération du PDF dans les route handlers).
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

export default nextConfig;
