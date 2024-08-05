/** @type {import('next').NextConfig} */

module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  api: {
    bodyParser: {
      json: {
        sizeLimit: "50mb",
      },
    },
  },
};
