import Link from "next/link";
import type { LinkProps } from "next/link";
import type { ReactNode } from "react";
import { clsx } from "clsx";

type BoxProps = {
  children: ReactNode;
  className?: string;
};

type BadgeTone =
  | "primary"
  | "secondary"
  | "highlight"
  | "success"
  | "warning"
  | "alert"
  | "verified"
  | "neutral";

type ButtonTone = "primary" | "secondary" | "ghost";

export function PageContainer({ children, className }: BoxProps) {
  return (
    <section className={clsx("mx-auto max-w-7xl px-5 py-8", className)}>
      {children}
    </section>
  );
}

export function Card({ children, className }: BoxProps) {
  return <div className={clsx("local-card", className)}>{children}</div>;
}

export function CalloutPanel({ children, className }: BoxProps) {
  return <section className={clsx("local-callout", className)}>{children}</section>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-black leading-tight tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return <span className={clsx("local-badge", badgeToneClass[tone])}>{children}</span>;
}

export function ButtonLink({
  children,
  className,
  tone = "primary",
  ...props
}: LinkProps & {
  children: ReactNode;
  className?: string;
  tone?: ButtonTone;
}) {
  return (
    <Link className={clsx("local-button", buttonToneClass[tone], className)} {...props}>
      {children}
    </Link>
  );
}

const badgeToneClass: Record<BadgeTone, string> = {
  primary: "bg-[var(--primary-soft)] text-[var(--primary-strong)]",
  secondary: "bg-[var(--secondary-soft)] text-[var(--secondary-strong)]",
  highlight: "bg-[var(--highlight-soft)] text-[var(--highlight-strong)]",
  success: "bg-[var(--success-soft)] text-[var(--success-strong)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning-strong)]",
  alert: "bg-[var(--alert-soft)] text-[var(--alert-strong)]",
  verified: "bg-[var(--verified-soft)] text-[var(--verified-strong)]",
  neutral: "bg-[var(--sand)] text-[var(--muted)]"
};

const buttonToneClass: Record<ButtonTone, string> = {
  primary: "bg-[var(--primary)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--primary-strong)]",
  secondary:
    "border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--primary)]",
  ghost: "border border-transparent bg-transparent text-[var(--muted)]"
};
