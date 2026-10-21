/**
 * A `<script>` that runs synchronously as the browser parses the HTML, before
 * first paint.
 *
 * The `type` flip is not a trick for its own sake: React warns in development
 * whenever a render produces a `<script>` tag, so the server emits real
 * JavaScript and the client emits inert `text/plain`. The script has already
 * done its work by the time the client renders — it ran during parsing — and
 * `suppressHydrationWarning` is what lets the two types disagree.
 *
 * Only useful on a hard navigation. React inserts DOM nodes on a soft
 * navigation rather than letting the browser parse them, and inserted scripts
 * do not execute, which is why every caller must also format correctly in its
 * own client render.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
