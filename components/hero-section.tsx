const heroBadges = ["Self-hosted", "Tailscale Secure", "8 Services"];

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__overlay" />
      <div className="hero__content container">
        <h1 className="hero__title">Juux.net</h1>
        <p className="hero__subtitle">
          앱 서비스s, 개인 정보관리, golf match 관리
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
