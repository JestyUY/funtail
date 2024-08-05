/** @type {import('next').NextConfig} */

module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: "40mb",
    },
  },
  api: {
    bodyParser: {
      json: {
        sizeLimit: "40mb",
      },
    },
  },
};
