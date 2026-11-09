import type { NextConfig } from "next";

// juutoki(텍스트 수집)는 별도 컨테이너. akke 네트워크에서 이 이름으로 접근한다.
// rewrites는 빌드 시점에 고정되므로 바꾸려면 다시 빌드해야 한다.
const JUUTOKI_URL = process.env.JUUTOKI_URL ?? "http://juutoki:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // juutoki 화면은 상대 경로를 쓰므로 /toki/ 의 끝 슬래시가 지워지면 안 된다
  skipTrailingSlashRedirect: true,
  experimental: {
    // 본문 미리보기는 브라우저 렌더링을 기다리느라 30초(기본값)를 넘길 수 있다
    proxyTimeout: 120_000
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  async rewrites() {
    return [
      { source: "/toki/", destination: `${JUUTOKI_URL}/` },
      { source: "/toki/:path+", destination: `${JUUTOKI_URL}/:path+` }
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  }
};

export default nextConfig;
