# sdrs-web

Front end for SDRS — Shawkat Design and Research Studio — built with Next.js 16
(App Router), React 19, TypeScript and Tailwind CSS v4.

Brand assets live in `public/`: `sdrs-logo.png` is the full badge (used for the
app icons and the Open Graph card), `sdrs-wordmark.png` is the logotype rendered
by `<Logo>` in the header.

It ships with a complete set of dummy content so every page renders immediately,
and a content layer designed to be repointed at a Spring Boot backend by
changing one environment variable.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — the defaults work as-is
npm run dev                  # http://localhost:3000
```

```bash
npm run build     # production build (prerenders every page)
npm run start     # serve the production build
npm run lint      # ESLint
npx tsc --noEmit  # typecheck
```

## Pages

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
src/
├── app/                  # routes only — each page composes sections, no logic
├── components/
│   ├── layout/           # SiteHeader, SiteFooter, Logo
│   ├── sections/         # page bands: PageHero, Section, CardGrid, FilterableGrid, …
│   └── ui/               # primitives: Button, Media, ContentCard, Field, Accordion, …
├── data/                 # dummy content — one file per entity group
├── lib/
│   ├── api/http.ts       # the single outbound fetch path
│   ├── config/           # env, site chrome, route builders
│   ├── content/          # the content layer (see below)
│   └── utils/            # cn, formatting, placeholders, validation
└── types/content.ts      # the domain model shared by UI and content layer
```

### Swapping in the Spring Boot backend

Everything the UI reads goes through one interface, `ContentRepository`
(`src/lib/content/repository.ts`). There are two implementations:

- `mock.repository.ts` — serves the bundled data in `src/data`
- `http.repository.ts` — calls the backend through `src/lib/api/http.ts`

`src/lib/content/index.ts` picks one:

```ts
export const content: ContentRepository = isUsingMockContent
  ? mockRepository
  : httpRepository;
```

So going live is:

1. Set `NEXT_PUBLIC_CONTENT_SOURCE=api`.
2. Set `BACKEND_ORIGIN` (the `/api/*` rewrite in `next.config.ts` proxies to it,
   which avoids configuring CORS in development) or point
   `NEXT_PUBLIC_API_BASE_URL` straight at the API.
3. Make the API return the shapes in `src/types/content.ts`.

No file under `src/app` or `src/components` changes. The endpoints the HTTP
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
```

### How the code is kept reusable

- **One card, one grid.** Every entity is mapped to a single `CardItem` shape by
  `src/lib/content/mappers.ts`, so `ContentCard`, `CardGrid` and
  `FilterableGrid` render markets, services, projects, news, issues and digital
  tools alike. A new entity needs a mapper, not a new component. The market
  films arrived this way: one optional field on `CardItem`, set by one mapper.
- **Filters are derived from content.** `src/lib/content/filters.ts` builds
  filter options from the data, so adding a market or category never requires a
  UI change.
- **Pages declare content, not layout.** Vertical rhythm and background tone
  live in `Section`; heroes live in `PageHero`. Pages contain no padding classes.
- **One place per concern.** Routes are built in `config/routes.ts`, navigation
  in `config/site.ts`, environment access in `config/env.ts`, outbound HTTP in
  `api/http.ts`.
- **Design tokens in one file.** Colours, fonts, radii and easings are declared
  in the `@theme` block of `src/app/globals.css` — a rebrand is one file. The
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
(`src/components/ui/Video.tsx`) picks the treatment from whichever field is set:
`url` for a self-hosted file (our own controls, muted autoplay, paused for
anyone who asks for reduced motion), `embedUrl` for a YouTube/Vimeo player, and
the poster alone until either exists. Films are content, not markup: the home
page's is set in `src/data/home.ts`, each market's in the `film` field on
`src/data/markets.ts`, and both arrive as `Film` from the repository. A market
without a `film` simply skips the band.

There is no real footage yet. The home page plays
`public/video/studio-placeholder.webm` — a silent twelve-second loop that opens
on the poster's own frame, the same graphite gradient with drafting linework and
soft massing panning across it at two speeds so it reads as a film rather than a
still. Each market plays a ten-second loop of its own from
`public/video/markets/`, drawing that market's subject: a transport corridor in
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
Play state is a context — `FilmPlaybackProvider` in `ui/FilmPlayback.tsx` — so
one `FilmPlaybackToggle` governs a whole page without `CardGrid` or
`FilterableGrid` needing to know a card might be moving. `/markets` hosts it in
`FilterableGrid`'s `toolbarAction` slot, opposite the search box.

Those films are generated, not shot — `scripts/generate-market-films.py` draws
the frames with PIL and encodes VP9/WebM through GStreamer. Run it with no
arguments to rebuild all fourteen, or pass slugs to redo a subset. They stand in
for film the way the gradients stand in for photography: drop a real cut in over
the same filename, or swap `url` for an `embedUrl` if it lives on a platform.

### Forms

The contact form posts to a server action (`src/lib/content/enquiry.action.ts`)
which validates on the server using the rules in `src/lib/content/enquiry.ts`,
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
