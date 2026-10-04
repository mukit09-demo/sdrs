import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The CMS's button. Same shape as core-web's so the form components move across
 * unchanged, but styled as a tool rather than as marketing: rounded controls,
 * no hover animation, no arrow affordances.
 */
const variants = {
  primary:
    "bg-accent-500 text-white border border-transparent hover:bg-accent-600 active:bg-accent-700",
  secondary:
    "bg-white text-ink-800 border border-ink-300 hover:border-ink-400 hover:bg-ink-50",
  danger:
    "bg-white text-danger-600 border border-danger-200 hover:bg-danger-50 hover:border-danger-500",
  /** Inline text action. */
  link: "bg-transparent border-0 p-0 text-ink-700 hover:text-accent-600 underline-offset-4 hover:underline",
} as const;

const sizes = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
} as const;

export type ButtonVariant = keyof typeof variants;

interface CommonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
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

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center font-medium transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    variant !== "link" && `rounded-control ${sizes[size]}`,
    className,
  );

  if (rest.href === undefined) {
    const { href: _ignored, ...buttonProps } = rest as ButtonAsButton;
    return (
      <button type="button" className={classes} {...buttonProps}>
        {children}
      </button>
    );
  }

  const { href, ...linkProps } = rest as ButtonAsLink;
  const isExternal = /^(https?:)?\/\//.test(href);

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={classes}
        {...linkProps}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...linkProps}>
      {children}
    </Link>
  );
}
