<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# sdrs conventions

This is an npm-workspace monorepo with two Next apps and one shared package,
plus a Gradle-managed Spring Boot backend that is *not* a workspace. See
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
- **`backend/`** (`sdrs-api`) — the Spring Boot API, port 3004. Java 25, Gradle,
  Postgres, Redis. Outside the npm workspace, so nothing here is reachable from
  either app's imports; the only coupling is the HTTP contract. Read
  `backend/README.md` before changing it — Spring Boot 4 is a real break from
  3.x (`spring-boot-starter-webmvc` not `-web`, Jackson 3 under `tools.jackson`,
  `@MockitoBean` not `@MockBean`), so training-data habits will mislead you the
  same way they do for Next.

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

## backend

- **One package per layer, not per feature.** `com.banyan.lab.sdrs.controller`,
  `.service`, `.repository`, `.entity`, `.dto`, `.mapper`, `.exception`,
  `.config`. A new collection adds one class to each, following the news classes
  already there — not a new subtree. `@Embeddable` types and the enums an entity
  persists live in `.entity` beside it; the wire types keep a `Dto` suffix so
  `Author` and `AuthorDto` can both be named in a mapper.
- **If the CMS cannot edit it, it does not get a table.** The database holds the
  five collections registered in `manage-web/src/lib/admin/collections.ts` —
  markets, services, projects, news, vacancies — plus the enquiry inbox. Page
  copy, the office directory, people, research programmes, courses and digital
  tools are code-edited in `packages/shared/data` and served from there by
  *both* repository implementations. Adding a table means adding a collection
  descriptor in the same change, or it is dead weight nothing can write to.
- **There is no `/api/pages/*`.** `http.repository.ts` answers those from
  `../data`, which is why it imports them. Careers is the one hybrid: prose from
  the bundled data, vacancies from `GET /api/jobs`.
- **An enum whose TypeScript counterpart is a string union implements
  `Labelled`.** The constant goes in the column, the label goes on the wire
  (`PRESS_RELEASE` vs `"Press release"`). Do not add a bare enum for one of
  those unions.
- **The DTO shape is dictated by `packages/shared/types/content.ts`**, not
  chosen here. A controller test asserting the JSON field by field is the only
  thing that catches a drift, because nothing else fails — the site just renders
  wrongly.
- **Liquibase owns the schema.** `ddl-auto: validate`. A schema change is a new
  changeSet under `db/changelog/changes/`, added to the master changelog — never
  an edit to an applied changeSet (Liquibase checksums those and will refuse to
  start), and never a `ddl-auto` bump. Use Liquibase's logical column types, not
  Postgres's, and reach for `<sql>` only where a change type does not exist or
  is Pro-only (check constraints are).
- **Authorisation lives in `config/SecurityConfig` only.** Reads are public
  because core-web has no credential to present; writes need the admin. A
  controller that decides its own access rules is how one endpoint ends up
  forgetting to.
- **`process.env`'s counterpart is `application.properties`.** One file, one
  profile, flat keys, every value from an environment variable with a local
  default. Add new ones there *and* to `backend/.env.example`.

## Verifying

From the repo root, `npm run typecheck`, `npm run lint` and `npm run build` cover
both apps. Expect zero warnings. core-web's build output must keep prerendering
every public route at its existing path.

For the backend, `./gradlew build` from `backend/` compiles and runs the tests;
they are unit tests and need no database. `docker compose up -d` first only if
you want to run the service itself. `gradlew` is not committed — if it is
missing, generate it as `backend/README.md` describes rather than falling back
to a system `gradle`, which is too old here to configure the build.
