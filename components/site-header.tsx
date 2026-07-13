import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/intake", label: "Check my event" },
  { href: "/about", label: "About / Disclaimer" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/95 shadow-[0_10px_30px_rgba(7,17,31,0.06)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <Link className="focus-ring flex items-center gap-3 rounded-sm" href="/">
          <img
            alt="EventLocal"
            className="h-10 w-auto"
            height={64}
            src="/brand/eventlocal-logo.png"
            width={330}
          />
          <span className="hidden border-l border-[var(--line)] pl-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] sm:block">
            Ready. Set. Local.
          </span>
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
          <ButtonLink className="py-2" href="/intake">
            Check my event
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
