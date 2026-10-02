import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const widths = {
  /** Editorial body copy — comfortable measure for reading. */
  narrow: "max-w-3xl",
  /**
   * Default page width. Wide on purpose: the header logo is the first thing
   * this gutter sets, and it reads as the page's left edge, so the measure is
   * generous rather than centred. Prose is held in by `max-w-*` on the headings
   * and paragraphs themselves, not by this.
   */
  default: "max-w-[110rem]",
  /** Edge-to-edge grids and full-bleed imagery — the gutter and nothing else. */
  wide: "max-w-none",
} as const;

export interface ContainerProps {
  children: ReactNode;
  width?: keyof typeof widths;
  as?: ElementType;
  className?: string;
}

/** Horizontal gutters and max-width, applied consistently across every page. */
export function Container({
  children,
  width = "default",
  as: Tag = "div",
  className,
}: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full px-6 md:px-10", widths[width], className)}>
      {children}
    </Tag>
  );
}
