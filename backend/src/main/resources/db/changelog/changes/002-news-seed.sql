--liquibase formatted sql

--  The nine articles from packages/shared/data/news.ts, so a fresh database
--  serves the same newsroom the mock repository does and the site renders
--  identically either side of NEXT_PUBLIC_CONTENT_SOURCE.
--
--  Generated from that file rather than typed out, so the two cannot disagree.
--  Regenerating it changes the checksum of an applied changeSet, which Liquibase
--  treats as an error — add a new changeSet instead, or drop the database.
--
--  Child rows resolve the parent by slug rather than hardcoding an id, so the
--  surrogate keys stay the sequence's to assign and nothing has to keep a
--  literal id in step with it.
--
--  This is seed data, not reference data. The `seed` context means a deployment
--  with real content can skip it with
--  spring.liquibase.contexts=!seed (or simply never run it).

--changeset mukit09:002-01-seed-news-articles contextFilter:seed
--comment: Nine articles, their body paragraphs and their tags

insert into news_article (
    id, slug, title, excerpt, news_type, published_at, reading_minutes,
    image_url
) values (
    nextval('news_article_id_seq'),
    'kai-tak-sports-park-opens',
    'Kai Tak Sports Park opens to the public in Hong Kong',
    'The 50,000-seat stadium at the heart of the Kai Tak development has hosted its first full-capacity event, completing a decade of design and delivery work.',
    'PRESS_RELEASE',
    date '2026-08-28',
    4,
    NULL
);
insert into news_article_body (article_id, position, paragraph)
    select a.id, 0, 'Kai Tak Sports Park has opened on the site of Hong Kong''s former international airport, completing the anchor phase of a district that will eventually house 130,000 residents. The main stadium seats 50,000 under a retractable roof, alongside an indoor arena and public sports ground.' from news_article a where a.slug = 'kai-tak-sports-park-opens'
    union all select a.id, 1, 'Our teams worked across structural engineering, building services, acoustics and crowd movement for more than a decade. The retractable roof was the defining challenge: it had to clear a long span, close quickly enough to be useful in sub-tropical rainfall, and not compromise the pitch''s grass growth when open.' from news_article a where a.slug = 'kai-tak-sports-park-opens'
    union all select a.id, 2, 'The district cooling network serving the park also supplies the surrounding commercial plots, which is why it stacks up financially. A cooling plant sized for a stadium alone would sit idle most of the year.' from news_article a where a.slug = 'kai-tak-sports-park-opens'
    union all select a.id, 3, 'Attention now turns to the remaining residential plots, where the phasing strategy allows occupation to begin while later stages are still on site.' from news_article a where a.slug = 'kai-tak-sports-park-opens';
insert into news_article_tag (article_id, position, tag)
    select a.id, 0, 'buildings' from news_article a where a.slug = 'kai-tak-sports-park-opens'
    union all select a.id, 1, 'cities-and-communities' from news_article a where a.slug = 'kai-tak-sports-park-opens';

insert into news_article (
    id, slug, title, excerpt, news_type, published_at, reading_minutes,
    image_url
) values (
    nextval('news_article_id_seq'),
    'data-centre-water-use-report',
    'New report: data centre water use is the constraint nobody budgeted for',
    'Our analysis of 40 hyperscale campuses finds that water availability, not grid capacity, will govern siting decisions in six of the ten fastest-growing markets.',
    'REPORT',
    date '2026-08-14',
    7,
    NULL
);
insert into news_article_body (article_id, position, paragraph)
    select a.id, 0, 'The conversation about data centre growth has focused almost entirely on electricity. Our review of 40 hyperscale campuses across three continents suggests that in six of the ten fastest-growing markets, water will bind first.' from news_article a where a.slug = 'data-centre-water-use-report'
    union all select a.id, 1, 'Evaporative cooling is cheap in energy terms and expensive in water terms. As rack densities rise with AI workloads, operators are choosing between higher power draw and higher water draw — and in water-stressed catchments, the second option is increasingly not available at any price.' from news_article a where a.slug = 'data-centre-water-use-report'
    union all select a.id, 2, 'The report sets out three practical responses: closed-loop liquid cooling where the heat rejection temperature allows it, heat reuse agreements with district networks, and honest catchment-level water accounting at the site selection stage rather than at permitting.' from news_article a where a.slug = 'data-centre-water-use-report'
    union all select a.id, 3, 'None of this is technically difficult. The obstacle is that water is usually assessed after a site has been acquired, by which point the decision that mattered has already been made.' from news_article a where a.slug = 'data-centre-water-use-report';
