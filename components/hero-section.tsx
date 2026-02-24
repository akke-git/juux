
export function HeroSection() {
  const heroBadges = ["Self-hosted", "Tailscale Secure", "8 Services"];

  return (
    <section className="hero">
      <div className="hero__overlay"></div>
      <div className="container hero__content">
        <div className="hero__badges">
          {heroBadges.map((badge) => (
            <span key={badge} className="hero__badge">
              {badge}
            </span>
          ))}
        </div>
        <h1 className="hero__title">
          Juux.net
        </h1>
        <p className="hero__subtitle">
          컨텐츠 추가중
        </p>
      </div>
    </section>
  );
}
