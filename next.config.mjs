/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: "40mb",
    },
  },
};

module.exports = nextConfig;
