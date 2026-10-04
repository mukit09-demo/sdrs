"use server";

import { redirect } from "next/navigation";
import { routes } from "@/lib/config/routes";
import {
  hasErrors,
  readField,
  readFields,
  validateFields,
} from "@sdrs/shared/utils/validate";
import {
  CREDENTIALS_REJECTED,
  LOGIN_FIELDS,
  type LoginFormState,
  loginRules,
} from "./auth";
import { authenticate } from "./credentials";
import { createSession, deleteSession } from "./session";

/**
 * Server action behind the login form. Validation and credential checking both
 * happen here, on the server, so the gate holds regardless of the client — the
 * same arrangement as core-web's `lib/content/enquiry.action.ts`.
 */
export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const values = readFields(formData, LOGIN_FIELDS);
  const errors = validateFields(values, loginRules);

  if (hasErrors(errors)) {
    return { status: "error", errors, username: values.username };
  }

  let user = null;
  try {
    user = await authenticate(values.username, values.password);
  } catch (error) {
    // A missing or malformed ADMIN_PASSWORD_HASH, or an unreadable account
    // store, lands here. Say so in the log, not in the response.
    console.error("Credential check failed", error);
    return {
      status: "error",
      errors: {},
      username: values.username,
      message: "Sign-in is not configured on this server.",
    };
  }

  if (!user) {
    return {
      status: "error",
      errors: {},
      username: values.username,
      message: CREDENTIALS_REJECTED,
    };
  }

  await createSession(user);

  // `next` comes from the proxy's redirect. Only ever follow a path inside this
  // app, so a crafted `?next=https://elsewhere` — or `?next=//elsewhere`, which
  // a browser also reads as an absolute URL — cannot use this as an open
  // redirect.
  redirect(safeNext(readField(formData, "next")));
}

/** A same-app path, or the dashboard. Never anything that could leave the host. */
function safeNext(next: string): string {
  const isRelativePath = next.startsWith("/") && !next.startsWith("//");
  return isRelativePath && next !== routes.login ? next : routes.dashboard;
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect(routes.login);
}
