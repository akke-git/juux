const navLinks = ["Home", "Services", "Golf", "Blog"];
const serviceLinks = [
  "NPM",
  "Siyuan Note",
  "Portainer",
  "PhotoPrism",
  "FileBrowser",
  "NocoDB",
  "Emby",
  "Komga"
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div>
            <p className="site-footer__logo">JUUX</p>
            <p className="site-footer__tagline">
              Personal server hub — Services, Golf, Blog
            </p>
          </div>

          <div className="site-footer__links">
            <div>
              <h4>Navigation</h4>
              <ul>
                {navLinks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Services</h4>
              <ul>
                {serviceLinks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="site-footer__divider" />

        <div className="site-footer__bottom">
          <p>© 2026 JUUX. All rights reserved.</p>
          <div className="site-footer__social">
            <span>GitHub</span>
            <span>Mail</span>
            <span>RSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
