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
    <footer className="border-t border-[var(--line)] bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-[1.1fr_0.9fr_1fr]">
        <section>
          <div className="inline-flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3">
            <div className="rounded-[var(--radius-control)] border-2 border-[var(--secondary)] bg-[var(--primary-soft)] px-3 py-2">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--secondary)]">
                Gatherwise
              </p>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--primary-strong)]">
                Arizona pilot
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--primary)]">
                Ready. Set. Local.
              </p>
              <p className="text-xs text-[var(--muted)]">
                AI-powered event readiness for organizers, vendors, and venues
              </p>
            </div>
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            Gatherwise helps Arizona pilot users sort event details, understand
            what may apply, and check official sources before event day.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Explore
          </h2>
          <nav aria-label="Footer navigation" className="mt-3 grid gap-2">
            {footerLinks.map((link) => (
              <Link
                className="focus-ring rounded-sm text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Scope
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Arizona pilot coverage focuses on Maricopa County and the launch
            cities listed in the guided form.
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Informational guidance only. Gatherwise does not submit permits,
            approve events, or replace official instructions. Check the
            official source because requirements can change.
          </p>
        </section>
      </div>
    </footer>
  );
}
