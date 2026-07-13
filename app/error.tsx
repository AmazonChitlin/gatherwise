"use client";

import { useEffect } from "react";
import { ButtonLink, Card, PageContainer, Badge } from "@/components/ui";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen">
      <PageContainer className="max-w-4xl py-10">
        <Card className="p-6">
          <Badge tone="alert">Something went wrong</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.03em]">
            We could not load that page right now.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Try the page again. If it still does not load, start from the home
            page or use the guided form.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="local-button focus-ring bg-[var(--primary)] text-white"
              onClick={() => reset()}
              type="button"
            >
              Try again
            </button>
            <ButtonLink href="/intake" tone="secondary">
              Use the guided form
            </ButtonLink>
          </div>
        </Card>
      </PageContainer>
    </main>
  );
}