insert into news_article_tag (article_id, position, tag)
    select a.id, 0, 'data-centers-and-digital-infrastructure' from news_article a where a.slug = 'data-centre-water-use-report'
    union all select a.id, 1, 'water-and-environment' from news_article a where a.slug = 'data-centre-water-use-report'
    union all select a.id, 2, 'energy' from news_article a where a.slug = 'data-centre-water-use-report';

insert into news_article (
    id, slug, title, excerpt, news_type, published_at, reading_minutes,
    image_url
) values (
    nextval('news_article_id_seq'),
    'nusantara-spatial-framework',
    'Spatial framework published for Indonesia''s new capital',
    'Development intensity in Nusantara will be capped by catchment water balance rather than land availability, under a framework developed with the capital authority.',
    'INSIGHT',
    date '2026-07-30',
    5,
    NULL
);
insert into news_article_body (article_id, position, paragraph)
    select a.id, 0, 'The Nusantara Capital Authority has published the spatial framework for Indonesia''s new capital, developed with our planning, water and transport teams.' from news_article a where a.slug = 'nusantara-spatial-framework'
    union all select a.id, 1, 'The framework''s central move is to cap development intensity by what the catchment can absorb hydrologically, not by how much land is technically available. That inverts the usual sequence, where plots are allocated first and drainage is engineered afterwards.' from news_article a where a.slug = 'nusantara-spatial-framework'
    union all select a.id, 2, 'Forest corridors are retained through the urban structure as continuous systems rather than residual green space, and the transport network is fixed before plot allocation so that density follows capacity.' from news_article a where a.slug = 'nusantara-spatial-framework'
    union all select a.id, 3, 'Eighty per cent of journeys are targeted for public or active transport by 2045 — achievable only because the network is being built ahead of occupation rather than retrofitted after.' from news_article a where a.slug = 'nusantara-spatial-framework';
insert into news_article_tag (article_id, position, tag)
    select a.id, 0, 'cities-and-communities' from news_article a where a.slug = 'nusantara-spatial-framework'
    union all select a.id, 1, 'water-and-environment' from news_article a where a.slug = 'nusantara-spatial-framework';

insert into news_article (
    id, slug, title, excerpt, news_type, published_at, reading_minutes,
    image_url
) values (
    nextval('news_article_id_seq'),
    'porthcawl-scheme-wins-award',
    'Porthcawl coastal scheme wins national engineering award',
    'The Sandy Bay defences have been recognised for combining flood protection with habitat creation inside a single scheme footprint.',
    'AWARD',
    date '2026-07-11',
    3,
    NULL
);
insert into news_article_body (article_id, position, paragraph)
    select a.id, 0, 'The Porthcawl Sandy Bay coastal scheme has received a national award for civil engineering excellence, recognising the integration of flood defence renewal with intertidal habitat creation.' from news_article a where a.slug = 'porthcawl-scheme-wins-award'
    union all select a.id, 1, 'Rebuilding 1.2km of sea wall protects 580 properties against sea level rise projected through to 2120. What the judges highlighted was that the habitat gain was delivered inside the defence footprint, rather than as offsetting elsewhere.' from news_article a where a.slug = 'porthcawl-scheme-wins-award'
    union all select a.id, 2, 'The promenade stayed open to the public through most of the construction period, which constrained the sequencing considerably but preserved the reason people value the seafront in the first place.' from news_article a where a.slug = 'porthcawl-scheme-wins-award';
insert into news_article_tag (article_id, position, tag)
    select a.id, 0, 'water-and-environment' from news_article a where a.slug = 'porthcawl-scheme-wins-award'
    union all select a.id, 1, 'cities-and-communities' from news_article a where a.slug = 'porthcawl-scheme-wins-award';

