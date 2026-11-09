import Link from "next/link";

export function HeroSection() {
  const heroBadges = ["Self-hosted", "Tailscale Secure", "8 Services"];

  return (
    <section className="hero" aria-label="Site introduction">
      <div className="hero__overlay" aria-hidden="true"></div>
      <div className="container hero__content">
        <ul className="hero__badges" aria-label="Features">
          {heroBadges.map((badge) => (
            <li key={badge} className="hero__badge">
              {badge}
            </li>
          ))}
        </ul>
        <h1 className="hero__title">
          Juux.net
        </h1>
        <p className="hero__subtitle">
          컨텐츠 추가중
        </p>
        <div className="hero__links">
          <Link href="/drop" className="hero__linkButton">
            drop
          </Link>
          {/* 별도 컨테이너(juutoki)로 프록시되는 경로라 Next Link가 아닌 일반 링크 */}
          <a href="/toki/" className="hero__linkButton">
            toki
          </a>
        </div>
      </div>
    </section>
  );
}
