import type { DigitalTool, Service } from "../types/content";

/** Dummy content. Replace with the Spring Boot `/api/services` response. */
export const services: Service[] = [
  {
    slug: "structural-engineering",
    name: "Structural engineering",
    category: "Design and engineering",
    tagline: "Efficient structures with the least material we can justify",
    description:
      "Long-span roofs, tall buildings, bridges and the awkward retrofit of structures never designed for their current use. We size and detail structures to minimise embodied carbon, and we are explicit about the trade-offs when a client wants both a column-free span and a low-carbon frame.",
    image: { alt: "Exposed steel roof structure", seed: "service-structural" },
    deliverables: [
      "Concept and detailed structural design",
      "Embodied carbon options appraisal",
      "Existing structure capacity assessment",
      "Seismic and wind performance analysis",
    ],
    relatedMarketSlugs: ["property", "sport", "arts-and-culture", "transport"],
  },
  {
    slug: "building-services-engineering",
    name: "Building services engineering",
    category: "Design and engineering",
    tagline: "Mechanical, electrical and public health systems that run lean",
    description:
      "We design the systems that make a building habitable, then keep cutting their demand. Most of the value comes early — orientation, fabric and ventilation strategy set the ceiling on how efficient the finished building can be, long before plant selection matters.",
    image: { alt: "Plant room with pipework and ductwork", seed: "service-mep" },
    deliverables: [
      "MEP concept through to technical design",
      "Energy modelling and load forecasting",
      "Net zero operational carbon strategy",
      "Commissioning and performance verification",
    ],
    relatedMarketSlugs: ["property", "healthcare", "data-centres", "science"],
  },
  {
    slug: "sustainability-consulting",
    name: "Sustainability consulting",
    category: "Advisory",
    tagline: "Targets turned into decisions someone can actually make",
    description:
      "Carbon accounting, certification and transition planning, aimed at the point where a real choice gets made. We work with boards and project teams on what to build, what to keep and what to stop, and we report the numbers behind each option without rounding them in a flattering direction.",
    image: { alt: "Wind turbines behind a green field", seed: "service-sustainability" },
    deliverables: [
      "Whole-life carbon assessment",
      "Science-based target setting and roadmaps",
      "BREEAM, LEED and Green Star certification",
      "Climate risk and TCFD disclosure support",
    ],
    relatedMarketSlugs: ["property", "cities", "energy", "industry-and-manufacturing"],
  },
  {
    slug: "climate-resilience",
    name: "Climate and resilience",
    category: "Advisory",
    tagline: "Designing for the climate that is coming, not the one on record",
    description:
      "Historical return periods no longer describe the risk. We quantify exposure to heat, flood, drought and wind for assets and whole cities, then prioritise the interventions that buy the most resilience per pound — often nature-based, often cheaper than the engineered alternative.",
    image: { alt: "Flood defences protecting a coastal town", seed: "service-resilience" },
    deliverables: [
      "Physical climate risk assessment",
      "Urban heat and flood modelling",
      "Adaptation investment prioritisation",
      "Nature-based solutions design",
    ],
    relatedMarketSlugs: ["cities", "water", "international-development", "transport"],
  },
  {
    slug: "digital-consulting",
    name: "Digital consulting",
    category: "Digital",
    tagline: "Data and automation applied where it changes an outcome",
    description:
      "Digital twins, asset data strategy and the automation of design tasks that should never have been manual. The test we apply is whether an operator makes a different decision because of the tool — if not, it is a dashboard, not an asset.",
    image: { alt: "Abstract data visualisation on a dark screen", seed: "service-digital" },
    deliverables: [
      "Digital twin architecture and delivery",
      "Asset information and data strategy",
      "Computational design and automation",
      "Analytics platforms for operations",
    ],
    relatedMarketSlugs: ["data-centres", "water", "transport", "cities"],
  },
  {
    slug: "transport-planning",
    name: "Transport planning",
    category: "Planning",
    tagline: "Evidence for what to build, and what not to",
    description:
      "Demand forecasting, operational simulation and appraisal for schemes from a junction upgrade to a national rail programme. We model the network as it will be used rather than as designed, which regularly changes which option looks best.",
    image: { alt: "Pedestrians crossing a wide city street", seed: "service-transport-planning" },
    deliverables: [
      "Multi-modal demand forecasting",
      "Pedestrian and crowd movement simulation",
      "Business case and economic appraisal",
      "Active travel and street design",
    ],
    relatedMarketSlugs: ["transport", "cities", "sport"],
  },
  {
    slug: "masterplanning",
    name: "Masterplanning and urban design",
    category: "Planning",
    tagline: "Districts sequenced so the first phase still works alone",
    description:
      "We plan new districts and the renewal of existing ones, integrating land use, movement, utilities and open space. The discipline that matters most is phasing: each stage has to be viable on its own, because the later ones are never guaranteed.",
    image: { alt: "Aerial view of a planned waterfront district", seed: "service-masterplanning" },
    deliverables: [
      "Spatial frameworks and development plans",
      "Infrastructure capacity and phasing studies",
      "Public realm and landscape strategy",
      "Development viability appraisal",
    ],
    relatedMarketSlugs: ["cities", "property", "education", "international-development"],
  },
  {
    slug: "fire-engineering",
    name: "Fire and life safety",
    category: "Design and engineering",
    tagline: "Performance-based safety for buildings codes did not anticipate",
    description:
      "Atria, transport interchanges, tall timber and heritage buildings rarely fit prescriptive guidance. We build the evidence — evacuation modelling, smoke control analysis, structural fire performance — that lets an authority approve a design on its merits.",
    image: { alt: "An illuminated emergency exit stair", seed: "service-fire" },
    deliverables: [
      "Fire strategy and regulatory approval support",
      "Evacuation and smoke movement modelling",
      "Structural fire engineering",
      "Façade and material fire risk review",
    ],
    relatedMarketSlugs: ["property", "transport", "arts-and-culture", "healthcare"],
  },
  {
    slug: "acoustics",
    name: "Acoustics and audiovisual",
    category: "Design and engineering",
    tagline: "Rooms that sound the way the brief promised",
    description:
      "We tune concert halls and recording spaces, control noise in hospitals and schools, and design the audiovisual systems that increasingly carry the experience. Measurement comes first and last: a prediction that goes unverified on site is a guess.",
    image: { alt: "Acoustic panels lining an auditorium wall", seed: "service-acoustics" },
    deliverables: [
      "Room acoustic design and modelling",
      "Environmental noise assessment",
      "Vibration isolation design",
      "Audiovisual and performance systems",
    ],
    relatedMarketSlugs: ["arts-and-culture", "education", "healthcare", "transport"],
  },
  {
    slug: "programme-management",
    name: "Programme and project management",
    category: "Advisory",
    tagline: "Large programmes kept honest about cost and schedule",
    description:
      "Capital programmes fail on interfaces and governance far more often than on engineering. We set up and run programme controls, assurance and commercial management so problems surface while they are still cheap to fix.",
    image: { alt: "A construction site viewed from a tower crane", seed: "service-programme" },
    deliverables: [
      "Programme setup and governance design",
      "Cost, schedule and risk controls",
      "Independent assurance and gateway reviews",
      "Commercial and contract strategy",
    ],
    relatedMarketSlugs: ["transport", "energy", "healthcare", "international-development"],
  },
  {
    slug: "geotechnics",
    name: "Geotechnics and tunnelling",
    category: "Design and engineering",
    tagline: "Ground risk understood before it becomes a variation",
    description:
      "Foundations, deep excavations, tunnels and slope stability. Ground is the least knowable part of most projects, so we invest in investigation and observational design rather than padding every assumption and paying for it in concrete.",
    image: { alt: "A tunnel boring machine cutting head", seed: "service-geotechnics" },
    deliverables: [
      "Ground investigation strategy and interpretation",
      "Foundation and retaining wall design",
      "Tunnel design and settlement assessment",
      "Slope stability and earthworks",
    ],
    relatedMarketSlugs: ["transport", "resources", "water", "property"],
  },
  {
    slug: "advisory-economics",
    name: "Economics and advisory",
    category: "Advisory",
    tagline: "Business cases that survive contact with a treasury",
    description:
      "Appraisal, funding strategy and market analysis for infrastructure investment. We quantify wider economic and social value alongside the financial case, and we are clear about which benefits are robust and which depend on assumptions a client may not want to own.",
    image: { alt: "A financial district street at street level", seed: "service-economics" },
    deliverables: [
      "Cost-benefit and economic appraisal",
      "Funding and financing strategy",
      "Market demand and commercial analysis",
      "Social value and wellbeing valuation",
    ],
    relatedMarketSlugs: ["cities", "transport", "energy", "international-development"],
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
