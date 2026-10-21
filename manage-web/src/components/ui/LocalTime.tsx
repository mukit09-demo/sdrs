"use client";

import {
  LOCAL_DATETIME_LOCALE,
  LOCAL_DATETIME_OPTIONS,
} from "@sdrs/shared/utils/format";
import { useId } from "react";
import { InlineScript } from "./InlineScript";

/**
 * An instant, rendered in the operator's own time zone.
 *
 * The only zone-dependent string in this app, and the awkward shape is the
 * price of that. Everything else here formats identically everywhere because
 * `utils/format.ts` pins UTC; this deliberately does not, so the server and
 * the browser disagree by however many hours the operator is from the
 * container. Both halves below exist to cover one navigation each:
 *
 * - **Hard navigation.** The server renders its own zone into the `<time>`,
 *   then the inline script rewrites `textContent` while the browser is still
 *   parsing — before first paint, so there is no flash and nothing to see.
 *   `suppressHydrationWarning` tells React to keep the DOM's text rather than
 *   treat the difference as an error and re-render the subtree, which would
 *   discard the correction.
 * - **Soft navigation.** No parsing happens, so the script never runs; the
 *   client render above is already correct, because it runs in the browser.
 *
 * A `useEffect` would be simpler and wrong in a visible way: the operator
 * would see the server's time and watch it jump. See
 * `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`.
 *
 * `dateTime` carries the untouched instant, so the machine-readable value is
 * the UTC one whatever the text says.
 */
export function LocalTime({ instant }: { instant: string }) {
  const id = useId();
  const formatted = new Date(instant).toLocaleString(
    LOCAL_DATETIME_LOCALE,
    LOCAL_DATETIME_OPTIONS,
  );

  return (
    <>
      <time id={id} dateTime={instant} suppressHydrationWarning>
        {formatted}
      </time>
      <InlineScript
        html={`{var n=document.getElementById(${JSON.stringify(id)});if(n)n.textContent=new Date(${JSON.stringify(instant)}).toLocaleString(${JSON.stringify(LOCAL_DATETIME_LOCALE)},${JSON.stringify(LOCAL_DATETIME_OPTIONS)})}`}
      />
    </>
  );
}
