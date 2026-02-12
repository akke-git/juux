const heroBadges = ["Self-hosted", "Tailscale Secure", "8 Services"];

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__overlay" />
      <div className="hero__content container">
        <h1 className="hero__title">Juux.net</h1>
        <p className="hero__subtitle">
          개인 서버 기반의 서비스 허브. Docker 서비스, 골프 기록, 블로그
        </p>
        <div className="hero__badges">
          {heroBadges.map((badge) => (
            <span key={badge} className="hero__badge">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
