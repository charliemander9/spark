/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bake build metadata so the app can show "last deployed" in Settings.
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_GIT_SHA:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
  },
};

export default nextConfig;
