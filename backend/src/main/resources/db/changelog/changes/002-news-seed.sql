--liquibase formatted sql

--  The nine articles from packages/shared/data/news.ts, so a fresh database
--  serves the same newsroom the mock repository does and the site renders
--  identically either side of NEXT_PUBLIC_CONTENT_SOURCE.
--
--  Generated from that file rather than typed out, so the two cannot disagree.
--  Regenerating it changes the checksum of an applied changeSet, which Liquibase
--  treats as an error — add a new changeSet instead, or drop the database.
--
--  This is seed data, not reference data. The `seed` context means a deployment
--  with real content can skip it with
--  spring.liquibase.contexts=!seed (or simply never run it).

--changeset sdrs:002-01-seed-news-articles contextFilter:seed
--comment: Nine articles, their body paragraphs and their tags

insert into news_article (
    slug, title, excerpt, news_type, published_at, reading_minutes,
    author_name, author_role, image_url, image_alt, image_seed
) values (
    'kai-tak-sports-park-opens',
    'Kai Tak Sports Park opens to the public in Hong Kong',
    'The 50,000-seat stadium at the heart of the Kai Tak development has hosted its first full-capacity event, completing a decade of design and delivery work.',
    'PRESS_RELEASE',
    date '2026-08-28',
    4,
    'Priya Raghunathan',
    'Regional Communications Lead, East Asia',
    NULL,
    'A stadium with a retractable roof at dusk',
    'news-kai-tak-park'
);
insert into news_article_body (article_slug, position, paragraph) values
    ('kai-tak-sports-park-opens', 0, 'Kai Tak Sports Park has opened on the site of Hong Kong''s former international airport, completing the anchor phase of a district that will eventually house 130,000 residents. The main stadium seats 50,000 under a retractable roof, alongside an indoor arena and public sports ground.'),
    ('kai-tak-sports-park-opens', 1, 'Our teams worked across structural engineering, building services, acoustics and crowd movement for more than a decade. The retractable roof was the defining challenge: it had to clear a long span, close quickly enough to be useful in sub-tropical rainfall, and not compromise the pitch''s grass growth when open.'),
    ('kai-tak-sports-park-opens', 2, 'The district cooling network serving the park also supplies the surrounding commercial plots, which is why it stacks up financially. A cooling plant sized for a stadium alone would sit idle most of the year.'),
    ('kai-tak-sports-park-opens', 3, 'Attention now turns to the remaining residential plots, where the phasing strategy allows occupation to begin while later stages are still on site.');
insert into news_article_tag (article_slug, position, tag) values
    ('kai-tak-sports-park-opens', 0, 'buildings'),
    ('kai-tak-sports-park-opens', 1, 'cities-and-communities');

insert into news_article (
    slug, title, excerpt, news_type, published_at, reading_minutes,
    author_name, author_role, image_url, image_alt, image_seed
) values (
    'data-centre-water-use-report',
    'New report: data centre water use is the constraint nobody budgeted for',
    'Our analysis of 40 hyperscale campuses finds that water availability, not grid capacity, will govern siting decisions in six of the ten fastest-growing markets.',
    'REPORT',
    date '2026-08-14',
    7,
    'Daniel Okonkwo',
    'Global Data Centres Leader',
    NULL,
    'Cooling towers beside a data centre building',
    'news-dc-water'
);
insert into news_article_body (article_slug, position, paragraph) values
    ('data-centre-water-use-report', 0, 'The conversation about data centre growth has focused almost entirely on electricity. Our review of 40 hyperscale campuses across three continents suggests that in six of the ten fastest-growing markets, water will bind first.'),
    ('data-centre-water-use-report', 1, 'Evaporative cooling is cheap in energy terms and expensive in water terms. As rack densities rise with AI workloads, operators are choosing between higher power draw and higher water draw — and in water-stressed catchments, the second option is increasingly not available at any price.'),
    ('data-centre-water-use-report', 2, 'The report sets out three practical responses: closed-loop liquid cooling where the heat rejection temperature allows it, heat reuse agreements with district networks, and honest catchment-level water accounting at the site selection stage rather than at permitting.'),
    ('data-centre-water-use-report', 3, 'None of this is technically difficult. The obstacle is that water is usually assessed after a site has been acquired, by which point the decision that mattered has already been made.');
