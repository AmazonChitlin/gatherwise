import Link from "next/link";
import { PageContainer, Card, ButtonLink, Badge } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <PageContainer className="max-w-4xl py-10">
        <Card className="p-6">
          <Badge tone="warning">Page not found</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.03em]">
            We could not find that page.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Try going back to the Arizona pilot homepage or start with planning
            an event.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/">Go to home</ButtonLink>
            <Link
              className="focus-ring inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] px-3 py-2 text-sm font-semibold text-[var(--primary-strong)] underline"
              href="/intake"
            >
              Plan an event
            </Link>
          </div>
        </Card>
      </PageContainer>
    </main>
  );
}
