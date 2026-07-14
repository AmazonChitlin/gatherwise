import Link from "next/link";

const footerLinks = [
  { href: "/intake", label: "Plan an event" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
  { href: "/showcase", label: "Showcase" }
];

export function SiteFooter() {
  return (
    <footer className="civic-footer">
      <div className="civic-footer__grid">
        <section className="civic-footer__statement">
          <p className="civic-kicker">Ready. Set. Local.</p>
          <h2>Follow the facts.<br />Check the source.</h2>
        </section>

        <nav aria-label="Footer navigation" className="civic-footer__nav">
          <p>Explore</p>
          {footerLinks.map((link) => (
            <Link className="focus-ring" href={link.href} key={link.href}>{link.label}</Link>
          ))}
        </nav>

        <section className="civic-footer__scope">
          <p>Arizona pilot</p>
          <span>Maricopa County launch coverage</span>
          <span>Informational guidance only</span>
          <span>Sources can change</span>
          <span>Human verification recommended</span>
        </section>
      </div>

      <div className="civic-footer__wordmark" aria-hidden="true">Gatherwise</div>
      <div className="civic-footer__legal">
        <span>AI-powered event readiness for organizers, vendors, and venues</span>
        <span>Unsupported jurisdictions are refused</span>
      </div>
    </footer>
  );
}
