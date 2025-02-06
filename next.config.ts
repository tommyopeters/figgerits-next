import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  onError: (err: Error) => {
    console.error('Next.js Error:', err);
  },
};

export default nextConfig;
