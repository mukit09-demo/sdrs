# sdrs

Front end for SDRS — Shawkat Design and Research Studio — built with Next.js 16
(App Router), React 19, TypeScript and Tailwind CSS v4.

Two services in one npm workspace:

| | | |
|---|---|---|
| **`core-web/`** | port 3002 | The public site. Reads content. No auth, no admin route, nothing that hints a CMS exists. |
| **`manage-web/`** | port 3003 | The CMS. Signed-in only, its own administration UI, never linked from the public site. |
| **`packages/shared/`** | — | `@sdrs/shared`: the domain model and content layer both apps need. |

They are separate apps so that public code and admin code never mix, and so the
CMS can be deployed where the public internet cannot reach it — a VPN, an IP
allowlist, an internal host. That is worth more than any in-app check.

Brand assets live in `core-web/public/`: `sdrs-logo.png` is the full badge (used
for the app icons and the Open Graph card), `sdrs-wordmark.png` is the logotype
rendered by `<Logo>` in the header.

Both apps ship with a complete set of dummy content so every page renders
immediately, and a content layer designed to be repointed at a Spring Boot
backend by changing one environment variable.

## Getting started

```bash
npm install                  # once, at the root — it installs both apps

npm run dev                  # both: 3002 and 3003
npm run dev:core             # just the public site
npm run dev:manage           # just the CMS
```

