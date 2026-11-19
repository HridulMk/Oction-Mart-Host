/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['placehold.co'], // <-- Add 'placehold.co' here
    // If you plan to use images from other sources (e.g., your cloud storage like AWS S3 or Google Cloud Storage),
    // you will need to add those domains here as well. For example:
    // domains: ['placehold.co', 'your-s3-bucket-name.s3.amazonaws.com', 'storage.googleapis.com'],
  },
};

module.exports = nextConfig;