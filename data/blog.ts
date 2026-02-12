export type BlogPost = {
  date: string;
  title: string;
  desc: string;
  image: string;
};

export const blogPosts: BlogPost[] = [
  {
    date: "2026.02.10",
    title: "개인 서버 구축기: Docker로 홈랩 운영하기",
    desc: "Docker Compose를 활용해 개인 서버에 여러 서비스를 효율적으로 운영하는 방법을 공유합니다.",
    image: "/images/generated-1770788887921.png"
  },
  {
    date: "2026.02.05",
    title: "골프 스코어 추적 앱을 직접 만들어본 이야기",
    desc: "라운드 기록과 통계를 한눈에 볼 수 있는 골프 트래커를 개발한 과정을 정리했습니다.",
    image: "/images/generated-1770788765111.png"
  },
  {
    date: "2026.01.28",
    title: "Nextcloud로 Google Drive 탈출하기",
    desc: "클라우드 서비스 종속에서 벗어나 자체 호스팅 스토리지로 전환한 경험을 공유합니다.",
    image: "/images/generated-1770788777852.png"
  }
];