insert into news_article_tag (article_slug, position, tag) values
    ('data-centre-water-use-report', 0, 'data-centers-and-digital-infrastructure'),
    ('data-centre-water-use-report', 1, 'water-and-environment'),
    ('data-centre-water-use-report', 2, 'energy');

insert into news_article (
    slug, title, excerpt, news_type, published_at, reading_minutes,
    author_name, author_role, image_url, image_alt, image_seed
) values (
    'nusantara-spatial-framework',
    'Spatial framework published for Indonesia''s new capital',
    'Development intensity in Nusantara will be capped by catchment water balance rather than land availability, under a framework developed with the capital authority.',
    'INSIGHT',
    date '2026-07-30',
    5,
    'Sari Wijaya',
    'Associate Director, Cities Planning',
    NULL,
    'Aerial view of forest and a planned settlement',
    'news-nusantara'
);
insert into news_article_body (article_slug, position, paragraph) values
    ('nusantara-spatial-framework', 0, 'The Nusantara Capital Authority has published the spatial framework for Indonesia''s new capital, developed with our planning, water and transport teams.'),
    ('nusantara-spatial-framework', 1, 'The framework''s central move is to cap development intensity by what the catchment can absorb hydrologically, not by how much land is technically available. That inverts the usual sequence, where plots are allocated first and drainage is engineered afterwards.'),
    ('nusantara-spatial-framework', 2, 'Forest corridors are retained through the urban structure as continuous systems rather than residual green space, and the transport network is fixed before plot allocation so that density follows capacity.'),
    ('nusantara-spatial-framework', 3, 'Eighty per cent of journeys are targeted for public or active transport by 2045 — achievable only because the network is being built ahead of occupation rather than retrofitted after.');
insert into news_article_tag (article_slug, position, tag) values
    ('nusantara-spatial-framework', 0, 'cities-and-communities'),
    ('nusantara-spatial-framework', 1, 'water-and-environment');

insert into news_article (
    slug, title, excerpt, news_type, published_at, reading_minutes,
    author_name, author_role, image_url, image_alt, image_seed
) values (
    'porthcawl-scheme-wins-award',
    'Porthcawl coastal scheme wins national engineering award',
    'The Sandy Bay defences have been recognised for combining flood protection with habitat creation inside a single scheme footprint.',
    'AWARD',
    date '2026-07-11',
    3,
    'Rhian Morgan',
    'Project Director, Water',
    NULL,
    'A coastal promenade beside a sandy beach',
    'news-porthcawl-award'
);
insert into news_article_body (article_slug, position, paragraph) values
    ('porthcawl-scheme-wins-award', 0, 'The Porthcawl Sandy Bay coastal scheme has received a national award for civil engineering excellence, recognising the integration of flood defence renewal with intertidal habitat creation.'),
    ('porthcawl-scheme-wins-award', 1, 'Rebuilding 1.2km of sea wall protects 580 properties against sea level rise projected through to 2120. What the judges highlighted was that the habitat gain was delivered inside the defence footprint, rather than as offsetting elsewhere.'),
    ('porthcawl-scheme-wins-award', 2, 'The promenade stayed open to the public through most of the construction period, which constrained the sequencing considerably but preserved the reason people value the seafront in the first place.');
insert into news_article_tag (article_slug, position, tag) values
    ('porthcawl-scheme-wins-award', 0, 'water-and-environment'),
    ('porthcawl-scheme-wins-award', 1, 'cities-and-communities');

