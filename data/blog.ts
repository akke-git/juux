export type BlogPost = {
  date: string;
  title: string;
  desc: string;
  image: string;
  url: string;
};

export const blogPosts: BlogPost[] = [
  {
    date: "Favorite",
    title: "Personal info",
    desc: "개인 정보 페이지 바로가기",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
    url: "http://juux:6806/stage/build/desktop/?r=pbj097e"
  },
  {
    date: "Favorite",
    title: "Site / Account",
    desc: "사이트 및 계정 페이지 바로가기",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    url: "http://juux:6806/stage/build/desktop/?r=pbj097e"
  },
  {
    date: "Favorite",
    title: "Car history",
    desc: "차량 이력 페이지 바로가기",
    image:
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80",
    url: "http://juux:6806/stage/build/desktop/?r=pbj097e"
  }
];
