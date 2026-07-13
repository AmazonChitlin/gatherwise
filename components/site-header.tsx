import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui";

const navItems = [
  { href: "/intake", label: "Plan an event" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
  { href: "/showcase", label: "Showcase" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/95 shadow-[0_10px_30px_rgba(7,17,31,0.06)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <Link
          aria-label="Gatherwise home"
          className="focus-ring flex items-center gap-3 rounded-sm"
          href="/"
        >
          <div className="rounded-[var(--radius-control)] border-2 border-[var(--secondary)] bg-[var(--primary-soft)] px-3 py-2">
            <span className="block text-xs font-black uppercase tracking-[0.16em] text-[var(--secondary)]">
              Gatherwise
            </span>
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--primary-strong)]">
              Arizona pilot
            </span>
          </div>
          <div>
            <span className="block text-sm font-semibold text-[var(--foreground)]">
              Ready. Set. Local.
            </span>
            <span className="block text-xs text-[var(--muted)]">
              Event readiness for organizers, vendors, and venues
            </span>
          </div>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                className="focus-ring rounded-full px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary-strong)]"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ButtonLink aria-label="Plan an event with Gatherwise" className="py-2" href="/intake">
            Plan an event
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
