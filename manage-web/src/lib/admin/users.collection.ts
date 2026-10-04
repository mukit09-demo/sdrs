import { requireAdmin } from "@/lib/auth/dal";
import { MIN_PASSWORD_LENGTH, hashPassword } from "@/lib/auth/password";
import { countByRole, users } from "@/lib/users/repository";
import {
  type AdminUser,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  USER_ROLES,
  isUserRole,
} from "@/types/user";
import { type AdminCollection, SaveRejected } from "./collections";
import { type FieldValues, str } from "./fields";

/**
 * Accounts, as a collection descriptor — so the generic list and form pages
 * serve them exactly as they serve markets or projects, and there are no bespoke
 * account screens to maintain.
 *
 * `adminOnly` is what sets it apart: the nav hides it from editors, and every
 * method here calls `requireAdmin()`. An editor can do everything else in the
 * CMS; accounts are the one thing they cannot touch.
 */

const USERNAME_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

export const usersCollection: AdminCollection = {
  name: "users",
  label: "Accounts",
  singular: "account",
  description:
    "Who can sign in to this CMS. Admins manage accounts; editors manage content only.",
  adminOnly: true,

  fields: [
    {
      name: "username",
      label: "Username",
      kind: "text",
      required: true,
      maxLength: 60,
      hint: "Lowercase letters, numbers, and single dots, dashes or underscores.",
      refine: (value) =>
        USERNAME_PATTERN.test(value)
          ? undefined
          : "Use lowercase letters and numbers, e.g. a.rahman or priya-r.",
    },
    {
      name: "name",
      label: "Full name",
      kind: "text",
      maxLength: 120,
      hint: "Optional. Shown in this list so the account is recognisable.",
    },
    {
      name: "role",
      label: "Role",
      kind: "select",
      required: true,
      options: USER_ROLES,
      hint: "Admins can manage accounts as well as content. Editors cannot.",
    },
    {
      name: "password",
      label: "Password",
      kind: "password",
      maxLength: 512,
      minLength: MIN_PASSWORD_LENGTH,
      hint: `At least ${MIN_PASSWORD_LENGTH} characters. Leave blank when editing to keep the current password.`,
    },
  ],

  async list() {
    await requireAdmin();

    return (await users.list()).map((user) => ({
      id: user.id,
      title: user.name ? `${user.name} (${user.username})` : user.username,
      meta: [
        `${ROLE_LABELS[user.role]} — ${ROLE_DESCRIPTIONS[user.role].toLowerCase()}`,
        `Added ${user.createdAt.slice(0, 10)}`,
      ],
    }));
  },

  async values(id) {
    await requireAdmin();

    const user = await users.get(id);
    if (!user) return null;

    return {
      username: user.username,
      name: user.name ?? "",
      role: user.role,
      // Never the hash, and never a placeholder that could be submitted back.
      password: "",
    };
  },

  async save(values: FieldValues, previousId?: string) {
    const session = await requireAdmin();

    const existing = previousId ? await users.get(previousId) : null;
    if (previousId && !existing) throw new SaveRejected("That account no longer exists.");

    const username = str(values, "username").toLowerCase();
    const role = str(values, "role");
    const password = str(values, "password");

    if (!isUserRole(role)) throw new SaveRejected("Choose a valid role.");

    // A username is how someone signs in, so it has to be unique.
    const clash = await users.findByUsername(username);
    if (clash && clash.id !== existing?.id) {
      throw new SaveRejected(`The username "${username}" is already taken.`);
    }

    // A new account needs a password; an edit may leave the box blank.
    if (!existing && !password) {
      throw new SaveRejected("Set a password for the new account.");
    }

    // Guards against an admin removing the last way back in. Checked here rather
    // than in the form because they depend on the whole account list and on who
    // is signed in — neither of which a field rule can see.
    if (existing?.role === "admin" && role !== "admin") {
      if (existing.id === session.userId) {
        throw new SaveRejected(
          "You cannot take the admin role away from your own account. Ask another admin to do it.",
        );
      }
      if ((await countByRole("admin")) <= 1) {
        throw new SaveRejected(
          "This is the only admin account. Make someone else an admin first.",
        );
      }
    }

    const user: AdminUser = {
      id: existing?.id ?? `user-${Date.now().toString(36)}`,
      username,
      ...(str(values, "name") ? { name: str(values, "name") } : {}),
      role,
      passwordHash: password
        ? await hashPassword(password)
        : // Only reachable on an edit, where `existing` is present.
          (existing as AdminUser).passwordHash,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    await users.save(user);
    return user.id;
  },

  async remove(id) {
    const session = await requireAdmin();

    if (id === session.userId) {
      throw new SaveRejected(
        "You cannot delete the account you are signed in with.",
      );
    }

    const user = await users.get(id);
    if (!user) return;

    if (user.role === "admin" && (await countByRole("admin")) <= 1) {
      throw new SaveRejected(
        "This is the only admin account. Make someone else an admin first.",
      );
    }

    await users.remove(id);
  },
};
