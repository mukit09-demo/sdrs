"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface RevealProps {
  children: ReactNode;
  /** Delay in milliseconds, for staggering siblings. */
  delay?: number;
  className?: string;
}

/**
 * Fades and lifts its children into view once.
 *
 * Content is always in the DOM and the animation is CSS-only, so this degrades
 * to plain visible content without JavaScript, and the reduced-motion rule in
 * `globals.css` removes the movement for anyone who has asked for that.
 *
 * Renders a plain `div` deliberately — semantics belong to the surrounding
 * markup, not to an animation wrapper.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // No IntersectionObserver (old browser, jsdom): reveal immediately by
    // writing to the DOM rather than to state, so nothing is ever left hidden.
    if (typeof IntersectionObserver === "undefined") {
      element.classList.add("reveal-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("reveal", isVisible && "reveal-visible", className)}
    >
      {children}
    </div>
  );
}
