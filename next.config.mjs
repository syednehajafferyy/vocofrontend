/** @type {import("next").NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./lib/**/*", "./data/**/*"],
    "/**/*": ["./lib/**/*", "./data/**/*"]
  }
};

export default nextConfig;
