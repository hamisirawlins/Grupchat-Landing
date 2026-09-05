/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Old post-login entry point. Temporary, until the rebuilt experience
      // decides its own routes.
      { source: "/dashboard", destination: "/home", permanent: false },
      { source: "/dashboard/:path*", destination: "/home", permanent: false },
      // Invite links issued before the rebuild pointed at /join/<code>.
      { source: "/join/:code", destination: "/invite/:code", permanent: false },
    ];
  },
};

export default nextConfig;
