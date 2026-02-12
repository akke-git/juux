import Image from "next/image";
import { blogPosts } from "@/data/blog";

export function BlogSection() {
  return (
    <section className="blog">
      <div className="container">
        <header className="blog__head">
          <div>
            <p className="section-eyebrow">BLOG</p>
            <h2 className="section-title">Favorite Pages</h2>
          </div>
          <a href="#" className="ghost-link">
            블로그 전체 보기 →
          </a>
        </header>

        <div className="blog__grid">
          {blogPosts.map((post) => (
            <article className="blog-card" key={`${post.date}-${post.title}`}>
              <div className="blog-card__image-wrap">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="blog-card__image"
                />
              </div>
              <div className="blog-card__body">
                <p className="blog-card__date">{post.date}</p>
                <h3 className="blog-card__title">{post.title}</h3>
                <p className="blog-card__desc">{post.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
