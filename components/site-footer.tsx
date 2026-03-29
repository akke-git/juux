import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Golf", href: "/golf" },
  { label: "Blog", href: "/#blog" },
];
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
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="site-footer__top">
          <div>
            <p className="site-footer__logo">JUUX</p>
            <p className="site-footer__tagline">
              Personal server hub — Services, Golf, Blog
            </p>
          </div>

          <nav className="site-footer__links" aria-label="Footer navigation">
            <div>
              <h4>Navigation</h4>
              <ul>
                {navLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Services</h4>
              <ul>
                {serviceLinks.map((item) => (
                  <li key={item}>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <hr className="site-footer__divider" />

        <div className="site-footer__bottom">
          <p>© 2026 JUUX. All rights reserved.</p>
          <div className="site-footer__social" role="list" aria-label="Social links">
            <a href="#" aria-label="GitHub" role="listitem">GitHub</a>
            <a href="#" aria-label="Mail" role="listitem">Mail</a>
            <a href="#" aria-label="RSS" role="listitem">RSS</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
