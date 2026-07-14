import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleHelp, Info, Landmark, ScanText } from "lucide-react";
import { clsx } from "clsx";

type CivicSurface = "limestone" | "paper" | "dark";
type CivicStatusTone =
  | "verified"
  | "active"
  | "unknown"
  | "caution"
  | "critical"
  | "ai"
  | "source";

export function CivicPageShell({
  children,
  className,
  surface = "limestone"
}: {
  children: ReactNode;
  className?: string;
  surface?: CivicSurface;
}) {
  return (
    <div className={clsx("civic-page-shell", `civic-page-shell--${surface}`, className)}>
      {children}
    </div>
  );
}

export function CivicSection({
  children,
  className,
  contained = true,
  surface = "paper",
  ...props
}: ComponentProps<"section"> & {
  contained?: boolean;
  surface?: CivicSurface;
}) {
  return (
    <section
      className={clsx(
        "civic-foundation-section",
        `civic-foundation-section--${surface}`,
        className
      )}
      {...props}
    >
      {contained ? (
        <div className="civic-foundation-section__inner">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

export function CivicSectionLabel({
  children,
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p className={clsx("civic-section-label", className)} {...props}>
      {children}
    </p>
  );
}

export function CivicDataLabel({
  children,
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span className={clsx("civic-data-label-shared", className)} {...props}>
      {children}
    </span>
  );
}

export function CivicButtonLink({
  children,
  className,
  variant = "signal",
  ...props
}: ComponentProps<typeof Link> & {
  variant?: "signal" | "ink" | "outline-dark" | "outline-light";
}) {
  return (
    <Link
      className={clsx("civic-button", `civic-button--${variant}`, className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export function CivicStatus({
  children,
  className,
  tone
}: {
  children: ReactNode;
  className?: string;
  tone: CivicStatusTone;
}) {
  return (
    <span className={clsx("civic-status", `civic-status--${tone}`, className)}>
      <StatusIcon tone={tone} />
      <span>{children}</span>
    </span>
  );
}

export function CivicRouteMarker({
  children,
  className,
  tone = "active"
}: {
  children: ReactNode;
  className?: string;
  tone?: "active" | "verified" | "unknown";
}) {
  return (
    <span
      className={clsx(
        "civic-route-marker-shared",
        `civic-route-marker-shared--${tone}`,
        className
      )}
    >
      <span>{children}</span>
    </span>
  );
}

export function CivicNotice({
  children,
  className,
  title,
  tone = "info"
}: {
  children: ReactNode;
  className?: string;
  title: string;
  tone?: "info" | "caution" | "critical" | "verified";
}) {
  const Icon = tone === "verified" ? CheckCircle2 : tone === "info" ? Info : AlertTriangle;

  return (
    <aside className={clsx("civic-notice", `civic-notice--${tone}`, className)}>
      <Icon aria-hidden="true" />
      <div>
        <strong className="civic-notice__title">{title}</strong>
        <div className="civic-notice__body">{children}</div>
      </div>
    </aside>
  );
}

export function CivicWorkspacePanel({
  children,
  className,
  heading,
  headingLevel = "h2",
  label
}: {
  children: ReactNode;
  className?: string;
  heading: string;
  headingLevel?: "h2" | "h3";
  label?: string;
}) {
  const Heading = headingLevel;

  return (
    <section className={clsx("civic-workspace-panel", className)}>
      <header className="civic-workspace-panel__header">
        {label ? <CivicDataLabel>{label}</CivicDataLabel> : null}
        <Heading>{heading}</Heading>
      </header>
      <div className="civic-workspace-panel__body">{children}</div>
    </section>
  );
}

export function CivicDivider({ className }: { className?: string }) {
  return <hr aria-hidden="true" className={clsx("civic-divider", className)} />;
}

export function CivicEmptyState({
  actions,
  children,
  className,
  label = "No route data",
  headingLevel = "h2",
  title
}: {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  label?: string;
  headingLevel?: "h2" | "h3";
  title: string;
}) {
  const Heading = headingLevel;

  return (
    <section className={clsx("civic-empty-state", className)}>
      <CivicSectionLabel>{label}</CivicSectionLabel>
      <Heading>{title}</Heading>
      <div>{children}</div>
      {actions ? <div className="civic-empty-state__actions">{actions}</div> : null}
    </section>
  );
}

function StatusIcon({ tone }: { tone: CivicStatusTone }) {
  if (tone === "verified") return <CheckCircle2 aria-hidden="true" />;
  if (tone === "caution" || tone === "critical") return <AlertTriangle aria-hidden="true" />;
  if (tone === "ai") return <ScanText aria-hidden="true" />;
  if (tone === "source") return <Landmark aria-hidden="true" />;
  if (tone === "unknown") return <CircleHelp aria-hidden="true" />;
  return <Info aria-hidden="true" />;
}
