import type { DigitalTool, Service } from "../types/content";

/**
 * Dummy content. Replace with the Spring Boot `/api/services` response.
 *
 * Like `markets`, this array is in display order — but the services page groups
 * by `category` rather than listing straight through, so the order here only
 * decides the sequence within a category.
 */
export const services: Service[] = [
  {
    slug: "structural-engineering",
    name: "Structural Engineering",
    category: "Design & Engineering",
    tagline: "Frames that stand up to height, wind and the ground they sit on",
    description:
      "Tall and supertall buildings, long spans and the lateral systems that make them possible, in reinforced concrete, steel and composite construction. Seismic and wind behaviour drive the scheme on most of this work, so analysis runs alongside the design rather than after it.",
    image: {
      alt: "Steel and concrete frame of a tower under construction",
      seed: "service-structural",
    },
    capabilities: [
      "Tall and supertall buildings",
      "Reinforced concrete, steel and composite structures",
      "Seismic and wind engineering",
      "Structural assessment",
      "Strengthening and retrofitting",
      "Foundations and structural rehabilitation",
    ],
    relatedMarketSlugs: [
      "buildings",
      "transport-and-mobility",
      "healthcare-and-science",
      "data-centers-and-digital-infrastructure",
    ],
  },
  {
    slug: "civil-and-infrastructure-engineering",
    name: "Civil & Infrastructure Engineering",
    category: "Design & Engineering",
    tagline: "The networks and site works everything else depends on",
    description:
      "Roads, rail and transit, bridges and special structures, and the utilities, drainage and site development that have to be resolved before any of it can be built. Much of the value is in sequencing: what gets diverted, when, and what stays in service while it happens.",
    image: {
      alt: "A highway interchange and rail corridor from above",
      seed: "service-civil",
    },
    capabilities: [
      "Roads and highways",
      "Rail and transit infrastructure",
      "Bridges and special structures",
      "Utilities",
      "Drainage and stormwater",
      "Site development",
    ],
    relatedMarketSlugs: [
      "transport-and-mobility",
      "cities-and-communities",
      "water-and-environment",
      "industrial-and-manufacturing",
    ],
  },
  {
    slug: "geotechnical-and-foundation-engineering",
    name: "Geotechnical & Foundation Engineering",
    category: "Design & Engineering",
    tagline: "What the ground will actually carry, and how to prove it",
    description:
      "Ground investigation and the interpretation that turns it into a design basis, then the foundations, piling, improvement and temporary works that follow from it. Soil–structure interaction is modelled with the superstructure, because the two sets of assumptions have to agree.",
    image: {
      alt: "A piling rig working on a city site",
      seed: "service-geotechnics",
    },
    capabilities: [
      "Ground investigation and interpretation",
      "Shallow and deep foundations",
      "Piling",
      "Ground improvement",
      "Excavation and shoring",
      "Soil–structure interaction",
    ],
    relatedMarketSlugs: [
      "buildings",
      "transport-and-mobility",
      "energy",
      "industrial-and-manufacturing",
    ],
  },
  {
    slug: "architecture-and-integrated-building-design",
    name: "Architecture & Integrated Building Design",
    category: "Design & Engineering",
    tagline: "One design, coordinated across every discipline that touches it",
    description:
      "Architectural design carried out inside the engineering team rather than alongside it, so the façade, the envelope and the structure are settled together. The test is constructability: a detail that cannot be built on site is not a resolved detail.",
    image: {
      alt: "A unitised façade being set against a finished frame",
      seed: "service-envelope",
    },
    capabilities: [
      "Architectural design",
      "Multidisciplinary coordination",
      "Façade engineering",
      "Building envelope",
      "Constructability and design integration",
    ],
    relatedMarketSlugs: [
      "buildings",
      "healthcare-and-science",
      "cities-and-communities",
      "climate-and-sustainability",
    ],
  },
  {
    slug: "building-services-mep",
    name: "Building Services — MEP",
    category: "Design & Engineering",
    tagline: "The systems that decide what a building costs to run",
    description:
      "Mechanical, electrical, plumbing and public health design, with fire and life safety engineered as part of the same scheme. Energy performance is a design input here, not a report produced at the end to describe what was already drawn.",
    image: {
      alt: "Plant room pipework and distribution boards",
      seed: "service-mep",
    },
    capabilities: [
      "Mechanical systems",
      "Electrical engineering",
      "Plumbing and public health",
      "Fire and life safety",
      "Energy-efficient building systems",
    ],
    relatedMarketSlugs: [
      "buildings",
      "healthcare-and-science",
      "data-centers-and-digital-infrastructure",
      "industrial-and-manufacturing",
    ],
  },
  {
    slug: "structural-assessment-and-retrofitting",
    name: "Structural Assessment & Retrofitting",
    category: "Design & Engineering",
    tagline: "Working out what a standing building can still be asked to do",
    description:
      "Assessment of existing structures, then the rehabilitation that follows: concrete and steel repair, RC and steel jacketing, CFRP strengthening and seismic upgrade. Change of use is the common trigger, and the answer is usually cheaper and lower-carbon than replacement.",
    image: {
      alt: "A concrete frame being strengthened with fibre wrap",
      seed: "service-retrofit",
    },
    capabilities: [
      "Existing-building assessment",
      "Concrete and steel rehabilitation",
      "RC and steel jacketing",
      "CFRP strengthening",
      "Seismic rehabilitation",
      "Change-of-use and structural modification studies",
    ],
    relatedMarketSlugs: [
      "buildings",
      "climate-and-sustainability",
      "healthcare-and-science",
      "transport-and-mobility",
    ],
  },
  {
    slug: "digital-engineering-and-bim",
    name: "Digital Engineering & BIM",
    category: "Digital",
    tagline: "Models that coordinate the work, not just describe it",
    description:
      "BIM, computational design and structural modelling run as the delivery method for a project rather than a parallel exercise. Parametric and automated workflows are built where a decision has to be taken hundreds of times and the geometry is the only thing that changes.",
    image: {
      alt: "A federated building model on screen with clash results",
      seed: "service-digital",
    },
    capabilities: [
      "BIM",
      "Computational design",
      "Structural modelling and analysis",
      "Digital coordination",
      "Parametric engineering",
      "Automation and data-driven design",
    ],
    relatedMarketSlugs: [
      "buildings",
      "data-centers-and-digital-infrastructure",
      "transport-and-mobility",
      "research-and-emerging-technologies",
    ],
  },
  {
    slug: "sustainability-and-resilience",
    name: "Sustainability & Resilience",
    category: "Planning & Sustainability",
    tagline: "Lower carbon now, and still standing under the next climate",
    description:
      "Sustainable design and climate resilience treated as one brief: low-carbon structural schemes, material efficiency, energy and resource optimisation, and adaptation for the conditions an asset will actually see. Decisions are reported with the numbers behind them, including the ones that do not flatter the scheme.",
    image: {
      alt: "A green roof above a city block at dusk",
      seed: "service-sustain",
    },
    capabilities: [
      "Sustainable design",
      "Climate resilience",
      "Low-carbon engineering",
      "Material efficiency",
      "Energy and resource optimisation",
      "Lifecycle thinking",
    ],
    relatedMarketSlugs: [
      "climate-and-sustainability",
      "buildings",
      "cities-and-communities",
      "water-and-environment",
      "energy",
    ],
  },
  {
    slug: "project-and-construction-advisory",
    name: "Project & Construction Advisory",
    category: "Advisory",
    tagline: "A second opinion with the authority to change the scheme",
    description:
      "Design management, technical due diligence, value engineering, peer and constructability review, and the construction engineering support that keeps a site moving. We are explicit about which findings are risks to price and which are reasons to stop.",
    image: {
      alt: "Engineers reviewing drawings in a site office",
      seed: "service-advisory",
    },
    capabilities: [
      "Design management",
      "Technical due diligence",
      "Value engineering",
      "Peer review",
      "Constructability review",
      "Construction engineering and site technical support",
    ],
    relatedMarketSlugs: [
      "buildings",
      "transport-and-mobility",
      "energy",
      "industrial-and-manufacturing",
      "data-centers-and-digital-infrastructure",
    ],
  },
  {
    slug: "research-innovation-and-training",
    name: "Research, Innovation & Training",
    category: "Research & Innovation",
    tagline: "Answering the questions a project raises, then teaching the answer",
    description:
      "Applied engineering research and advanced structural studies, run with the universities and institutes we publish alongside. Emerging materials and methods are trialled on live work, written up, and taught back to our own teams and to our clients — including the attempts that failed.",
    image: {
      alt: "A researcher recording results beside a test rig",
      seed: "service-training",
    },
    capabilities: [
      "Applied engineering research",
      "Advanced structural studies",
      "Emerging materials and technologies",
      "Technical publications",
      "Professional training",
      "University and industry collaboration",
    ],
    relatedMarketSlugs: [
      "research-and-emerging-technologies",
      "climate-and-sustainability",
      "healthcare-and-science",
      "buildings",
    ],
  },
];

/** Dummy content. Replace with the Spring Boot `/api/digital-tools` response. */
export const digitalTools: DigitalTool[] = [
  {
    slug: "fuse",
    name: "Fuse",
    summary:
      "Geographic information and spatial analysis, configured per project team rather than per licence seat.",
    image: { alt: "A map interface with overlaid analysis layers", seed: "tool-fuse" },
  },
  {
    slug: "uheat",
    name: "UHeat",
    summary:
      "Satellite imagery and machine learning that identify the buildings and surfaces driving urban temperature rise.",
    image: { alt: "Thermal satellite imagery of a city", seed: "tool-uheat" },
  },
  {
    slug: "neuron",
    name: "Neuron",
    summary:
      "Building operations platform combining live sensor data with engineering models to cut energy use in occupied estates.",
    image: { alt: "A building management dashboard", seed: "tool-neuron" },
  },
  {
    slug: "weathershift",
    name: "WeatherShift",
    summary:
      "Forward-looking climate data in the standardised formats engineers and architects already design against.",
    image: { alt: "Weather data plotted over a city skyline", seed: "tool-weathershift" },
  },
];
