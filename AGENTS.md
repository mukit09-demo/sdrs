<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# sdrs conventions

This is an npm-workspace monorepo with two Next apps and one shared package. See
`README.md` for the architecture. When changing this codebase:

## Which workspace

- **`core-web/`** — the public site, port 3002. Reads content. Contains **no**
  auth, no session, no admin route, and nothing that hints a CMS exists. If you
  are adding a session check or a "sign in" link here, you are in the wrong app.
- **`manage-web/`** — the CMS, port 3003. Signed-in only, its own administration
  UI, never linked from the public site.
- **`packages/shared/`** (`@sdrs/shared`) — the domain model and content layer,
  because both apps map the same Spring Boot DTOs. Source only: Turbopack
  compiles workspace packages, so there is no build step. **Nothing UI goes in
  here** — the two apps look nothing alike and should not share components.

## Everywhere

- **The UI never fetches directly.** All content comes through the repository in
  `@sdrs/shared/content`. Add a method to the interface and to *both*
  `mock.repository.ts` and `http.repository.ts` — never call `fetch` or import
  `@sdrs/shared/data/*` from a component or page.
- **The contract is split by direction.** `ContentRepository` is reads;
  `ContentAdminRepository` adds the writes. core-web imports `content` (reads
  only, re-exported from `core-web/src/lib/content`); manage-web imports
  `adminContent`. Keep it that way — the public app should have no write method
  to call.
- **`process.env` is read only in a `config/env.ts`.** Content variables live in
  `packages/shared/config/content-env.ts`; app-specific ones in that app's
  `src/lib/config/env.ts`. Add new variables there *and* to the app's
  `.env.example`.
- **Routes come from that app's `src/lib/config/routes.ts`.** Never hard-code a
  path in a component. core-web's navigation comes from `config/site.ts`;
  manage-web has no nav list, because its nav *is* the collection registry.
- **Design tokens live in the `@theme` block of each app's
  `src/app/globals.css`** — Tailwind v4, so there is no `tailwind.config.js`.
  core-web uses `ink-*`, `brand-*` and `font-display`; manage-web uses `ink-*`,
  `accent-*` and `danger-*` and has no display face. They are separate scales on
  purpose; do not copy a class between apps without checking it exists.
- **Keep the dependency list short.** Prefer a small local helper over a new npm
  package — `cn()`, the form validator and the session signing are all local for
  this reason.

## core-web

- **New entity to display? Write a mapper, not a card.** Map it to `CardItem` in
  `src/lib/content/mappers.ts` and render it with `CardGrid` / `FilterableGrid`.
- **Pages compose sections.** Files under `src/app` bind params, load content and
  arrange `<Section>` bands. No spacing utilities, no business logic, no `fetch`.
- **Components live in one of three folders**: `ui/` primitives (no domain
  knowledge), `sections/` page bands (take domain types), `layout/` chrome.

## manage-web

- **New collection to manage? Write a descriptor, not a page.** Add one entry to
  `src/lib/admin/collections.ts` — it declares the fields, how to list, load and
  save — and the existing generic list and form pages serve it. Do not add routes
  per entity.
- **Field kinds live in `src/lib/admin/fields.ts`.** A `FieldSpec` drives the
  control, the validation *and* the parse back into the domain type. Reach for a
  new kind there rather than a bespoke form.
- **Every page, layout and server action calls a guard from `lib/auth/dal.ts`.**
  `requireUser()` for content, `requireAdmin()` for accounts. The proxy is not
  sufficient on its own: it does not cover server actions, and a layout cannot
  stop its children rendering. A collection with `adminOnly: true` is guarded in
  three places — the page, the action, and the descriptor's own methods — because
  hiding a nav link is not access control.
- **Two roles, one difference.** `admin` and `editor` both have full create, edit
  and delete on every content collection; only `admin` can manage accounts. If
  you are adding a third capability split, add a role rather than special-casing.
- **Accounts never go in `@sdrs/shared`.** `AdminUser` carries a password hash and
  lives only in `manage-web/src/lib/users`; above that layer pass `SafeUser`,
  which has no hash. core-web must not be able to import any of it.
- **Refusals the operator should read throw `SaveRejected`.** `admin.action.ts`
  surfaces that message verbatim and reports anything else generically. Use it for
  "username taken" or "last admin account", not for bugs.

## Verifying

From the repo root, `npm run typecheck`, `npm run lint` and `npm run build` cover
both apps. Expect zero warnings. core-web's build output must keep prerendering
every public route at its existing path.
