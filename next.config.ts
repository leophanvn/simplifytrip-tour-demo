import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Ảnh Unsplash hotlink trực tiếp từ CDN Unsplash (đúng hướng dẫn của Unsplash), không qua bộ tối ưu ảnh của Vercel
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Bản demo preview: chặn công cụ tìm kiếm index
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
