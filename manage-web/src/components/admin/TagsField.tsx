"use client";

import { useState } from "react";
import { TextAreaField } from "@/components/ui/Field";
import { type FieldView, normaliseTag, normaliseTags } from "@/lib/admin/fields";

/** Enough to pick from without the list becoming the page. */
const MAX_SHOWN = 12;

/**
 * A `tags` field: one tag per line, with the tags already in use offered
 * underneath.
 *
 * Tags match by exact text — related reading on the public site is "other
 * articles carrying this article's first tag" — so `biuldings` saves without
 * complaint and simply matches nothing. Two things push against that: the
 * suggestions, filtered by whatever is on the line being typed, make picking an
 * existing spelling easier than typing one; and any tag no other article uses
 * is listed back, so a near-miss is visible before it is saved.
 *
 * Controlled rather than uncontrolled like its siblings, because the
 * suggestions depend on the text and the caret. The submitted value is the raw
 * text either way; `parseFields` normalises it on the server.
 */
export function TagsField({
  field,
  initial,
  error,
}: {
  field: FieldView;
  initial: string[];
  error?: string;
}) {
  const [text, setText] = useState(() => initial.join("\n"));
  const [caret, setCaret] = useState(0);

  const known = field.suggestions ?? [];
  const { start, end } = lineAround(text, caret);
  const query = normaliseTag(text.slice(start, end));
  const entered = normaliseTags(text.split("\n"));

  const matches = known
    .filter((tag) => !entered.includes(tag) && (!query || tag.includes(query)))
    .slice(0, MAX_SHOWN);

  // The line still being typed is not flagged yet — "bui" is not a mistake.
  const unknown =
    known.length > 0
      ? entered.filter((tag) => tag !== query && !known.includes(tag))
      : [];

  /** Replaces the line under the caret with `tag` and moves to the next line. */
  function pick(tag: string) {
    const rest = text.slice(end);
    const next = text.slice(0, start) + tag + (rest.startsWith("\n") ? rest : `\n${rest}`);
    const nextCaret = start + tag.length + 1;

    setText(next);
    setCaret(nextCaret);

    // The click took focus off the textarea; give it back, caret on the new line.
    requestAnimationFrame(() => {
      const textarea = document.getElementById(field.name);
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.focus();
        textarea.setSelectionRange(nextCaret, nextCaret);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <TextAreaField
        id={field.name}
        label={field.label}
        hint={field.hint}
        error={error}
        required={field.required}
        rows={6}
        value={text}
        onChange={(event) => {
          setText(event.currentTarget.value);
          setCaret(event.currentTarget.selectionStart);
        }}
        onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
      />

      {matches.length > 0 && (
        <div>
          <p className="text-xs text-ink-500">
            {query ? `In use, matching “${query}”` : "In use on other articles"} — click
            to add
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {matches.map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => pick(tag)}
                  className="rounded-control border border-ink-300 bg-white px-2 py-1 font-mono text-xs text-ink-700 transition-colors hover:border-accent-500 hover:text-accent-700"
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p aria-live="polite" className="text-xs leading-relaxed text-ink-600">
        {unknown.length > 0 && (
          <>
            Not used on any other article yet:{" "}
            {unknown.map((tag, index) => (
              <span key={tag}>
                {index > 0 && ", "}
                <code className="font-mono text-ink-900">{tag}</code>
              </span>
            ))}
            . Check the spelling — a near-miss will not match anything.
          </>
        )}
      </p>
    </div>
  );
}

/** The bounds of the line the caret is on. */
function lineAround(text: string, caret: number): { start: number; end: number } {
  const start = text.lastIndexOf("\n", caret - 1) + 1;
  const newline = text.indexOf("\n", caret);
  return { start, end: newline === -1 ? text.length : newline };
}
