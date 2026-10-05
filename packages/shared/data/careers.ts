import type { CareersContent } from "../types/content";

/** Dummy content. Replace with the Spring Boot `/api/careers` response. */
export const careersContent: CareersContent = {
  intro:
    "Every day, a new challenge. Every day, a chance to make a difference. We are looking for people who want to work on the built environment's harder problems, in a firm that is owned by the people who do the work.",

  stats: [
    { value: "18,000", unit: "+", label: "Colleagues to learn from" },
    { value: "34", label: "Countries you could work in" },
    { value: "90", unit: "%", label: "Of people work flexibly" },
    { value: "1,200", unit: "+", label: "Early careers roles each year" },
  ],

  openings: [
    {
      id: "job-1001",
      title: "Senior Structural Engineer — Tall Buildings",
      discipline: "Structural engineering",
      location: "London, United Kingdom",
      employmentType: "Full time",
      level: "Senior",
      postedAt: "2026-09-12",
    },
    {
      id: "job-1002",
      title: "Graduate Building Services Engineer",
      discipline: "Building services",
      location: "Manchester, United Kingdom",
      employmentType: "Full time",
      level: "Graduate",
      postedAt: "2026-09-10",
    },
    {
      id: "job-1003",
      title: "Data Centre Cooling Specialist",
      discipline: "Building services",
      location: "Dublin, Ireland",
      employmentType: "Full time",
      level: "Experienced",
      postedAt: "2026-09-08",
    },
    {
      id: "job-1004",
      title: "Climate Resilience Consultant",
      discipline: "Advisory",
      location: "Singapore",
      employmentType: "Full time",
      level: "Experienced",
      postedAt: "2026-09-05",
    },
    {
      id: "job-1005",
      title: "Computational Designer",
      discipline: "Digital",
      location: "Amsterdam, Netherlands",
      employmentType: "Full time",
      level: "Experienced",
      postedAt: "2026-09-02",
    },
    {
      id: "job-1006",
      title: "Principal Acoustics Consultant",
      discipline: "Acoustics",
      location: "Melbourne, Australia",
      employmentType: "Full time",
      level: "Leadership",
      postedAt: "2026-08-29",
    },
    {
      id: "job-1007",
      title: "Geotechnical Engineer — Tunnelling",
      discipline: "Geotechnics",
      location: "Toronto, Canada",
      employmentType: "Full time",
      level: "Experienced",
      postedAt: "2026-08-26",
    },
    {
      id: "job-1008",
      title: "Transport Planner",
      discipline: "Transport planning",
      location: "Madrid, Spain",
      employmentType: "Part time",
      level: "Experienced",
      postedAt: "2026-08-22",
    },
    {
      id: "job-1009",
      title: "Apprentice Civil Engineering Technician",
      discipline: "Civil engineering",
      location: "Cardiff, United Kingdom",
      employmentType: "Full time",
      level: "Graduate",
      postedAt: "2026-08-19",
    },
    {
      id: "job-1010",
      title: "Programme Controls Lead — Rail",
      discipline: "Programme management",
      location: "New York, United States",
      employmentType: "Full time",
      level: "Leadership",
      postedAt: "2026-08-15",
    },
    {
      id: "job-1011",
      title: "Sustainability Analyst — Whole Life Carbon",
      discipline: "Advisory",
      location: "Berlin, Germany",
      employmentType: "Full time",
      level: "Graduate",
      postedAt: "2026-08-11",
    },
    {
      id: "job-1012",
      title: "Fire Engineer",
      discipline: "Fire engineering",
      location: "Hong Kong SAR",
      employmentType: "Contract",
      level: "Experienced",
      postedAt: "2026-08-07",
    },
  ],

  benefits: [
    {
      title: "Profit share, not a bonus scheme",
      description:
        "Because the firm is owned in trust, a share of profit is distributed to everyone on the same percentage basis. No discretionary pool, no negotiation.",
    },
    {
      title: "Flexible and hybrid working",
      description:
        "Where and when you work is agreed within your team rather than set centrally. Around ninety per cent of colleagues use some form of flexible arrangement.",
    },
    {
      title: "Move between disciplines",
      description:
        "Internal mobility between disciplines and countries is normal. Several of our specialist leaders started somewhere unrelated to where they ended up.",
    },
    {
      title: "Funded professional development",
      description:
        "Chartership support, conference attendance and formal study are funded, with time allocated rather than expected on top of project work.",
    },
    {
      title: "Parental leave and return support",
      description:
        "Enhanced leave for all parents, with a phased return and protected project allocation so coming back does not mean starting over.",
    },
    {
      title: "Time for research",
      description:
        "A fixed share of profit funds internal research. If you have a question worth answering, there is a route to being paid to answer it.",
    },
  ],

  applicationProcess: [
    {
      step: 1,
      title: "Apply online",
      description:
        "A CV and a short answer on why the role interests you. No cover letter, and no essay questions that a template could answer.",
    },
    {
      step: 2,
      title: "Introductory conversation",
      description:
        "A 30-minute call with someone from the team you would join, covering the work itself and what you are looking for.",
    },
    {
      step: 3,
      title: "Technical discussion",
      description:
        "A conversation about a real problem in the discipline, not a test with a right answer. We are interested in how you reason when the brief is incomplete.",
    },
    {
      step: 4,
      title: "Meet the team",
      description:
        "Time with the wider team, including people you would work alongside rather than only those who would manage you.",
    },
    {
      step: 5,
      title: "Offer and onboarding",
      description:
        "A written offer with the salary band stated, followed by an onboarding plan that puts you on live project work within the first month.",
    },
  ],

  profiles: [
    {
      id: "profile-1",
      name: "Chandan Joshi",
      role: "Structural Engineer",
      location: "Mumbai, India",
      quote:
        "I like the stage where a problem still looks unsolvable. The satisfaction is in getting to a resolution you can actually defend to someone who will build it.",
      image: { alt: "Portrait of a structural engineer", seed: "profile-joshi" },
    },
    {
      id: "profile-2",
      name: "Martin Swaffield",
      role: "Management Consulting Lead",
      location: "Auckland, New Zealand",
      quote:
        "I am based in Auckland and work across Australia, Singapore, Malaysia and New Zealand. The borderless approach is real — my team is not defined by which office I sit in.",
      image: { alt: "Portrait of a management consulting lead", seed: "profile-swaffield" },
    },
    {
      id: "profile-3",
      name: "Brittany Moffett",
      role: "Resilience Engineer",
      location: "New York, United States",
      quote:
        "I started in façade engineering. Nobody blocked the move into resilience — it was treated as a sensible thing to want, which surprised me at the time.",
      image: { alt: "Portrait of a resilience engineer", seed: "profile-moffett" },
    },
    {
      id: "profile-4",
      name: "Tim Whitley",
      role: "Building Services Engineer",
      location: "Bristol, United Kingdom",
      quote:
        "The interesting part is combining expertise that sits in four different teams to get a genuinely zero carbon design, rather than four good answers that do not add up.",
      image: { alt: "Portrait of a building services engineer", seed: "profile-whitley" },
    },
    {
      id: "profile-5",
      name: "Antoinette Magadi",
      role: "Process Engineer",
      location: "Nairobi, Kenya",
      quote:
        "Coming back from maternity leave, flexible working was the difference between managing and not. My project allocation was held for me, which mattered more than the policy.",
      image: { alt: "Portrait of a process engineer", seed: "profile-magadi" },
    },
  ],
};
