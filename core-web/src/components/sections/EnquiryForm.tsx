"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { CheckIcon } from "@/components/ui/Icon";
import {
  initialEnquiryState,
  type EnquiryField,
  type EnquiryFormState,
} from "@/lib/content/enquiry";
import { submitEnquiryAction } from "@/lib/content/enquiry.action";
import type { EnquiryTopic } from "@sdrs/shared/types/content";

export interface EnquiryFormProps {
  topics: EnquiryTopic[];
}

/**
 * Contact form. State lives in the server action (`submitEnquiryAction`) so the
 * validation rules cannot drift between client and server, and `useActionState`
 * gives the pending state without a second source of truth.
 */
export function EnquiryForm({ topics }: EnquiryFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitEnquiryAction,
    initialEnquiryState,
  );

  if (state.status === "success") {
    return (
      <div className="border-t-2 border-brand-500 bg-ink-50 p-8">
        <CheckIcon className="size-8 text-brand-500" />
        <h3 className="font-display mt-4 text-2xl font-medium text-ink-900">
          Thank you — your enquiry is with us.
        </h3>
        <p className="mt-3 text-ink-600">
          A member of the team will reply within two working days. Your reference is{" "}
          <span className="font-medium text-ink-900">{state.reference}</span>.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {state.status === "error" && state.message && (
        <p role="alert" className="border-l-2 border-brand-500 bg-brand-50 p-4 text-sm text-ink-800">
          {state.message}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="name"
          label="Your name"
          required
          autoComplete="name"
          defaultValue={valueOf(state, "name")}
          error={errorFor(state, "name")}
        />
        <TextField
          id="email"
          label="Email address"
          type="email"
          required
          autoComplete="email"
          defaultValue={valueOf(state, "email")}
          error={errorFor(state, "email")}
        />
      </div>

      <TextField
        id="organisation"
        label="Organisation"
        hint="Optional — helps us route your enquiry."
        autoComplete="organization"
        defaultValue={valueOf(state, "organisation")}
        error={errorFor(state, "organisation")}
      />

      <SelectField
        id="topic"
        label="What is your enquiry about?"
        required
        placeholder="Select a topic"
        options={topics}
        defaultValue={valueOf(state, "topic")}
        error={errorFor(state, "topic")}
      />

      <TextAreaField
        id="message"
        label="Your message"
        required
        hint="Tell us about the challenge, the location and your timescales."
        defaultValue={valueOf(state, "message")}
        error={errorFor(state, "message")}
      />

      <div className="flex flex-wrap items-center gap-6">
        <Button type="submit" size="lg" icon="arrow" disabled={isPending}>
          {isPending ? "Sending…" : "Send enquiry"}
        </Button>
        <p className="text-xs text-ink-500">
          We use your details only to respond to this enquiry.
        </p>
      </div>
    </form>
  );
}

function errorFor(state: EnquiryFormState, field: EnquiryField): string | undefined {
  return state.status === "error" ? state.errors[field] : undefined;
}

function valueOf(state: EnquiryFormState, field: EnquiryField): string | undefined {
  return state.status === "error" ? state.values[field] : undefined;
}
