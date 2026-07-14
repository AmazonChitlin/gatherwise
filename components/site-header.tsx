"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
  { href: "/showcase", label: "Showcase" }
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    firstLinkRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

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

        <button
          aria-controls="civic-primary-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="civic-nav-toggle focus-ring"
          onClick={() => setMenuOpen((open) => !open)}
          ref={menuButtonRef}
          type="button"
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span>{menuOpen ? "Close" : "Menu"}</span>
        </button>

        <nav
          aria-label="Primary navigation"
          className="civic-nav"
          data-open={menuOpen ? "true" : "false"}
          id="civic-primary-navigation"
        >
          {navItems.map((item, index) => (
            <Link
              className="civic-nav__link focus-ring"
              href={item.href}
              key={item.href}
              onClick={closeMenu}
              ref={index === 0 ? firstLinkRef : undefined}
            >
              {item.label}
            </Link>
          ))}

          <Link
            aria-label="Start a Gatherwise readiness route"
            className="civic-header__action focus-ring"
            href="/intake?path=describe"
            onClick={closeMenu}
          >
            Start a route
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
