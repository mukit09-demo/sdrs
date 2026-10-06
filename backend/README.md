# sdrs-api

The Spring Boot backend for [SDRS](../README.md) — the service `core-web` and
`manage-web` read content from when `NEXT_PUBLIC_CONTENT_SOURCE=api`.

Java 25, Spring Boot 4.1, Postgres, Redis, Gradle. One module, one profile, one
`application.properties`.

**This database holds only what the CMS manages**: markets, services, projects,
news and vacancies — the five collections registered in
`manage-web/src/lib/admin/collections.ts` — plus the enquiry inbox the public
contact form writes to. 6 entities, 17 tables.

Everything else the site renders is editorial prose with no CMS screen: the
home film, the About / Careers / Research / Contact page copy, the office
directory, leadership and colleague profiles, research programmes, training
courses and the digital tools list. Those stay in `packages/shared/data` and are
served from there by **both** repository implementations, so there is no
`/api/pages/*` endpoint and no table behind one. Editing them is a code change
and a deploy — which is what it already was.

The one hybrid is careers: `getCareersContent()` reads the prose from
`packages/shared/data/careers.ts` and splices in the vacancies from
`GET /api/jobs`.

**Only news is wired up over HTTP so far.** The other four collections have
tables and entities but still need a DTO, mapper, repository, service and
controller each — see [Adding a collection](#adding-a-collection) — and their
tables are empty, because only `news.ts` has been turned into a seed changeSet.

## Running it

```bash
docker compose up -d                 # postgres 15432, redis 16379

export SDRS_ADMIN_PASSWORD='something-you-choose'
./gradlew bootRun                    # http://localhost:3004
```

There is no default admin password, and the application will not start without
one — writes would otherwise be open to anyone who can reach the port. Every
other variable has a working local default; see `.env.example` for the full set.

```bash
./gradlew build                      # compile + tests
./gradlew test                       # tests only — no database needed
```

The tests are unit tests. None of them need Postgres, Redis or a running server,
so `./gradlew test` passes on a clean checkout.

## What it serves

| | | |
|---|---|---|
| `GET` | `/api/articles?tag=&limit=&exclude=` | Newest first. Public |
| `GET` | `/api/articles/{slug}` | `404` when absent. Public |
| `POST` | `/api/articles` | `201`, or `409` if the slug is taken. Admin |
| `PUT` | `/api/articles/{slug}` | `204`. Admin |
| `DELETE` | `/api/articles/{slug}` | `204`. Admin |
| `GET` | `/actuator/health` | Public |

The service listens on **3004** (core-web is 3002, manage-web 3003), Postgres on
**15432** and Redis on **16379** — all deliberately off their defaults, because
8080, 5432 and 6379 are the three ports most likely to be taken already by
something else on a developer machine.

The parameter names (`tag`, `limit`, `exclude`) and the response shape are not
ours to choose — they are what
`packages/shared/content/http.repository.ts` already calls and what
`packages/shared/types/content.ts` types. `NewsControllerTest` is the check on
that: it asserts the JSON field by field, because a drift there does not fail
anything, it just makes the site render wrongly.

Try it:

```bash
curl -s localhost:3004/api/articles | jq '.[0]'
curl -s localhost:3004/api/articles/kai-tak-sports-park-opens | jq .
curl -s -u admin:$SDRS_ADMIN_PASSWORD -X DELETE \
     localhost:3004/api/articles/kai-tak-sports-park-opens -o /dev/null -w '%{http_code}\n'
```

## Pointing the front end at it

In **both** `core-web/.env.local` and `manage-web/.env.local`:

```
NEXT_PUBLIC_CONTENT_SOURCE=api
BACKEND_ORIGIN=http://localhost:3004
```

`BACKEND_ORIGIN` drives the `/api/*` rewrite in each app's `next.config.ts`, so
the browser calls the Next origin and there is no CORS to configure. Set it in
both or the two apps disagree about where content lives.

Only news exists here, so under `api` the other collections will 404 until they
are added. Set it back to `mock` for ordinary front-end work.

## How it is put together

One package per layer, not per feature — every controller in `controller/`,
every entity in `entity/`, and so on. So a second collection adds one class to
each of these rather than a new subtree:

```
com.banyan.lab.sdrs
├── SdrsApiApplication
├── controller/    NewsController
├── service/       NewsService
├── repository/    NewsRepository
├── entity/        6 @Entity, 5 @Embeddable, 4 enums
├── dto/           ArticleRequest, ArticleResponse, AuthorDto, MediaImageDto
├── mapper/        NewsMapper
├── exception/     ResourceNotFoundException, DuplicateResourceException,
│                  ApiError, ApiExceptionHandler
└── config/        SecurityConfig, CacheConfig, AdminProperties, CacheNames
```

`entity/` holds three kinds of thing, all together because all three are
persistence concerns:

| | |
|---|---|
| **Entities** | `Market` `Service` `Project` `NewsArticle` `Job` `Enquiry` |
| **Embeddables** | `MediaImage` `Author` `Stat` `ProjectLocation` `Film` |
| **Enums** | `NewsType` `ServiceCategory` `EmploymentType` `CareerLevel` `JobStatus` — each implements `Labelled`, storing the constant and serving the label |

The wire types keep the `Dto` suffix — `AuthorDto` against `Author` — because
the mapper names both and one of them would otherwise need qualifying.

### Decisions in the schema worth knowing

- **Cross-collection references carry no foreign key.**
  `market_featured_project`, `service_related_market`, `project_market` and
  `project_service` are plain slug columns. The read path already drops
  references it cannot resolve, and an FK would stop the CMS saving a market
  that names a project not yet created — an ordering the editorial workflow does
  not have. The cost: a dangling slug is ignored, not rejected.
- **If it has no CMS screen, it has no table.** That is the rule that decided
  this schema's shape, and it is why there is no `about_page` or `office` table:
  nothing could ever write to them. Adding a table means adding a collection
  descriptor in `manage-web` in the same change, or it is dead weight.
- **`Film` is flat, not nested.** `MediaImage` fixes its columns as
  `image_url` / `image_alt` / `image_seed`, so a table with both an image and a
  film poster would collide on all three — fixable only with a block of
  `@AttributeOverride`s per entity, repeated and silently wrong if one is
  missed. `Film` therefore declares `film_poster_*` itself and the mapper
  rebuilds the nested shape for the wire.
- **The table is `job`, not `job_opening`.** It holds every job — drafts and
  withdrawn roles included. An "opening" is the subset advertised right now,
  which is a query, not a table:

  ```sql
  status = 'OPEN' and (deadline is null or deadline >= current_date)
  ```

  It is a table at all because vacancies are the one part of the careers page
  the CMS manages; the prose around them is not.
- **Nothing flips `OPEN` to `CLOSED` when a deadline passes.** That would need a
  scheduled sweep, and between the deadline and the sweep the database would be
  advertising a role nobody can apply for. Deriving visibility is never stale and
  needs no scheduler, so `CLOSED` means "we took it down", not "the date
  passed". A null deadline is "open until filled" — a real case, not missing
  data, so it never closes.
- **The same predicate exists three times** — here in SQL,
  `Job.isPubliclyVisibleOn` in Java, and `isOpening` in
  `packages/shared/content/jobs.ts` — because each layer filters where it is
  cheapest. Change one, change all three.
- **Ordered lists are element-collection tables with `position` in the primary
  key**, never a delimited string and never JSON. Body paragraphs, capabilities,
  address lines and stats all read in sequence.

Tests mirror the layer they exercise (`controller/`, `service/`, `mapper/`),
with the shared fixture in `support/NewsTestData`.

A few choices worth knowing before changing something:

- **Liquibase owns the schema.** `ddl-auto: validate`, so Hibernate's only job
  is to refuse to start when the entities and the changelog have drifted. A
  schema change is a new changeSet, never an edit to an applied one — Liquibase
  checksums what it has run and fails rather than silently diverging. The master
  changelog holds includes only, so two branches adding migrations conflict on
  their own files instead of on it.
- **`Stat.value` is stored as `stat_value`**, because `VALUE` is a reserved word
  in standard SQL. It is a string, not a number — the content says "1,200+" and
  "Top 3".
- **The news seed is tagged `contextFilter:seed`.** `spring.liquibase.contexts`
  defaults to `seed` so a fresh clone gets the nine dummy articles; set
  `SDRS_LIQUIBASE_CONTEXTS=!seed` to apply the schema without them.
- **The slug is the primary key.** It is the route segment and the id the CMS
  addresses articles by, so there is no surrogate id to keep in step. A rename
  is a delete plus an insert, which is how the CMS already treats it.
- **Ordered element collections, not a JSON column.** `body` is paragraphs in
  sequence; `@OrderColumn` with `position` in the primary key makes that a
  property of the data rather than of however the rows come back.
- **The enum is `NewsType`, the wire name is `category`.** `PRESS_RELEASE` in
  the column, `"Press release"` over HTTP via `@JsonValue` — because the front
  end types it as `ArticleCategory` and renders it directly. The five values are
  the CATEGORY chips on `/news`.
- **Reads are public, writes need the admin.** `SecurityConfig` is the only
  place that decides this; no controller carries its own access rules.
- **Redis caches the reads**, evicted wholesale on any write. `@Cacheable` keys
  on the tag/exclude/limit triple.
- **Jackson 3, not 2.** Spring Boot 4 moved to `tools.jackson`. Anything naming
  `com.fasterxml.jackson` is wrong *except* `jackson-annotations`, which
  deliberately kept its package — which is why `@JsonValue` and `@JsonFormat`
  import the way they do.

## Adding a collection

Markets, services, projects and vacancies are each one class per layer plus a
migration — follow the news classes in each package:

1. `db/changelog/changes/{nnn}-{collection}-schema.xml`, plus an `<include>`
   in `db.changelog-master.xml`.
2. `entity/` — the entity, reusing `MediaImage` and `Author` where they fit.
   `Stat` will need adding for markets and projects.
3. `dto/` — request and response records matching the TypeScript interface
   exactly, and a controller test that asserts it does.
4. `mapper/` — MapStruct. `unmappedTargetPolicy=ERROR` is on, so a field present
   on one side and not the other fails the build rather than arriving null.
5. `repository/`, `service/`, `controller/` — one each.

Do not add authorisation to the controller; add the path to `SecurityConfig`.

Do not add a table for something the CMS cannot edit — see the first schema
decision above.

Still to do beyond the four remaining collections: `POST /api/enquiries` (the
table exists, the endpoint does not), seed changeSets for markets, services,
projects and vacancies, and moving CMS accounts off
`manage-web/.data/users.json` behind a `POST /api/auth/login` — see the root
README's admin section for why that one is not just a port of the existing code.
