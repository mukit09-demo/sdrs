"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { INITIAL_LOGIN_STATE } from "@/lib/auth/auth";
import { loginAction } from "@/lib/auth/auth.action";

/**
 * The sign-in form. Mirrors `EnquiryForm`: a server action via `useActionState`,
 * so validation and the credential check both happen on the server and the typed
 * username survives a rejection. The password never comes back.
 */
export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, INITIAL_LOGIN_STATE);

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="next" value={next} />

      {state.message && (
        <p
          role="alert"
          className="border border-danger-500 bg-danger-50 p-4 text-sm text-danger-700"
        >
          {state.message}
        </p>
      )}

      <TextField
        id="username"
        label="Username"
        required
        autoComplete="username"
        autoFocus
        error={state.errors.username}
        defaultValue={state.username ?? ""}
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        required
        autoComplete="current-password"
        error={state.errors.password}
      />

      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
