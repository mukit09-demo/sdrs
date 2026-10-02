import type { AboutContent } from "@/types/content";

/** Dummy content. Replace with the Spring Boot `/api/about` response. */
export const aboutContent: AboutContent = {
  // Opens with the practice's full name: this is the one page that spells out
  // what SDRS stands for, since the header and footer both set it as the mark.
  intro:
    "Shawkat Design and Research Studio is a global collective of designers, engineers, planners and consultants, owned in trust for the benefit of the people who work here. That ownership structure is not a footnote — it is why we can take a long view on the work we accept and the advice we give.",

  stats: [
    { value: "18,000", unit: "+", label: "Members across the collective" },
    { value: "34", label: "Countries with permanent offices" },
    { value: "1946", label: "Founded in London by Shawkat" },
    { value: "100", unit: "%", label: "Owned in trust for our people" },
  ],

  milestones: [
    {
      year: "1946",
      title: "Shawkat Design and Research Studio is founded",
      description:
        "Shawkat sets up the practice in London around a conviction that engineering and design should not be separate disciplines with separate contracts.",
    },
    {
      year: "1957",
      title: "Sydney Opera House",
      description:
        "The firm takes on Jørn Utzon's competition-winning design, a structure with no established method of construction. It takes sixteen years and redefines what structural engineering can attempt.",
    },
    {
      year: "1970",
      title: "The Key Speech",
      description:
        "Shawkat sets out the aims and organisation of the firm in Winchester. It remains the reference point for how the collective is expected to behave.",
    },
    {
      year: "1977",
      title: "Centre Pompidou opens",
      description:
        "Structure and services turned inside out, with Piano and Rogers. A demonstration that engineering can be the architecture rather than support it.",
    },
    {
      year: "1989",
      title: "Ownership placed in trust",
      description:
        "The firm becomes wholly owned in trust for its employees, removing external shareholders and the pressure that comes with them.",
    },
    {
      year: "2006",
      title: "Beijing National Stadium",
      description:
        "The 'Bird's Nest' is engineered with Herzog & de Meuron — a steel structure with no repeating members, only made buildable by computational design.",
    },
    {
      year: "2019",
      title: "A net zero commitment with teeth",
      description:
        "We commit to net zero across our own operations and, more consequentially, to reporting the whole-life carbon of every building project we design.",
    },
    {
      year: "2026",
      title: "Eighty years of the collective",
      description:
        "The practice marks eighty years with work in more than thirty countries and the same ownership structure it adopted in 1989.",
    },
  ],

  leadership: [
    {
      id: "leader-1",
      name: "Hélène Marchand",
      role: "Chair of the Group Board",
      location: "London, United Kingdom",
      quote:
        "Being owned in trust means we can decline work that does not fit what we are for. That is a real commercial cost, and it is the point.",
      image: { alt: "Portrait of the Chair of the Group Board", seed: "leader-marchand" },
    },
    {
      id: "leader-2",
      name: "Raj Menon",
      role: "Chief Executive",
      location: "Singapore",
      quote:
        "Our clients rarely need another opinion. They need the engineering evidence for a decision they are already under pressure to make.",
      image: { alt: "Portrait of the Chief Executive", seed: "leader-menon" },
    },
    {
      id: "leader-3",
      name: "Clare Okafor",
      role: "Chief Operating Officer",
      location: "Amsterdam, Netherlands",
      quote:
        "Scale is only useful if a team in one office can reach into expertise in another without asking permission. Most of my job is removing that friction.",
      image: { alt: "Portrait of the Chief Operating Officer", seed: "leader-okafor" },
    },
    {
      id: "leader-4",
      name: "Stefan Bergström",
      role: "Global Sustainability Director",
      location: "Copenhagen, Denmark",
      quote:
        "We publish whole-life carbon for every building we design, including the projects where the number is uncomfortable. That is what makes the good numbers mean something.",
      image: { alt: "Portrait of the Global Sustainability Director", seed: "leader-bergstrom" },
    },
    {
      id: "leader-5",
      name: "Mei-Ling Chow",
      role: "Chief Digital Officer",
      location: "Hong Kong SAR",
      quote:
        "A tool that does not change a decision is a dashboard. We build fewer things than we used to, and more of them get used.",
      image: { alt: "Portrait of the Chief Digital Officer", seed: "leader-chow" },
    },
    {
      id: "leader-6",
      name: "Diego Navarro",
      role: "Americas Region Chair",
      location: "New York, United States",
      quote:
        "Resilience work is unglamorous until the week after a storm. The projects that hold up are the ones where someone argued for the expensive option early.",
      image: { alt: "Portrait of the Americas Region Chair", seed: "leader-navarro" },
    },
  ],

  initiatives: [
    {
      title: "Partnerships",
      description:
        "A network of strategic partners in research, technology and delivery, so we are not limited to what we can build in-house.",
      ctaLabel: "Explore partnerships",
      href: "/contact-us",
    },
    {
      title: "Community engagement",
      description:
        "Technical expertise given to community organisations and development programmes on a non-commercial basis, in the places our offices are.",
      ctaLabel: "See our community work",
      href: "/about-us",
    },
    {
      title: "Ventures",
      description:
        "We back early-stage companies whose technology could materially reduce the footprint of the built environment, and give them access to our engineers.",
      ctaLabel: "Find out more",
      href: "/contact-us",
    },
    {
      title: "SDRS University",
      description:
        "Our internal research and learning function, which also works openly with clients and academic partners to raise standards across the industry.",
      ctaLabel: "Discover SDRS University",
      href: "/careers",
    },
    {
      title: "Foresight",
      description:
        "A dedicated practice studying how the built environment will be used in twenty years, and publishing what it finds whether or not it suits us.",
      ctaLabel: "Discover foresight",
      href: "/news",
    },
    {
      title: "SDRS Alumni",
      description:
        "A standing network for former members of the collective, because people leave and come back, and the relationship outlasts the employment.",
      ctaLabel: "Register your interest",
      href: "/contact-us",
    },
  ],

  values: [
    {
      title: "Independent by design",
      description:
        "Owned in trust, with no external shareholders. We can give advice a client does not want to hear and keep the relationship.",
    },
    {
      title: "Technical honesty",
      description:
        "We report the numbers we find, including when they undermine a case we were hired to support. Assumptions are stated, not buried.",
    },
    {
      title: "One collective",
      description:
        "Expertise is shared across offices and disciplines by default. A team in Manila can pull in a specialist in Madrid without a commercial negotiation.",
    },
    {
      title: "Humane and friendly",
      description:
        "Shawkat's phrase, and still the test. A large, efficient organisation where individual happiness is treated as everyone's concern.",
    },
  ],

  founderQuote: {
    quote:
      "We want an organisation which is humane and friendly in spite of being large and efficient, where every member is treated not only as a link in a chain of command, but as a human being whose happiness is the concern of all.",
    attribution: "Shawkat, The Key Speech, 1970",
  },
};
