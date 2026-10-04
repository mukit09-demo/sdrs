import type { ReactNode } from "react";
import { Container, type ContainerProps } from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";

const tones = {
  default: "bg-white text-ink-900",
  muted: "bg-ink-50 text-ink-900",
  dark: "bg-ink-950 text-white",
  brand: "bg-brand-600 text-white",
} as const;

const spacings = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-32",
} as const;

export interface SectionProps {
  children: ReactNode;
  tone?: keyof typeof tones;
  spacing?: keyof typeof spacings;
  width?: ContainerProps["width"];
  /** Anchor target for in-page navigation. */
  id?: string;
  /** Skips the `<Container>`, for full-bleed content. */
  bleed?: boolean;
  className?: string;
}

/**
 * Vertical rhythm and background tone for a page band. Pages are assembled from
 * these rather than setting their own padding, which keeps spacing consistent.
 */
export function Section({
  children,
  tone = "default",
  spacing = "md",
  width = "default",
  id,
  bleed = false,
  className,
}: SectionProps) {
  return (
    <section id={id} className={cn(tones[tone], spacings[spacing], className)}>
      {bleed ? children : <Container width={width}>{children}</Container>}
    </section>
  );
}
