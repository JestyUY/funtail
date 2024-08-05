/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  api: {
    bodyParser: {
      json: {
        sizeLimit: '50mb',
      },
    },
  },
};

export default nextConfig;
