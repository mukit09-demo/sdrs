import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";

const variants = {
  /** Primary action. */
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 border border-transparent",
  /** Secondary action on a light surface. */
  secondary:
    "bg-transparent text-ink-900 border border-ink-300 hover:border-ink-900 hover:bg-ink-50",
  /** Secondary action on a dark surface. */
  inverse:
    "bg-transparent text-white border border-white/35 hover:border-white hover:bg-white/10",
  /** Inline text action — the default for "read more" style links. */
  link: "bg-transparent border-0 p-0 text-ink-900 hover:text-brand-600 underline-offset-4 hover:underline",
} as const;

const sizes = {
  sm: "text-sm px-4 py-2 gap-1.5",
  md: "text-sm px-6 py-3 gap-2",
  lg: "text-base px-8 py-4 gap-2.5",
} as const;

export type ButtonVariant = keyof typeof variants;

interface CommonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
  /** Appends a directional arrow; `external` uses the up-right variant. */
  icon?: "arrow" | "external" | "none";
  className?: string;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Renders a `<button>`, a Next `<Link>`, or a plain `<a>` for external URLs,
 * depending on `href`. One component so that focus, spacing and hover states
 * stay identical across all three.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon = "none",
  className,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "group/button inline-flex items-center justify-center font-medium",
    "transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    variant !== "link" && sizes[size],
    className,
  );

  const content = (
    <>
      {children}
      {icon === "arrow" && (
        <ArrowRightIcon className="size-4 shrink-0 transition-transform duration-200 group-hover/button:translate-x-1" />
      )}
      {icon === "external" && (
        <ArrowUpRightIcon className="size-4 shrink-0 transition-transform duration-200 group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5" />
      )}
    </>
  );

  if (rest.href === undefined) {
    const { href: _ignored, ...buttonProps } = rest as ButtonAsButton;
    return (
      <button type="button" className={classes} {...buttonProps}>
        {content}
      </button>
    );
  }

  const { href, ...linkProps } = rest as ButtonAsLink;
  const isExternal = /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={classes}
        {...linkProps}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...linkProps}>
      {content}
    </Link>
  );
}
