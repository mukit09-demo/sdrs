"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** `id` of the panel open on first render. */
  defaultOpenId?: string;
  /** Allow several panels open at once. */
  allowMultiple?: boolean;
  className?: string;
}

/**
 * Keyboard- and screen-reader-accessible disclosure list.
 *
 * Built on buttons with `aria-expanded`/`aria-controls` rather than
 * `<details>`, so the open/closed state can be controlled and animated.
 */
export function Accordion({
  items,
  defaultOpenId,
  allowMultiple = false,
  className,
}: AccordionProps) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<string[]>(
    defaultOpenId ? [defaultOpenId] : [],
  );

  function toggle(id: string) {
    setOpenIds((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      return allowMultiple ? [...current, id] : [id];
    });
  }

  return (
    <div className={cn("divide-y divide-ink-200 border-y border-ink-200", className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;

        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-brand-600"
              >
                <span className="font-display text-lg font-medium md:text-xl">
                  {item.title}
                </span>
                <span
                  aria-hidden="true"
                  className="relative grid size-8 shrink-0 place-items-center border border-ink-300"
                >
                  <span className="absolute h-px w-3.5 bg-current" />
                  <span
                    className={cn(
                      "absolute h-3.5 w-px bg-current transition-transform duration-300",
                      isOpen && "rotate-90",
                    )}
                  />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-6"
            >
              <p className="max-w-3xl text-ink-600">{item.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
