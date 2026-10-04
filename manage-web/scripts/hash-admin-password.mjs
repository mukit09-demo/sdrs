#!/usr/bin/env node
/**
 * Prints an ADMIN_PASSWORD_HASH for .env.local.
 *
 *   node scripts/hash-admin-password.mjs 'the password'
 *
 * Format is `scrypt:<saltHex>:<keyHex>` — verified by
 * `src/lib/auth/credentials.ts`. Plain Node, no dependencies, matching the
 * project's rule about keeping the dependency list short.
 */
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-admin-password.mjs '<password>'");
  process.exit(1);
}

if (password.length < 10) {
  console.error("Choose a password of at least 10 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const key = scryptSync(password.normalize("NFKC"), salt, 64);

console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("hex")}:${key.toString("hex")}`);
