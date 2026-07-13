import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/intake", label: "Check my event" },
  { href: "/about", label: "About / Disclaimer" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <section>
          <img
            alt="EventLocal"
            className="h-10 w-auto"
            height={64}
            src="/brand/eventlocal-logo.png"
            width={330}
          />
          <p className="text-sm font-semibold text-[var(--primary)]">
            Ready. Set. Local.
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            Practical local event readiness guidance for Arizona vendors, food
            sellers, artists, market hosts, small organizers, and venues.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Links
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
            Launch area
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Current MVP coverage focuses on Arizona, Maricopa County, and the
            Phoenix-area launch cities listed in the intake flow.
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Informational guidance only. EventLocal does not submit permits,
            provide legal advice, or guarantee compliance. Confirm details with
            the relevant agency because requirements can change.
          </p>
        </section>
      </div>
    </footer>
  );
}