insert into news_article (
    id, slug, title, excerpt, news_type, published_at, reading_minutes,
    image_url
) values (
    nextval('news_article_id_seq'),
    'retrofit-first-policy-briefing',
    'Why ''retrofit first'' needs a carbon test, not a presumption',
    'Reuse beats new build on embodied carbon most of the time — but not always. We set out the assessment that tells you which case you are in.',
    'INSIGHT',
    date '2026-06-24',
    6,
    NULL
);
insert into news_article_body (article_id, position, paragraph)
    select a.id, 0, 'Retrofit-first policies are spreading, and broadly they are right: keeping a structure usually avoids far more carbon than a new efficient building saves in operation. On our recent commercial projects, retention has delivered embodied carbon savings of 40 to 60 per cent.' from news_article a where a.slug = 'retrofit-first-policy-briefing'
    union all select a.id, 1, 'But ''usually'' is doing real work in that sentence. A poorly-performing building in a cold climate, retained with a façade that cannot be economically upgraded, can lose the embodied saving within twenty years of operational energy.' from news_article a where a.slug = 'retrofit-first-policy-briefing'
    union all select a.id, 2, 'The test is a whole-life comparison over a defined study period, with honest allowance for the operational performance actually achievable in the retained fabric. We have seen assessments that assume a retrofit reaches new-build performance; very few do.' from news_article a where a.slug = 'retrofit-first-policy-briefing'
    union all select a.id, 3, 'Our recommendation to policymakers is to mandate the assessment rather than the outcome. A presumption in favour of reuse, defeasible by evidence, gets better decisions than a rule in either direction.' from news_article a where a.slug = 'retrofit-first-policy-briefing';
insert into news_article_tag (article_id, position, tag)
    select a.id, 0, 'buildings' from news_article a where a.slug = 'retrofit-first-policy-briefing'
    union all select a.id, 1, 'sustainability' from news_article a where a.slug = 'retrofit-first-policy-briefing';

insert into news_article (
    id, slug, title, excerpt, news_type, published_at, reading_minutes,
    image_url
) values (
    nextval('news_article_id_seq'),
    'uheat-expands-to-fifty-cities',
    'UHeat expands to fifty cities as heat risk moves up the agenda',
    'Our satellite-based urban heat tool now covers fifty cities, identifying the specific surfaces driving local temperature rise.',
    'PRESS_RELEASE',
    date '2026-06-05',
    3,
    NULL
);
insert into news_article_body (article_id, position, paragraph)
    select a.id, 0, 'UHeat now covers fifty cities, up from twelve at launch. The tool combines satellite thermal imagery with machine learning to identify which buildings, roofs and paved surfaces contribute most to local temperature rise.' from news_article a where a.slug = 'uheat-expands-to-fifty-cities'
    union all select a.id, 1, 'Most heat strategies start with a city-wide average, which is not actionable. UHeat produces a ranked list of surfaces, which is — a municipality can see that a specific set of dark flat roofs in one district is generating a measurable share of the local heat island.' from news_article a where a.slug = 'uheat-expands-to-fifty-cities'
    union all select a.id, 2, 'Several cities have used the output to target roof-whitening and tree-planting programmes at the streets where they remove the most degrees, rather than distributing intervention evenly.' from news_article a where a.slug = 'uheat-expands-to-fifty-cities';
insert into news_article_tag (article_id, position, tag)
    select a.id, 0, 'cities-and-communities' from news_article a where a.slug = 'uheat-expands-to-fifty-cities'
    union all select a.id, 1, 'digital' from news_article a where a.slug = 'uheat-expands-to-fifty-cities'
    union all select a.id, 2, 'climate' from news_article a where a.slug = 'uheat-expands-to-fifty-cities';

insert into news_article (
    id, slug, title, excerpt, news_type, published_at, reading_minutes,
    image_url
) values (
    nextval('news_article_id_seq'),
    'grid-connection-queue-analysis',
    'The grid connection queue is now the binding constraint on renewables',
    'Analysis across four markets finds consented generation waiting an average of six years for a connection date — longer than it takes to build.',
    'INSIGHT',
    date '2026-05-19',
    6,
    NULL
);
insert into news_article_body (article_id, position, paragraph)
    select a.id, 0, 'Across the four markets we analysed, consented renewable generation is waiting an average of six years for a grid connection date. Construction takes two to three. The queue, not the turbine, is the schedule.' from news_article a where a.slug = 'grid-connection-queue-analysis'
    union all select a.id, 1, 'This is a queue management problem more than a copper problem. A significant share of the capacity in the queue will never be built, but it holds a position that blocks projects that would be.' from news_article a where a.slug = 'grid-connection-queue-analysis'
    union all select a.id, 2, 'Reforms that prioritise by readiness rather than application date, and that impose milestones with real consequences, release capacity faster than any realistic transmission build programme.' from news_article a where a.slug = 'grid-connection-queue-analysis'
    union all select a.id, 3, 'We are supporting three transmission operators on queue reform and connection strategy. The technical work is straightforward; the difficulty is that reform reallocates positions that developers consider theirs.' from news_article a where a.slug = 'grid-connection-queue-analysis';