Each app reads its own `.env.local`; copy from the `.env.example` beside it. The
public site works with no configuration at all. The CMS needs three variables
before you can sign in — see [Admin](#admin).

```bash
npm run build       # both apps
npm run lint        # both apps
npm run typecheck   # both apps
```

Per app, `cd core-web && npm run build`, and `npm start` to serve it.

## Why the split, and what it costs

The honest trade-off, because it is not free:

- **Edits in the CMS do not reach a production `core-web` build until it
  restarts.** `revalidatePath` only clears the cache of the process that calls
  it, and two apps are two processes. In development both apps read the shared
  JSON store and the public site picks up an edit on the next request; in
  production its pages are prerendered. The real fix is the Spring Boot backend
  as the shared store, at which point this becomes a revalidation webhook.
- **The domain model has to be shared, or it drifts.** Hence
  `packages/shared` — see [The shared package](#the-shared-package).

## Pages — core-web

| Route | Contents |
|-------|----------|
| `/` | Hero, studio film, firm stats, six markets as looping films, featured projects, issues, latest news |
| `/markets`, `/markets/[slug]` | 14 markets, the index card for each one playing its film; detail pages add capabilities, stats, projects and related services |
| `/services`, `/services/[slug]` | 12 services plus in-house digital tools; each with deliverables and projects |
| `/projects`, `/projects/[slug]` | 20 projects, filterable by market; detail pages with client, stats and highlights |
| `/about-us` | Intro, stats, founder quote, values, history timeline, leadership, commitments |
| `/careers` | Intro, stats, benefits, filterable vacancies, hiring process, colleague profiles |
| `/research-and-training` | Intro, stats, filterable research programmes, how research is funded, filterable courses, publications, partners |
| `/news`, `/news/[slug]` | Lead story, filterable index, issues; article pages with related reading |
| `/contact-us` | Enquiry form (server action + validation), FAQs, office directory by region |
| `not-found` | 404 with links into every section |

## Architecture

```
sdrs/
├── package.json              # the workspace root
├── packages/shared/          # @sdrs/shared — source only, no build step
│   ├── types/content.ts      # the domain model
│   ├── content/              # repository contract + both implementations + the JSON store
│   ├── api/http.ts           # the single outbound fetch path
│   ├── config/content-env.ts # content source, API base, store path
│   ├── data/                 # dummy content — one file per entity group
│   └── utils/                # validation, date formatting, array helpers
├── core-web/src/
│   ├── app/                  # routes only — each page composes sections, no logic
│   ├── components/
│   │   ├── layout/           # SiteHeader, SiteFooter, Logo
│   │   ├── sections/         # page bands: PageHero, Section, CardGrid, FilterableGrid, …
│   │   └── ui/               # primitives: Button, Media, ContentCard, Field, Accordion, …
│   └── lib/
│       ├── config/           # site chrome, route builders
│       ├── content/          # mappers, filters, the enquiry form, the repository re-export
│       └── utils/            # cn, placeholders, reduced motion
└── manage-web/src/
    ├── app/                  # /login, then the workspace: dashboard, lists, forms
    ├── components/
    │   ├── admin/            # the generic form, table and shell
    │   └── ui/               # its own Button and Field — admin-styled, not the site's
    ├── lib/
    │   ├── admin/            # the collection registry and its field specs
    │   ├── auth/             # credentials, session cookie, the admin DAL
    │   └── config/           # env, app chrome, route builders
    └── proxy.ts              # requires a session for every page but /login
```

Turbopack compiles workspace packages automatically, so `@sdrs/shared` ships as
TypeScript source with no build step between the apps and it.

### The shared package

`packages/shared` holds what both apps genuinely need and nothing else. Measured
by how long each part lives:

| | Lines | Lifespan |
|---|---|---|
| `types/content.ts` + `content/repository.ts` | 490 | permanent — the domain contract |
| `api/http.ts` + `content/http.repository.ts` | 359 | permanent — the Spring Boot client |
| `utils/` | 144 | permanent — small helpers |
| `content/mock.repository.ts`, `content/store.ts`, `data/` | 2,721 | temporary — goes when the backend lands |

So long-term it is about a thousand lines, and almost all of it is the domain
model. That is the part worth sharing: both apps will map the same Spring Boot
DTOs, and two copies of `types/content.ts` would drift silently — the CMS saves a
renamed field, the site renders `undefined`, and nothing fails at compile time.

**No UI is shared.** The two apps look nothing alike on purpose: the site is
editorial, the CMS is a tool. They have separate `@theme` token scales and
separate `Button` and `Field` primitives. What *is* copied deliberately is the
field shell's label / hint / error structure and its `aria-describedby` chain —
that wiring is why a validation message is announced against the control that
produced it, and it should not differ between the two.

### Reads and writes are separate contracts

`ContentRepository` is the read surface; `ContentAdminRepository` extends it with
the writes. `core-web` imports `content`, typed as the former, so it has no
`saveProject` to call even by accident. `manage-web` imports `adminContent`.

### Swapping in the Spring Boot backend

Everything either app reads goes through the contract in
`packages/shared/content/repository.ts`. There are two implementations:

- `mock.repository.ts` — serves the JSON store, seeded from `packages/shared/data`
- `http.repository.ts` — calls the backend through `packages/shared/api/http.ts`

`packages/shared/content/index.ts` picks one, for both apps:

```ts
const repository: ContentAdminRepository = isUsingMockContent
  ? mockRepository
  : httpRepository;

export const content: ContentRepository = repository;      // core-web
export const adminContent: ContentAdminRepository = repository; // manage-web
```

So going live is:

1. Set `NEXT_PUBLIC_CONTENT_SOURCE=api`.
2. Set `BACKEND_ORIGIN` (the `/api/*` rewrite in `next.config.ts` proxies to it,
   which avoids configuring CORS in development) or point
   `NEXT_PUBLIC_API_BASE_URL` straight at the API.
3. Make the API return the shapes in `packages/shared/types/content.ts`.

Set it in **both** apps, or they disagree about where content lives. No file
under either app's `app/` or `components/` changes. The endpoints the HTTP
implementation expects are documented at the top of `http.repository.ts`:

```
GET  /api/markets                GET  /api/markets/{slug}
GET  /api/services               GET  /api/services/{slug}
GET  /api/digital-tools
GET  /api/projects?market=&service=&slugs=&limit=
GET  /api/projects/{slug}
GET  /api/articles?tag=&limit=&exclude=
GET  /api/articles/{slug}        GET  /api/issues?limit=
GET  /api/pages/home|about|careers|research|contact
POST /api/enquiries

GET    /api/job-openings         GET    /api/job-openings/{id}
POST   /api/{collection}         PUT    /api/{collection}/{id}
DELETE /api/{collection}/{id}
```

The last three are the admin's writes, where `{collection}` is `markets`,
`services`, `projects`, `articles`, `issues` or `job-openings`.

### How the code is kept reusable

- **One card, one grid.** Every entity is mapped to a single `CardItem` shape by
  `core-web/src/lib/content/mappers.ts`, so `ContentCard`, `CardGrid` and
  `FilterableGrid` render markets, services, projects, news, issues and digital
  tools alike. A new entity needs a mapper, not a new component. The market
  films arrived this way: one optional field on `CardItem`, set by one mapper.
- **Filters are derived from content.** `core-web/src/lib/content/filters.ts` builds
  filter options from the data, so adding a market or category never requires a
  UI change.
- **Pages declare content, not layout.** Vertical rhythm and background tone
  live in `Section`; heroes live in `PageHero`. Pages contain no padding classes.
- **One place per concern.** Routes are built in `config/routes.ts`, navigation
  in `config/site.ts`, environment access in a `config/env.ts`, outbound HTTP in
  `packages/shared/api/http.ts`.
- **Design tokens in one file.** Colours, fonts, radii and easings are declared
  in the `@theme` block of each app's `src/app/globals.css` — a rebrand is one file. The
  width at which the header switches from its drawer to the inline navigation
  row is a token there too (`--breakpoint-navbar`), so adding a section is a
  config change plus, if the labels outgrow the row, one number.
- **No extra runtime dependencies.** `cn()` and the form validator are small and
  local rather than pulled from npm.

### Images

`MediaImage.url` is optional. While it is absent, `Media` renders a
deterministic gradient placeholder derived from a hash of the image's seed, so
image-led layouts look intentional without any photography. As soon as the
backend supplies URLs, `next/image` takes over — no component changes.

### Film

`MediaVideo` mirrors that contract for moving image, and `Video`
(`core-web/src/components/ui/Video.tsx`) picks the treatment from whichever field is set:
`url` for a self-hosted file (our own controls, muted autoplay, paused for
anyone who asks for reduced motion), `embedUrl` for a YouTube/Vimeo player, and
the poster alone until either exists. Films are content, not markup: the home
page's is set in `packages/shared/data/home.ts`, each market's in the `film` field on
`packages/shared/data/markets.ts`, and both arrive as `Film` from the repository. A market
without a `film` simply skips the band.

There is no real footage yet. The home page plays
`core-web/public/video/studio-placeholder.webm` — a silent twelve-second loop that opens
on the poster's own frame, the same graphite gradient with drafting linework and
soft massing panning across it at two speeds so it reads as a film rather than a
still. Each market plays a ten-second loop of its own from
`core-web/public/video/markets/`, drawing that market's subject: a transport corridor in
plan, rotors over a transmission line, ripples across a catchment, floor plates
stacking. Each one is built on the same gradient its poster seed resolves to, so
hero, poster and film are one continuous image.

Those films carry the market listings as well as the market pages. The home
page's markets band shows the first six — `MarketFilmStrip`, letterbox tiles
carrying the same name, tagline and link a market card did, with motion on top —
and `/markets` plays all fourteen inside its ordinary cards, because `CardItem`
has an optional `video` and `ContentCard` prefers it to the still. That is the
whole change: `marketToCard` sets the field, so the index keeps its search, its
filtering and its live result count rather than being swapped for a bespoke grid.

Both use `LoopingVideo` rather than `Video`: no per-tile controls, and playback
driven by an `IntersectionObserver` so only what is on screen decodes. With
`preload="none"`, tiles below the fold cost nothing until you scroll to them.
Play state is a context — `FilmPlaybackProvider` in `core-web/src/components/ui/FilmPlayback.tsx` — so
one `FilmPlaybackToggle` governs a whole page without `CardGrid` or
`FilterableGrid` needing to know a card might be moving. `/markets` hosts it in
`FilterableGrid`'s `toolbarAction` slot, opposite the search box.

Those films are generated, not shot — `core-web/scripts/generate-market-films.py` draws
the frames with PIL and encodes VP9/WebM through GStreamer. Run it with no
arguments to rebuild all fourteen, or pass slugs to redo a subset. They stand in
for film the way the gradients stand in for photography: drop a real cut in over
the same filename, or swap `url` for an `embedUrl` if it lives on a platform.

### Forms

The contact form posts to a server action (`core-web/src/lib/content/enquiry.action.ts`)
which validates on the server using the rules in `core-web/src/lib/content/enquiry.ts`,
then calls `ContentRepository.submitEnquiry`. Field errors and the submitted
values come back through `useActionState`, so a rejected submission keeps what
the visitor typed.

### Accessibility notes

Skip link, `aria-current` on active navigation and breadcrumbs, labelled
controls with an `aria-describedby` chain for hints and errors, `aria-expanded`
/ `aria-controls` on the accordion and mobile menu, `dl` markup for statistics,
`role="img"` on gradient placeholders, live regions on filtered result counts,
and `prefers-reduced-motion` handling for the reveal animation and for both film
treatments. The market films loop indefinitely, so every page showing a set of
them carries one `aria-pressed` control that stops all of them at once — the
preference decides where that control starts, but never overrules an explicit
press.

## Admin — manage-web

A separate app on its own port, and in deployment its own host (`admin.example.com`
via a hostname rewrite, or somewhere not publicly routable at all). The public
site has no route into it and no link to it — core-web contains no auth code, no
login page and no session handling whatsoever.

```bash
npm run dev:manage       # http://localhost:3003
```

### Setting it up

```bash
cd manage-web
node scripts/hash-admin-password.mjs 'the password you want'   # prints ADMIN_PASSWORD_HASH=…
openssl rand -base64 32                                        # SESSION_SECRET
```

Put those in `manage-web/.env.local` along with `ADMIN_USERNAME` — see
`manage-web/.env.example`. The password itself is never stored, only its scrypt
hash. That account is the bootstrap admin; every account after it is created in
the CMS at `/users`. Without these three the public site runs exactly as normal;
only signing in fails.

### What it manages

The six collections: **Markets**, **Services**, **Projects**, **News**,
**Issues** and **Vacancies**. Create, edit and delete for each.

Page copy that is not a list is still edited in code: the home film, About,
Research and training, Contact us, and the digital tools. Images are referenced by
URL rather than uploaded — leave the URL blank and the gradient placeholder
renders, exactly as it does for the bundled content.

### How it is built

One list page and one form page serve all six collections, driven by the registry
in `manage-web/src/lib/admin/collections.ts`. A descriptor there declares the
entity's fields, how to list it, how to load it into the form and how to save it;
the pages deal only in `AdminRow` and `FieldValues` and never see a `Market`. The
same bargain `mappers.ts` strikes for cards on the public site: **a new collection
is one descriptor, not four files.** The header's navigation is generated from the
same registry, so there is no nav list to keep in step.

`manage-web/src/lib/admin/fields.ts` holds the field kinds those descriptors are
written in — `text`, `textarea`, `number`, `select`, `lines` (a `string[]`, one per
line), `image`, `rows` (a repeatable `Stat[]`) and `group` (a nested object). Each
spec drives the control, the validation *and* the parse back into the domain type,
and validation reuses `@sdrs/shared/utils/validate` — the same validator behind
the public site's enquiry form.

### Its own UI

Not the public site's. `manage-web` has its own `@theme` block: Tailwind's default
type scale rather than core-web's enlarged editorial one, one font instead of two,
a cooler slate neutral ramp, and a blue accent so it is never mistaken for the
SDRS brand red. Its `Button` and `Field` share the public components' prop shapes
— which is what lets the form renderer be identical — but nothing else.

### Accounts and roles

Two roles, and exactly one difference between them:

| | Content | Accounts |
|---|---|---|
| **Admin** | create, edit, delete | create, edit, delete |
| **Editor** | create, edit, delete | — |

An editor has full run of every content collection, deletes included. Accounts
are the only thing they cannot touch: the nav hides the section, the pages
`notFound()`, and the save and delete actions reject them — so posting straight
at a server action gets an editor no further than clicking would.

Accounts are managed at `/users`, which is just another collection descriptor
(`manage-web/src/lib/admin/users.collection.ts`) with `adminOnly: true`, so the
same generic list and form pages serve them. Passwords are hashed with scrypt on
save; the edit form never pre-fills the field, and leaving it blank keeps the
existing password.

Three guards exist to stop an admin locking everyone out, and they live in the
descriptor rather than in field rules because they depend on the whole account
list and on who is signed in:

- You cannot delete the account you are signed in with.
- You cannot take the admin role off your own account.
- You cannot demote or delete the last remaining admin.

Those refusals are shown as written. `SaveRejected` is the error type that gets
surfaced verbatim; anything else is logged and reported as a generic failure,
because "this is the only admin account" is useless as "could not save".

**The bootstrap account.** `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` seed the
account store the first time it is read — otherwise a fresh install would have no
way to sign in and therefore no way to create the first account. Once accounts
exist those variables are ignored: changing them does not change a stored
account. Delete the store and the bootstrap account comes back.

Accounts live in `manage-web/.data/users.json`, written `0600`, inside this app
rather than at the repo root — core-web has no business being able to read a file
of password hashes. `AdminUser` carries the hash and never leaves
`manage-web/src/lib/users`; everything above that layer deals in `SafeUser`,
which has no hash on it. With `NEXT_PUBLIC_CONTENT_SOURCE=api` accounts move to
Spring Boot, at which point verification should move behind
`POST /api/auth/login` rather than fetching hashes over HTTP.

### Authentication

Scrypt-hashed passwords and an HMAC-signed session cookie, all on `node:crypto` —
no new dependencies, same reasoning as `cn()` and the form validator being local.
`manage-web/src/lib/auth/token.ts` signs and verifies the token; swap that one
file for `jose` if this ever needs refresh tokens or SSO.

The session carries the account id and the role, and the role is validated as
strictly as the signature when the cookie is read: an unrecognised role is a
rejection, never a default. A signature check alone would let a tampered role
through.

Two checks, deliberately:

- `manage-web/src/proxy.ts` verifies the cookie's signature and requires a session
  for every page but `/login`. Next's auth guide calls the proxy check optimistic
  because it runs on every request including prefetches, but that warning is about
  database round trips — an HMAC is microseconds, and Next 16 runs the proxy on the
  Node runtime. Checking only that the cookie *exists* has a concrete bug: a
  visitor whose session had expired would bounce between `/login` and the
  dashboard forever.
- `requireUser()` / `requireAdmin()` in `manage-web/src/lib/auth/dal.ts` are the
  checks that actually hold, and every page, layout and server action calls one.
  Server actions do not pass through the proxy at all, and a layout cannot stop
  its children rendering.

A wrong username and a wrong password give the same message and take the same
time, so neither says which half to keep.

### Where edits are stored

Writes go through the repository like everything else, so both implementations
have them:

- `mock.repository.ts` keeps them in a JSON file — `.data/content.json` at the
  repo root, gitignored, seeded from `packages/shared/data` the first time it is
  read. Both apps point `CONTENT_STORE_PATH` at that one file, so the CMS writes
  what the site reads. Delete it and both apps return to the bundled content.
- `http.repository.ts` POSTs, PUTs and DELETEs to Spring Boot.

So the CMS follows the same switch as the site: set
`NEXT_PUBLIC_CONTENT_SOURCE=api` in both apps and the writes go to the backend.

Three things to know about the file store:

- **It needs a writable disk.** Fine under `npm run dev` and `npm run start` on a
  normal Node host; not fine on a read-only serverless filesystem — which is the
  case the `api` content source exists for.
- **The two apps are two processes.** The store is cached on the file's mtime
  rather than for the life of the process, so in development core-web picks up a
  CMS edit on the next request. In a production build its pages are prerendered,
  so it needs a restart — `revalidatePath` cannot reach another process. When
  Spring Boot is the shared store this becomes a revalidation webhook.
- **Production smoke tests cannot sign in over plain http.** The session cookie is
  marked `Secure` when `NODE_ENV=production`, so it is not sent back to
  `http://localhost:3003` and signing in appears to do nothing. That is the flag
  working — use `npm run dev`, or serve the build over https.
