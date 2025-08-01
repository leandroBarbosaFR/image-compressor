import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public", // service worker will be generated here
  register: true,
  skipWaiting: true,
});

const nextConfig = withPWA({
  /* your existing config options */
});

export default nextConfig;