insert into news_article_tag (article_id, position, tag)
    select a.id, 0, 'energy' from news_article a where a.slug = 'grid-connection-queue-analysis'
    union all select a.id, 1, 'advisory' from news_article a where a.slug = 'grid-connection-queue-analysis';

insert into news_article (
    id, slug, title, excerpt, news_type, published_at, reading_minutes,
    image_url
) values (
    nextval('news_article_id_seq'),
    'sdrs-journal-2026-issue-one',
    'The SDRS Journal 2026, Issue 1 is out now',
    'Sixty years of technical publishing continues with a bascule bridge in the UK, new wharves in Sydney and Kai Tak Sports Park in Hong Kong.',
    'PRESS_RELEASE',
    date '2026-04-30',
    2,
    NULL
);
insert into news_article_body (article_id, position, paragraph)
    select a.id, 0, 'The SDRS Journal has been publishing detailed technical accounts of our work for sixty years. Issue 1 of 2026 covers three projects in depth.' from news_article a where a.slug = 'sdrs-journal-2026-issue-one'
    union all select a.id, 1, 'A bascule bridge in the UK, where the counterweight arrangement had to fit within an existing abutment. New wharves in an environmentally sensitive part of Sydney Harbour, built with minimal seabed disturbance. And Kai Tak Sports Park, covering the retractable roof and district cooling integration.' from news_article a where a.slug = 'sdrs-journal-2026-issue-one'
    union all select a.id, 2, 'The Journal exists to publish the parts that do not make it into project summaries: what was tried and abandoned, and why the final solution looks the way it does.' from news_article a where a.slug = 'sdrs-journal-2026-issue-one'
    union all select a.id, 3, 'The full archive going back to 1966 remains freely available.' from news_article a where a.slug = 'sdrs-journal-2026-issue-one';
insert into news_article_tag (article_id, position, tag)
    select a.id, 0, 'publication' from news_article a where a.slug = 'sdrs-journal-2026-issue-one';

insert into news_article (
    id, slug, title, excerpt, news_type, published_at, reading_minutes,
    image_url
) values (
    nextval('news_article_id_seq'),
    'early-careers-intake-2027',
    'Applications open for our 2027 early careers intake',
    'Graduate and apprentice roles across engineering, digital and advisory disciplines are now open in twenty countries.',
    'EVENT',
    date '2026-04-08',
    3,
    NULL
);
insert into news_article_body (article_id, position, paragraph)
    select a.id, 0, 'Applications are open for our 2027 early careers programmes, covering graduate engineering roles, digital apprenticeships and advisory analyst positions across twenty countries.' from news_article a where a.slug = 'early-careers-intake-2027'
    union all select a.id, 1, 'The programme pairs structured technical development with project work from the first month. We are explicit that graduates join delivery teams rather than a training scheme that runs alongside the real work.' from news_article a where a.slug = 'early-careers-intake-2027'
    union all select a.id, 2, 'Mobility between disciplines is normal rather than exceptional. Several of our resilience and digital leaders started in façades or building services and moved once they found the problem they wanted to work on.' from news_article a where a.slug = 'early-careers-intake-2027'
    union all select a.id, 3, 'Applications close in November, and we assess on a rolling basis, so earlier submissions are considered sooner.' from news_article a where a.slug = 'early-careers-intake-2027';
insert into news_article_tag (article_id, position, tag)
    select a.id, 0, 'careers' from news_article a where a.slug = 'early-careers-intake-2027';

--rollback delete from news_article where slug in ('kai-tak-sports-park-opens', 'data-centre-water-use-report', 'nusantara-spatial-framework', 'porthcawl-scheme-wins-award', 'retrofit-first-policy-briefing', 'uheat-expands-to-fifty-cities', 'grid-connection-queue-analysis', 'sdrs-journal-2026-issue-one', 'early-careers-intake-2027');
