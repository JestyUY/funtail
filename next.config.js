/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: "40mb",
    },
  },
  api: {
    bodyParser: {
      sizeLimit: "40mb",
    },
  },
};
