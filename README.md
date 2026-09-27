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
| `/` | Hero, studio film, firm stats, markets, featured projects, issues, latest news |
| `/markets`, `/markets/[slug]` | 14 markets; each with capabilities, stats, projects and related services |
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
  tools alike. A new entity needs a mapper, not a new component.
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
the poster alone until either exists. The home page film is content, not markup
— set it in `src/data/home.ts` or return it from `GET /api/pages/home`.

There is no real footage yet, so the home page plays
`public/video/studio-placeholder.webm`: a silent twelve-second loop that opens on
the poster's own frame — the same graphite gradient, with drafting linework and
soft massing panning across it at two speeds so it reads as a film rather than a
still. It stands in for one the way the gradients stand in for photography;
replace the one `url` in `src/data/home.ts` when the real cut exists.

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
and `prefers-reduced-motion` handling for the reveal animation.
