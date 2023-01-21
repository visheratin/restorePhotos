/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@visheratin/web-ai'],
  images: {
    domains: ["upcdn.io", "replicate.delivery"],
  },
  webpack: (config, { }) => {
    config.resolve.fallback = { 
      fs: false,
    };
    return config;
  },
};
