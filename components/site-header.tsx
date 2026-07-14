import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const navItems = [
  { href: "/intake", label: "Plan an event" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
  { href: "/showcase", label: "Showcase" }
];

export function SiteHeader() {
  return (
    <header className="civic-header">
      <div className="civic-header__inner">
        <Link aria-label="Gatherwise home" className="civic-brand focus-ring" href="/">
          <span className="civic-brand__mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="civic-brand__word">Gatherwise</span>
        </Link>

        <nav aria-label="Primary navigation" className="civic-nav">
          {navItems.map((item) => (
            <Link className="civic-nav__link focus-ring" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link aria-label="Describe an event with Gatherwise" className="civic-header__action focus-ring" href="/intake?path=describe">
          Start a route
          <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </header>
  );
}
