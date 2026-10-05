import type { Market } from "../types/content";

/**
 * Dummy content. Replace with the Spring Boot `/api/markets` response.
 *
 * **This array is in display order**, and that is the whole mechanism: nothing
 * in either app sorts markets, so `/markets`, the home film strip and the CMS
 * list all show them in the sequence written here. The API has to hold the same
 * contract — `GET /markets` returns them already ordered — or the sequence
 * breaks with nothing to catch it.
 *
 * Every market carries a `film`, shown under its hero. There is no real footage
 * yet, so each one points at a ten-second silent loop in
 * `public/video/markets/` — drafting linework about that market's subject,
 * panning over the same gradient the market's still placeholder uses, generated
 * by `scripts/generate-market-films.py`. They stand in for film the way the
 * gradients stand in for photography: drop a real cut in over the same filename,
 * or swap `url` for an `embedUrl` if it lives on YouTube or Vimeo. Remove `film`
 * entirely and the page simply skips the band.
 */
export const markets: Market[] = [
  {
    slug: "buildings",
    name: "Buildings",
    tagline: "Buildings that earn their carbon and hold their value",
    description:
      "Offices, homes, mixed-use districts, campuses, venues and the retrofit of everything already standing. We design structures and building services together, so that embodied carbon, operational energy and commercial floor area are traded off deliberately instead of by accident.",
    image: { alt: "A glazed office tower against a clear sky", seed: "market-estate" },
    film: {
      caption:
        "Floor plates going up and the massing settling back — the trade between area, carbon and height, made visible.",
      video: {
        url: "/video/markets/buildings.webm",
        alt: "Film of floor plates stacking up into towers in elevation",
        poster: {
          alt: "A glazed office tower against a clear sky",
          seed: "market-estate",
        },
      },
    },
    capabilities: [
      "Structural and façade engineering",
      "Building services and MEP design",
      "Retrofit and reuse strategy",
      "Whole-life carbon assessment",
      "Fire and life safety engineering",
      "Long-span roofs for venues and halls",
      "Room and building acoustics",
    ],
    stats: [
      { value: "45", unit: "%", label: "Average embodied carbon saving on reuse schemes" },
      { value: "900", unit: "+", label: "Certified sustainable buildings delivered" },
    ],
    featuredProjectSlugs: [
      "ws2-building-design",
      "kai-tak-development",
      "sydney-opera-house-concert-hall",
      "sagrada-familia",
      "arena-milano",
    ],
  },
  {
    slug: "cities-and-communities",
    name: "Cities & Communities",
    tagline: "Planning growth that people actually want to live in",
    description:
      "We bring together planners, economists, transport modellers and climate specialists to help cities and the communities inside them decide what to build and in what order. Much of the work is unglamorous: governance, funding routes and delivery sequencing are what turn a masterplan into something real.",
    image: { alt: "Dense city skyline at dusk", seed: "market-urban" },
    film: {
      caption:
        "Two skylines and the street grid beneath them, which is what actually decides how a city works.",
      video: {
        url: "/video/markets/cities-and-communities.webm",
        alt: "Film of two city skylines panning over a street grid",
        poster: {
          alt: "Dense city skyline at dusk",
          seed: "market-urban",
        },
      },
    },
    capabilities: [
      "Masterplanning and urban design",
      "Climate adaptation and heat resilience",
      "Transport-oriented development",
      "Economics and business case development",
      "Net zero city roadmaps",
      "Post-disaster reconstruction programmes",
    ],
    stats: [
      { value: "120", unit: "+", label: "City-scale climate strategies delivered" },
      { value: "2050", label: "Net zero target year we plan against" },
    ],
    featuredProjectSlugs: [
      "nusantara-capital",
      "kai-tak-development",
      "peru-reconstruction",
      "fifa-world-cup-2026-host-cities",
    ],
  },
  {
    slug: "transport-and-mobility",
    name: "Transport & Mobility",
    tagline: "Moving people and goods with less carbon and less friction",
    description:
      "From metro systems and high-speed rail to ports, airports and active travel networks, we plan and engineer the connections that let cities grow without grinding to a halt. Our teams combine operational modelling, structural design and passenger experience work so that new capacity actually gets used.",
    image: {
      alt: "A busy underground metro concourse",
      seed: "market-transport",
    },
    film: {
      caption:
        "Road, rail and platform as one drawing — the same corridor carrying three kinds of traffic at three different speeds.",
      video: {
        url: "/video/markets/transport-and-mobility.webm",
        alt: "Film of a transport corridor in plan: traffic, a railway and a platform",
        poster: {
          alt: "A busy underground metro concourse",
          seed: "market-transport",
        },
      },
    },
    capabilities: [
      "Rail and metro systems engineering",
      "Aviation masterplanning and terminal design",
      "Ports, harbours and marine structures",
      "Highways, bridges and tunnels",
      "Transport demand and operations modelling",
    ],
    stats: [
      { value: "70", unit: "+", label: "Metro systems advised on worldwide" },
      { value: "1.4", unit: "bn", label: "Annual passenger journeys supported" },
    ],
    featuredProjectSlugs: [
      "elizabeth-line",
      "thomson-east-coast-line-3",
      "us-181-harbor-bridge",
    ],
  },
  {
    slug: "water-and-environment",
    name: "Water & Environment",
    tagline: "Securing supply, managing flood risk, restoring rivers",
    description:
      "Utilities face rising demand, ageing assets and a climate that no longer matches their design assumptions. We help them prioritise investment, design treatment and network upgrades, and build catchment-scale resilience that works with natural systems rather than against them.",
    image: {
      alt: "Water treatment works seen from above",
      seed: "market-environment",
    },
    film: {
      caption:
        "Two interventions in one catchment, and how far the effect of each of them travels.",
      video: {
        url: "/video/markets/water-and-environment.webm",
        alt: "Film of ripples spreading across a catchment over contour lines",
        poster: {
          alt: "Water treatment works seen from above",
          seed: "market-environment",
        },
      },
    },
    capabilities: [
      "Water and wastewater treatment design",
      "Flood risk and coastal resilience",
      "Catchment and river restoration",
      "Asset management and investment planning",
      "Digital twins for utility networks",
    ],
    stats: [
      { value: "8", unit: "m", label: "People served by networks we have upgraded" },
      { value: "30", unit: "%", label: "Typical leakage reduction after intervention" },
    ],
    featuredProjectSlugs: [
      "porthcawl-sandy-bay",
      "hunters-point-south",
      "nyc-impervious-area-study",
    ],
  },
  {
    slug: "energy",
    name: "Energy",
    tagline: "Engineering the grid and generation a net zero economy needs",
    description:
      "We work across offshore and onshore wind, solar, nuclear, hydrogen and the transmission networks that tie them together. The hard part is rarely the turbine — it is consenting, grid connection and making the economics stand up, which is where our advisory and engineering teams work side by side.",
    image: { alt: "Offshore wind turbines at dawn", seed: "market-energy" },
    film: {
      caption:
        "Generation and network in one frame: rotors turning against the transmission line that has to take what they make.",
      video: {
        url: "/video/markets/energy.webm",
        alt: "Film of wind turbines turning above a transmission line",
        poster: { alt: "Offshore wind turbines at dawn", seed: "market-energy" },
      },
    },
    capabilities: [
      "Offshore and onshore wind development",
      "Grid connection and transmission planning",
      "Solar and battery storage design",
      "Hydrogen and low-carbon fuels",
      "Energy transition strategy and due diligence",
    ],
    stats: [
      { value: "714", unit: "MW", label: "Offshore wind enabled at East Anglia One" },
      { value: "40", unit: "+", label: "Countries with energy commissions delivered" },
    ],
    featuredProjectSlugs: ["east-anglia-one", "cayanga-hillside-solar-farm"],
  },
  {
    slug: "industrial-and-manufacturing",
    name: "Industrial & Manufacturing",
    tagline: "Decarbonising production without losing throughput",
    description:
      "Manufacturers are electrifying process heat, rethinking supply chains and building new capacity at speed. We design the facilities and the utilities behind them, and advise on the sequencing that keeps existing lines running through the transition — including the mining and materials operations at the start of those chains.",
    image: {
      alt: "A production line inside a large factory",
      seed: "market-industry",
    },
    film: {
      caption:
        "The line running, and the plant behind it that has to be decarbonised without stopping it.",
      video: {
        url: "/video/markets/industrial-and-manufacturing.webm",
        alt: "Film of a conveyor line running, driven by turning gears",
        poster: {
          alt: "A production line inside a large factory",
          seed: "market-industry",
        },
      },
    },
    capabilities: [
      "Advanced manufacturing facility design",
      "Process utilities and electrification",
      "Industrial decarbonisation roadmaps",
      "Logistics and supply chain resilience",
      "Automation-ready building systems",
      "Bulk materials handling and tailings safety",
    ],
    stats: [
      { value: "70", unit: "%", label: "Process emissions cut on flagship plants" },
      { value: "24", label: "Months from brief to operational handover" },
    ],
    featuredProjectSlugs: ["pepsico-plant-poland", "cayanga-hillside-solar-farm"],
  },
  {
    slug: "healthcare-and-science",
    name: "Healthcare & Science",
    tagline: "Clinical estates and laboratories that flex with demand",
    description:
      "Hospitals are among the most complex buildings there are, and research programmes outlive the buildings that house them. We plan and engineer clinical estates around patient flow, infection control and staff wellbeing, and design laboratories and cleanrooms with the servicing flexibility to be repurposed — while cutting the energy intensity of round-the-clock operation.",
    image: {
      alt: "A light-filled hospital atrium",
      seed: "market-health-science",
    },
    film: {
      caption:
        "Ward wings and lab modules off one spine, and the round-the-clock demand the estate has to absorb.",
      video: {
        url: "/video/markets/healthcare-and-science.webm",
        alt: "Film of ward wings and laboratory modules in plan, with a pulse trace and orbital paths crossing them",
        poster: {
          alt: "A light-filled hospital atrium",
          seed: "market-health-science",
        },
      },
    },
    capabilities: [
      "Hospital planning and clinical flow",
      "Ventilation and infection control",
      "Laboratory and cleanroom design",
      "Vibration and acoustics engineering",
      "Containment and biosafety facilities",
      "Decarbonising clinical estates",
      "Phased delivery on live sites",
    ],
    stats: [
      { value: "250", unit: "+", label: "Research facilities delivered globally" },
      { value: "60", unit: "%", label: "Energy reduction on recent hospital retrofits" },
    ],
    featuredProjectSlugs: ["pepsico-plant-poland"],
  },
  {
    slug: "data-centers-and-digital-infrastructure",
    name: "Data Centers & Digital Infrastructure",
    tagline: "Compute capacity without runaway water and power demand",
    description:
      "AI workloads have changed the brief. Rack densities, liquid cooling and grid constraints now drive site selection as much as land price. We advise hyperscalers, colocation providers and enterprises on where to build, how to cool it and how to stand up capacity on a credible schedule.",
    image: {
      alt: "Rows of server racks in a cold aisle",
      seed: "market-digital",
    },
    film: {
      caption:
        "A cold aisle at rack level, and the traffic the campus was built to carry.",
      video: {
        url: "/video/markets/data-centers-and-digital-infrastructure.webm",
        alt: "Film of server racks with status lights, and packets crossing the bus",
        poster: {
          alt: "Rows of server racks in a cold aisle",
          seed: "market-digital",
        },
      },
    },
    capabilities: [
      "Site selection and feasibility",
      "Liquid and hybrid cooling design",
      "Power resilience and grid strategy",
      "Commissioning and reliability assurance",
      "Water stewardship and heat reuse",
      "Fixed and mobile network infrastructure",
    ],
    stats: [
      { value: "3.2", unit: "GW", label: "Data centre capacity advised on since 2020" },
      { value: "1.15", label: "Design PUE achieved on recent campuses" },
    ],
    featuredProjectSlugs: ["ntt-hong-kong-fdc2"],
  },
  {
    slug: "climate-and-sustainability",
    name: "Climate & Sustainability",
    tagline: "Getting from a carbon target to the work that meets it",
    description:
      "Most organisations now have a target and a gap. We measure what their assets and operations actually emit, model the routes to the commitment they have made, and stay on to engineer the interventions — adaptation as well as mitigation, because the climate the estate was designed for has already changed.",
    image: {
      alt: "A coastal defence under construction at low tide",
      seed: "market-sustainability",
    },
    film: {
      caption:
        "The emissions curve stepping down to the datum, and the loop that keeps material in use.",
      video: {
        url: "/video/markets/climate-and-sustainability.webm",
        alt: "Film of an emissions curve descending to a net zero datum beside a turning circularity loop",
        poster: {
          alt: "A coastal defence under construction at low tide",
          seed: "market-sustainability",
        },
      },
    },
    capabilities: [
      "Whole-life carbon and emissions measurement",
      "Net zero pathways and transition planning",
      "Climate risk and adaptation strategy",
      "Circular economy and material reuse",
      "Nature-based solutions and biodiversity net gain",
    ],
    stats: [
      { value: "3.5", unit: "%", label: "Of profit committed to climate research each year" },
      { value: "2050", label: "Net zero target year we plan against" },
    ],
    featuredProjectSlugs: [
      "gatwick-carbon-study",
      "porthcawl-sandy-bay",
      "nyc-impervious-area-study",
    ],
  },
  {
    slug: "research-and-emerging-technologies",
    name: "Research & Emerging Technologies",
    tagline: "Answering the questions our projects keep running into",
    description:
      "A fixed share of profit pays for research, and the questions come off live projects rather than out of a strategy document. We investigate materials, methods and emerging technology — automation, sensing, machine learning applied to design — then publish what we find and teach it back to our own teams and to our clients.",
    image: {
      alt: "Researchers testing a material sample in a laboratory",
      seed: "market-research",
    },
    film: {
      caption:
        "The graph of a question being explored, and the sweep that narrows it to an answer.",
      video: {
        url: "/video/markets/research-and-emerging-technologies.webm",
        alt: "Film of a node graph with pulses travelling its links over a parameter sweep",
        poster: {
          alt: "Researchers testing a material sample in a laboratory",
          seed: "market-research",
        },
      },
    },
    capabilities: [
      "Applied materials and structural research",
      "Machine learning for design and survey",
      "Digital twins, sensing and monitoring",
      "Automation and advanced construction methods",
      "Technical publishing and training",
    ],
    stats: [
      { value: "37", label: "Papers published in the last three years" },
      { value: "1,900", unit: "+", label: "Places on our courses last year" },
    ],
    featuredProjectSlugs: [
      "nyc-impervious-area-study",
      "ws2-building-design",
      "gatwick-carbon-study",
    ],
  },
];
