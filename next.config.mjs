/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['utfs.io'],
    },
};

export default nextConfig;
// nextJs for some reason ask to make outerfiles to be a whitelist , we are putting "utfs.io"
// the images from uploadthings as a part of whitelist