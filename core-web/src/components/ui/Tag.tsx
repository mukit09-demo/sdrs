import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const tones = {
  default: "bg-ink-100 text-ink-700",
  brand: "bg-brand-50 text-brand-700",
  outline: "border border-ink-300 text-ink-600",
  inverse: "bg-white/15 text-white",
} as const;

export interface TagProps {
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}

/** Small non-interactive label for categories, locations and statuses. */
export function Tag({ children, tone = "default", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-medium tracking-wide uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