insert into news_article (
    slug, title, excerpt, news_type, published_at, reading_minutes,
    author_name, author_role, image_url, image_alt, image_seed
) values (
    'retrofit-first-policy-briefing',
    'Why ''retrofit first'' needs a carbon test, not a presumption',
    'Reuse beats new build on embodied carbon most of the time — but not always. We set out the assessment that tells you which case you are in.',
    'INSIGHT',
    date '2026-06-24',
    6,
    'Tom Ashworth',
    'Sustainability Consulting Lead',
    NULL,
    'Scaffolding around a building under refurbishment',
    'news-retrofit'
);
insert into news_article_body (article_slug, position, paragraph) values
    ('retrofit-first-policy-briefing', 0, 'Retrofit-first policies are spreading, and broadly they are right: keeping a structure usually avoids far more carbon than a new efficient building saves in operation. On our recent commercial projects, retention has delivered embodied carbon savings of 40 to 60 per cent.'),
    ('retrofit-first-policy-briefing', 1, 'But ''usually'' is doing real work in that sentence. A poorly-performing building in a cold climate, retained with a façade that cannot be economically upgraded, can lose the embodied saving within twenty years of operational energy.'),
    ('retrofit-first-policy-briefing', 2, 'The test is a whole-life comparison over a defined study period, with honest allowance for the operational performance actually achievable in the retained fabric. We have seen assessments that assume a retrofit reaches new-build performance; very few do.'),
    ('retrofit-first-policy-briefing', 3, 'Our recommendation to policymakers is to mandate the assessment rather than the outcome. A presumption in favour of reuse, defeasible by evidence, gets better decisions than a rule in either direction.');
insert into news_article_tag (article_slug, position, tag) values
    ('retrofit-first-policy-briefing', 0, 'buildings'),
    ('retrofit-first-policy-briefing', 1, 'sustainability');

insert into news_article (
    slug, title, excerpt, news_type, published_at, reading_minutes,
    author_name, author_role, image_url, image_alt, image_seed
) values (
    'uheat-expands-to-fifty-cities',
    'UHeat expands to fifty cities as heat risk moves up the agenda',
    'Our satellite-based urban heat tool now covers fifty cities, identifying the specific surfaces driving local temperature rise.',
    'PRESS_RELEASE',
    date '2026-06-05',
    3,
    'Lena Fischer',
    'Digital Products Lead',
    NULL,
    'Thermal imagery overlaid on a city map',
    'news-uheat'
);
insert into news_article_body (article_slug, position, paragraph) values
    ('uheat-expands-to-fifty-cities', 0, 'UHeat now covers fifty cities, up from twelve at launch. The tool combines satellite thermal imagery with machine learning to identify which buildings, roofs and paved surfaces contribute most to local temperature rise.'),
    ('uheat-expands-to-fifty-cities', 1, 'Most heat strategies start with a city-wide average, which is not actionable. UHeat produces a ranked list of surfaces, which is — a municipality can see that a specific set of dark flat roofs in one district is generating a measurable share of the local heat island.'),
    ('uheat-expands-to-fifty-cities', 2, 'Several cities have used the output to target roof-whitening and tree-planting programmes at the streets where they remove the most degrees, rather than distributing intervention evenly.');
insert into news_article_tag (article_slug, position, tag) values
    ('uheat-expands-to-fifty-cities', 0, 'cities-and-communities'),
    ('uheat-expands-to-fifty-cities', 1, 'digital'),
    ('uheat-expands-to-fifty-cities', 2, 'climate');

insert into news_article (
    slug, title, excerpt, news_type, published_at, reading_minutes,
    author_name, author_role, image_url, image_alt, image_seed
) values (
    'grid-connection-queue-analysis',
    'The grid connection queue is now the binding constraint on renewables',
    'Analysis across four markets finds consented generation waiting an average of six years for a connection date — longer than it takes to build.',
    'INSIGHT',
    date '2026-05-19',
    6,
    'Aisha Rahman',
    'Energy Advisory Director',
    NULL,
    'Electricity transmission pylons at sunset',
    'news-grid-queue'
);
insert into news_article_body (article_slug, position, paragraph) values
    ('grid-connection-queue-analysis', 0, 'Across the four markets we analysed, consented renewable generation is waiting an average of six years for a grid connection date. Construction takes two to three. The queue, not the turbine, is the schedule.'),
    ('grid-connection-queue-analysis', 1, 'This is a queue management problem more than a copper problem. A significant share of the capacity in the queue will never be built, but it holds a position that blocks projects that would be.'),
    ('grid-connection-queue-analysis', 2, 'Reforms that prioritise by readiness rather than application date, and that impose milestones with real consequences, release capacity faster than any realistic transmission build programme.'),
    ('grid-connection-queue-analysis', 3, 'We are supporting three transmission operators on queue reform and connection strategy. The technical work is straightforward; the difficulty is that reform reallocates positions that developers consider theirs.');
