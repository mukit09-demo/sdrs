import "server-only";

import { apiRequest, apiRequestOrNull } from "@sdrs/shared/api/http";
import { isUsingMockContent } from "@sdrs/shared/config/content-env";
import type { AdminUser, UserRole } from "@/types/user";
import { readUsers, writeUsers } from "./store";

/**
 * The account store, behind one interface — the same arrangement the content
 * layer uses, for the same reason: when Spring Boot owns accounts, this becomes
 * a configuration change rather than a refactor.
 *
 * `AdminUser` carries the password hash, so everything here is `server-only` and
 * callers above `lib/users` are expected to map to `SafeUser` before passing an
 * account anywhere near a component.
 */
export interface UserRepository {
  list(): Promise<AdminUser[]>;
  get(id: string): Promise<AdminUser | null>;
  /** Used by sign-in. Case-insensitive, because usernames are not secrets. */
  findByUsername(username: string): Promise<AdminUser | null>;
  save(user: AdminUser): Promise<void>;
  remove(id: string): Promise<void>;
}

const fileRepository: UserRepository = {
  async list() {
    return [...(await readUsers())].sort((a, b) =>
      a.username.localeCompare(b.username),
    );
  },

  async get(id) {
    return (await readUsers()).find((user) => user.id === id) ?? null;
  },

  async findByUsername(username) {
    const wanted = username.trim().toLowerCase();
    return (
      (await readUsers()).find((user) => user.username.toLowerCase() === wanted) ??
      null
    );
  },

  save(user) {
    return writeUsers((users) => {
      const index = users.findIndex((existing) => existing.id === user.id);
      if (index === -1) users.push(user);
      else users[index] = user;
    });
  },

  remove(id) {
    return writeUsers((users) => {
      const index = users.findIndex((user) => user.id === id);
      if (index !== -1) users.splice(index, 1);
    });
  },
};

/**
 * Spring Boot. Endpoints assumed:
 *
 *   GET    /api/users                   → AdminUser[]
 *   GET    /api/users/{id}              → AdminUser
 *   GET    /api/users?username={name}   → AdminUser[]
 *   PUT    /api/users/{id}              → the account (upsert)
 *   DELETE /api/users/{id}
 *
 * Note that a real backend would not return password hashes over HTTP at all —
 * it would own verification behind `POST /api/auth/login`. When that exists,
 * `authenticate()` in `lib/auth/credentials.ts` should call it and this
 * implementation should drop `findByUsername` and the hash from its DTO.
 */
const httpRepository: UserRepository = {
  list() {
    return apiRequest<AdminUser[]>("/users", { revalidate: 0 });
  },

  get(id) {
    return apiRequestOrNull<AdminUser>(`/users/${encodeURIComponent(id)}`, {
      revalidate: 0,
    });
  },

  async findByUsername(username) {
    const matches = await apiRequest<AdminUser[]>("/users", {
      query: { username },
      revalidate: 0,
    });
    return matches[0] ?? null;
  },

  async save(user) {
    await apiRequest<void>(`/users/${encodeURIComponent(user.id)}`, {
      method: "PUT",
      body: user,
      revalidate: 0,
    });
  },

  async remove(id) {
    await apiRequest<void>(`/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
      revalidate: 0,
    });
  },
};

/**
 * Follows the same switch as content. One source of truth for "is there a
 * backend yet" is less to get wrong than a second variable that could disagree.
 */
export const users: UserRepository = isUsingMockContent
  ? fileRepository
  : httpRepository;

/** How many accounts hold a given role. Used to refuse removing the last admin. */
export async function countByRole(role: UserRole): Promise<number> {
  return (await users.list()).filter((user) => user.role === role).length;
}
