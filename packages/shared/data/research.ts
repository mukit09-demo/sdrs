import type { ResearchContent } from "../types/content";

/** Dummy content. Replace with the Spring Boot `/api/pages/research` response. */
export const researchContent: ResearchContent = {
  // Blank lines are paragraph breaks: the hero sets each one as its own block
  // of copy rather than running all four together.
  intro: `At SDRS, research and learning are part of how we build the future.

We empower young engineers, researchers and emerging professionals through practical training, mentorship and opportunities to investigate real-world challenges. We believe their curiosity, energy and fresh thinking can become a powerful force for innovation.

Our research extends across engineering, science and mathematics, while exploring interdisciplinary areas such as sustainable materials, healthier food and products, environmental responsibility and emerging technologies.

We aim to turn knowledge into solutions and learning into impact — contributing to a safer, healthier and more sustainable world for us and for generations to come.`,

  stats: [
    { value: "3.5", unit: "%", label: "Of profit committed to research each year" },
    { value: "24", label: "Programmes currently funded" },
    { value: "1,900", unit: "+", label: "Places on our courses last year" },
    { value: "37", label: "Papers published in the last three years" },
  ],

  programmes: [
    {
      slug: "low-carbon-concrete-mixes",
      title: "Low-carbon concrete for structural frames",
      theme: "Materials",
      status: "Field trial",
      summary:
        "Cement replacement rates above 60 per cent are achievable on paper and rarely accepted on site. We are building the test evidence that lets a specifier sign one off.",
      startedYear: 2023,
      lead: { name: "Dr Farhana Kabir", role: "Principal Materials Engineer" },
      partners: [
        "Bangladesh University of Engineering and Technology",
        "Imperial College London",
        "Two contractors, unnamed until publication",
      ],
      outputs: [
        "412 cube tests across nine mix designs",
        "A specification clause adopted on three live projects",
        "Open dataset of 28- and 56-day strength results",
      ],
      image: { alt: "Concrete cube samples in a materials laboratory", seed: "research-concrete" },
    },
    {
      slug: "flood-resilient-housing",
      title: "Flood-resilient housing for delta settlements",
      theme: "Resilience",
      status: "Active",
      summary:
        "What a household can afford and what a flood model recommends are usually different buildings. This programme looks for the overlap, at plot scale rather than city scale.",
      startedYear: 2024,
      lead: { name: "Tanvir Hossain", role: "Resilience Lead" },
      partners: ["Delta Coalition", "Three municipal authorities"],
      outputs: [
        "Field survey of 620 households after two monsoon seasons",
        "A costed plinth-and-frame detail set, published free to use",
      ],
      image: { alt: "Raised housing above a flood plain", seed: "research-flood" },
    },
    {
      slug: "operational-carbon-in-use",
      title: "The gap between designed and measured energy use",
      theme: "Climate and carbon",
      status: "Published",
      summary:
        "We metered 48 buildings we designed ourselves. On average they used 34 per cent more energy than the model predicted, and we can now say which assumptions caused it.",
      startedYear: 2021,
      lead: { name: "Dr Meera Raghunathan", role: "Head of Building Performance" },
      partners: ["Chartered Institution of Building Services Engineers"],
      outputs: [
        "Peer-reviewed paper in Building Research and Information",
        "Revised internal modelling guidance, now mandatory on our projects",
        "Anonymised metering dataset for all 48 buildings",
      ],
      image: { alt: "Energy metering dashboard in a plant room", seed: "research-energy" },
    },
    {
      slug: "bamboo-as-a-structural-material",
      title: "Engineered bamboo as a structural material",
      theme: "Materials",
      status: "Active",
      summary:
        "Bamboo has been built with for centuries and codified almost nowhere. We are producing the characteristic values a structural engineer needs to use it without a waiver.",
      startedYear: 2025,
      lead: { name: "Rezwana Alam", role: "Senior Structural Engineer" },
      partners: ["Asian Institute of Technology", "INBAR"],
      outputs: ["Bending and shear test programme, 180 specimens completed"],
      image: { alt: "Engineered bamboo beam under load test", seed: "research-bamboo" },
    },
    {
      slug: "heat-in-informal-settlements",
      title: "Cooling informal settlements without air conditioning",
      theme: "Climate and carbon",
      status: "Field trial",
      summary:
        "Indoor temperatures in corrugated-roof housing regularly pass 40°C. We are measuring which of the cheap interventions — coatings, ventilation, shading — actually move the number.",
      startedYear: 2024,
      lead: { name: "Dr Sadia Chowdhury", role: "Environmental Design Lead" },
      partners: ["Two community organisations", "University of Melbourne"],
      outputs: [
        "Continuous monitoring in 90 dwellings across two hot seasons",
        "Interim finding: roof coatings alone under-perform their marketing by half",
      ],
      image: { alt: "Corrugated roofs of a dense settlement at midday", seed: "research-heat" },
    },
    {
      slug: "pedestrian-first-street-design",
      title: "Pedestrian-first street design in dense cities",
      theme: "Mobility",
      status: "Active",
      summary:
        "Street capacity is still measured in vehicles. We are testing whether counting people instead changes which schemes get funded — using observed counts, not modelled ones.",
      startedYear: 2023,
      lead: { name: "Imran Siddique", role: "Transport Planning Lead" },
      partners: ["Institute for Transportation and Development Policy"],
      outputs: [
        "Observed counts at 46 junctions across four cities",
        "An open scoring method for comparing street schemes",
      ],
      image: { alt: "Busy pedestrian crossing seen from above", seed: "research-streets" },
    },
    {
      slug: "digital-twins-for-asset-maintenance",
      title: "What a digital twin is actually worth in maintenance",
      theme: "Digital and data",
      status: "Published",
      summary:
        "Twins are sold on avoided downtime. We tracked six instrumented assets for three years to find out where the savings were real and where the sensors were the expense.",
      startedYear: 2022,
      lead: { name: "Nusrat Jahan", role: "Digital Engineering Lead" },
      partners: ["Two utility clients"],
      outputs: [
        "Paper at the European Conference on Product and Process Modelling",
        "A decision tool for deciding whether to instrument an asset at all",
      ],
      image: { alt: "Sensor data overlaid on a plant model", seed: "research-twin" },
    },
    {
      slug: "reuse-of-structural-steel",
      title: "Reclaiming structural steel for reuse",
      theme: "Materials",
      status: "Field trial",
      summary:
        "Reusing a steel section is cheaper in carbon than recycling it and harder in paperwork. The blocker is testing and traceability, so that is what this programme is building.",
      startedYear: 2024,
      lead: { name: "Dr Farhana Kabir", role: "Principal Materials Engineer" },
      partners: ["Steel Construction Institute", "One demolition contractor"],
      outputs: [
        "A reclaimed-steel testing protocol, trialled on two demolitions",
        "First reuse of 41 tonnes of reclaimed sections on a live SDRS project",
      ],
      image: { alt: "Reclaimed steel sections stacked in a yard", seed: "research-steel" },
    },
  ],

  courses: [
    {
      slug: "whole-life-carbon-assessment",
      title: "Whole life carbon assessment",
      discipline: "Sustainability",
      format: "Hybrid",
      level: "Intermediate",
      duration: "3 days",
      summary:
        "Build a whole life carbon assessment from a real project's drawings and quantities, then defend the assumptions behind it.",
      outcomes: [
        "Set a study boundary you can justify to a verifier",
        "Work from quantities rather than benchmarks where the data allows",
        "Report results so that a client can act on them",
      ],
      nextStartsAt: "2026-10-19",
      image: { alt: "Carbon assessment spreadsheet beside a set of drawings", seed: "course-carbon" },
    },
    {
      slug: "structural-design-for-reuse",
      title: "Structural design for disassembly and reuse",
      discipline: "Structural engineering",
      format: "In person",
      level: "Advanced",
      duration: "2 days",
      summary:
        "Design a frame that can be taken apart. Covers connection choice, tolerance, and the record-keeping that makes a second life possible.",
      outcomes: [
        "Choose connections that survive being undone",
        "Specify the material passport a future engineer will need",
        "Price the premium honestly against the carbon saved",
      ],
      nextStartsAt: "2026-11-09",
      image: { alt: "Bolted steel connection detail", seed: "course-reuse" },
    },
    {
      slug: "flood-risk-fundamentals",
      title: "Flood risk fundamentals",
      discipline: "Water and resilience",
      format: "Online",
      level: "Introductory",
      duration: "6 weeks, part time",
      summary:
        "How flood risk is assessed, what the maps do and do not tell you, and which design responses are proportionate at each level of risk.",
      outcomes: [
        "Read a flood map without over-reading it",
        "Distinguish fluvial, pluvial and coastal mechanisms in a brief",
        "Select a resilience strategy suited to the return period",
      ],
      nextStartsAt: "2026-10-05",
      image: { alt: "Flood mapping on a river catchment", seed: "course-flood" },
    },
    {
      slug: "computational-design-with-python",
      title: "Computational design with Python",
      discipline: "Digital",
      format: "Online",
      level: "Introductory",
      duration: "8 weeks, part time",
      summary:
        "For engineers with no programming background. Automate the parts of your own workflow that are currently done by hand in a spreadsheet.",
      outcomes: [
        "Read and modify an existing analysis script",
        "Automate a repetitive checking task end to end",
        "Know when a script is the wrong answer",
      ],
      nextStartsAt: "2026-10-12",
      image: { alt: "Parametric geometry generated from code", seed: "course-python" },
    },
    {
      slug: "passive-cooling-in-hot-humid-climates",
      title: "Passive cooling in hot and humid climates",
      discipline: "Environmental design",
      format: "Hybrid",
      level: "Intermediate",
      duration: "4 days",
      summary:
        "Orientation, mass, shading and air movement, tested against measured data from our own monitoring programmes rather than textbook cases.",
      outcomes: [
        "Sequence passive measures before reaching for plant",
        "Model comfort in humidity, not just dry-bulb temperature",
        "Explain the limits of passive design to a client",
      ],
      nextStartsAt: "2026-11-23",
      image: { alt: "Shaded courtyard with cross ventilation", seed: "course-cooling" },
    },
    {
      slug: "leading-multidisciplinary-teams",
      title: "Leading multidisciplinary design teams",
      discipline: "Leadership",
      format: "In person",
      level: "Advanced",
      duration: "2 days",
      summary:
        "Running a team where you are not the expert in most of the room. Written for engineers moving into project leadership.",
      outcomes: [
        "Chair a design review that surfaces disagreement early",
        "Sequence decisions so late changes stay affordable",
        "Give technical feedback across a discipline you do not practise",
      ],
      nextStartsAt: "2026-12-07",
      image: { alt: "Design team around a table of drawings", seed: "course-leadership" },
    },
    {
      slug: "geotechnical-site-investigation",
      title: "Reading a site investigation report",
      discipline: "Geotechnics",
      format: "Online",
      level: "Introductory",
      duration: "2 weeks, part time",
      summary:
        "What a ground investigation actually establishes, how to spot the gaps in one, and what to ask for before you design a foundation on it.",
      outcomes: [
        "Interpret borehole logs and in-situ test results",
        "Identify the ground risk a report has left open",
        "Scope a supplementary investigation proportionately",
      ],
      nextStartsAt: "2026-10-26",
      image: { alt: "Borehole log and soil samples", seed: "course-geotech" },
    },
    {
      slug: "post-occupancy-evaluation",
      title: "Post-occupancy evaluation in practice",
      discipline: "Building performance",
      format: "Hybrid",
      level: "Intermediate",
      duration: "3 days",
      summary:
        "How to go back to a finished building and find out what it really does — metering, surveys, and telling a client something they did not want to hear.",
      outcomes: [
        "Design a metering strategy before handover, not after",
        "Run occupant surveys that produce usable data",
        "Close the loop into the next project's brief",
      ],
      nextStartsAt: "2027-01-18",
      image: { alt: "Engineer taking readings in an occupied building", seed: "course-poe" },
    },
  ],

  researchProcess: [
    {
      step: 1,
      title: "A question from a project",
      description:
        "Almost every programme starts as something a project team could not answer with the available evidence. Anyone in the firm can submit one.",
    },
    {
      step: 2,
      title: "Scoping and review",
      description:
        "A panel of practising engineers tests whether the question is answerable, whether someone has already answered it, and what it would cost to find out.",
    },
    {
      step: 3,
      title: "Funding and a partner",
      description:
        "Funded from the research share of profit, usually alongside a university or institute so the method gets scrutinised by people outside the firm.",
    },
    {
      step: 4,
      title: "Testing in the open",
      description:
        "Work happens on live projects wherever a client agrees to it. Negative results are written up too — they are the ones that save other people money.",
    },
    {
      step: 5,
      title: "Publish, then teach",
      description:
        "Findings are published, the underlying data goes out with them, and whatever is practical becomes a course or a change to our internal guidance.",
    },
  ],

  publications: [
    {
      title:
        "Measured versus predicted energy use in 48 non-domestic buildings",
      venue: "Building Research and Information",
      year: 2026,
      href: "/news",
    },
    {
      title: "Characteristic values for engineered bamboo in bending",
      venue: "Construction and Building Materials",
      year: 2026,
      href: "/news",
    },
    {
      title:
        "A testing protocol for reclaimed structural steel sections",
      venue: "Steel Construction Institute technical paper",
      year: 2025,
      href: "/news",
    },
    {
      title: "Indoor temperatures in corrugated-roof housing: two seasons of data",
      venue: "Energy and Buildings",
      year: 2025,
      href: "/news",
    },
    {
      title: "Where digital twins pay for themselves in asset maintenance",
      venue: "European Conference on Product and Process Modelling",
      year: 2024,
      href: "/news",
    },
    {
      title: "Counting people, not vehicles: a scoring method for street schemes",
      venue: "Transport Research Procedia",
      year: 2024,
      href: "/news",
    },
  ],

  partners: [
    "Bangladesh University of Engineering and Technology",
    "Imperial College London",
    "Asian Institute of Technology",
    "University of Melbourne",
    "Steel Construction Institute",
    "Chartered Institution of Building Services Engineers",
    "INBAR",
    "Institute for Transportation and Development Policy",
  ],

  directorQuote: {
    quote:
      "A research programme that only ever confirms what we already sell is not research. The ones worth funding are the ones that could embarrass us, and a few of them have.",
    attribution: "Dr Meera Raghunathan",
    detail: "Director of Research and Training",
  },
};
