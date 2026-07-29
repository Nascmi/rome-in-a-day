/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