insert into news_article_tag (article_slug, position, tag) values
    ('grid-connection-queue-analysis', 0, 'energy'),
    ('grid-connection-queue-analysis', 1, 'advisory');

insert into news_article (
    slug, title, excerpt, news_type, published_at, reading_minutes,
    author_name, author_role, image_url, image_alt, image_seed
) values (
    'sdrs-journal-2026-issue-one',
    'The SDRS Journal 2026, Issue 1 is out now',
    'Sixty years of technical publishing continues with a bascule bridge in the UK, new wharves in Sydney and Kai Tak Sports Park in Hong Kong.',
    'PRESS_RELEASE',
    date '2026-04-30',
    2,
    'Editorial team',
    'The SDRS Journal',
    NULL,
    'A printed technical journal on a desk',
    'news-journal'
);
insert into news_article_body (article_slug, position, paragraph) values
    ('sdrs-journal-2026-issue-one', 0, 'The SDRS Journal has been publishing detailed technical accounts of our work for sixty years. Issue 1 of 2026 covers three projects in depth.'),
    ('sdrs-journal-2026-issue-one', 1, 'A bascule bridge in the UK, where the counterweight arrangement had to fit within an existing abutment. New wharves in an environmentally sensitive part of Sydney Harbour, built with minimal seabed disturbance. And Kai Tak Sports Park, covering the retractable roof and district cooling integration.'),
    ('sdrs-journal-2026-issue-one', 2, 'The Journal exists to publish the parts that do not make it into project summaries: what was tried and abandoned, and why the final solution looks the way it does.'),
    ('sdrs-journal-2026-issue-one', 3, 'The full archive going back to 1966 remains freely available.');
insert into news_article_tag (article_slug, position, tag) values
    ('sdrs-journal-2026-issue-one', 0, 'publication');

insert into news_article (
    slug, title, excerpt, news_type, published_at, reading_minutes,
    author_name, author_role, image_url, image_alt, image_seed
) values (
    'early-careers-intake-2027',
    'Applications open for our 2027 early careers intake',
    'Graduate and apprentice roles across engineering, digital and advisory disciplines are now open in twenty countries.',
    'EVENT',
    date '2026-04-08',
    3,
    'Marcus Bell',
    'Global Early Careers Lead',
    NULL,
    'Young professionals collaborating around a model',
    'news-early-careers'
);
insert into news_article_body (article_slug, position, paragraph) values
    ('early-careers-intake-2027', 0, 'Applications are open for our 2027 early careers programmes, covering graduate engineering roles, digital apprenticeships and advisory analyst positions across twenty countries.'),
    ('early-careers-intake-2027', 1, 'The programme pairs structured technical development with project work from the first month. We are explicit that graduates join delivery teams rather than a training scheme that runs alongside the real work.'),
    ('early-careers-intake-2027', 2, 'Mobility between disciplines is normal rather than exceptional. Several of our resilience and digital leaders started in façades or building services and moved once they found the problem they wanted to work on.'),
    ('early-careers-intake-2027', 3, 'Applications close in November, and we assess on a rolling basis, so earlier submissions are considered sooner.');
insert into news_article_tag (article_slug, position, tag) values
    ('early-careers-intake-2027', 0, 'careers');

--rollback delete from news_article where slug in ('kai-tak-sports-park-opens', 'data-centre-water-use-report', 'nusantara-spatial-framework', 'porthcawl-scheme-wins-award', 'retrofit-first-policy-briefing', 'uheat-expands-to-fifty-cities', 'grid-connection-queue-analysis', 'sdrs-journal-2026-issue-one', 'early-careers-intake-2027');
