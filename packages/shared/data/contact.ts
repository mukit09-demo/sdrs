import type { ContactContent } from "../types/content";

/** Dummy content. Replace with the Spring Boot `/api/contact` response. */
export const contactContent: ContactContent = {
  intro:
    "Tell us what you are trying to do and we will point you at the people who have done it before. For project enquiries, the more specific you can be about the constraint you are up against, the more useful our first reply will be.",

  offices: [
    {
      id: "office-london",
      city: "London",
      country: "United Kingdom",
      region: "Europe",
      addressLines: ["8 Fitzroy Street", "London W1T 4BJ"],
      phone: "+44 20 7636 1531",
      email: "london@example-sdrs.com",
      isHeadquarters: true,
    },
    {
      id: "office-new-york",
      city: "New York",
      country: "United States",
      region: "Americas",
      addressLines: ["77 Water Street, 30th Floor", "New York, NY 10005"],
      phone: "+1 212 896 3000",
      email: "newyork@example-sdrs.com",
      isHeadquarters: true,
    },
    {
      id: "office-hong-kong",
      city: "Hong Kong",
      country: "Hong Kong SAR",
      region: "East Asia",
      addressLines: ["Level 5, Festival Walk", "80 Tat Chee Avenue, Kowloon Tong"],
      phone: "+852 2528 3031",
      email: "hongkong@example-sdrs.com",
      isHeadquarters: true,
    },
    {
      id: "office-sydney",
      city: "Sydney",
      country: "Australia",
      region: "Australasia",
      addressLines: ["Barrack Place, Level 5", "151 Clarence Street, NSW 2000"],
      phone: "+61 2 9320 9320",
      email: "sydney@example-sdrs.com",
      isHeadquarters: true,
    },
    {
      id: "office-dubai",
      city: "Dubai",
      country: "United Arab Emirates",
      region: "Middle East and Africa",
      addressLines: ["Emaar Square, Building 1, Level 5", "Downtown Dubai"],
      phone: "+971 4 305 6600",
      email: "dubai@example-sdrs.com",
      isHeadquarters: true,
    },
    {
      id: "office-amsterdam",
      city: "Amsterdam",
      country: "Netherlands",
      region: "Europe",
      addressLines: ["Naritaweg 118", "1043 CA Amsterdam"],
      phone: "+31 20 305 8500",
      email: "amsterdam@example-sdrs.com",
    },
    {
      id: "office-berlin",
      city: "Berlin",
      country: "Germany",
      region: "Europe",
      addressLines: ["Joachimsthaler Straße 41", "10623 Berlin"],
      phone: "+49 30 885 9130",
      email: "berlin@example-sdrs.com",
    },
    {
      id: "office-madrid",
      city: "Madrid",
      country: "Spain",
      region: "Europe",
      addressLines: ["Calle Alcalá 54", "28014 Madrid"],
      phone: "+34 91 523 9276",
      email: "madrid@example-sdrs.com",
    },
    {
      id: "office-singapore",
      city: "Singapore",
      country: "Singapore",
      region: "East Asia",
      addressLines: ["182 Cecil Street, Level 20", "Frasers Tower, 069547"],
      phone: "+65 6411 2500",
      email: "singapore@example-sdrs.com",
    },
    {
      id: "office-toronto",
      city: "Toronto",
      country: "Canada",
      region: "Americas",
      addressLines: ["121 Bloor Street East, Suite 900", "Toronto, ON M4W 3M5"],
      phone: "+1 416 515 0915",
      email: "toronto@example-sdrs.com",
    },
    {
      id: "office-sao-paulo",
      city: "São Paulo",
      country: "Brazil",
      region: "Americas",
      addressLines: ["Avenida Paulista 1842", "Bela Vista, 01310-200"],
      phone: "+55 11 3078 4444",
      email: "saopaulo@example-sdrs.com",
    },
    {
      id: "office-nairobi",
      city: "Nairobi",
      country: "Kenya",
      region: "Middle East and Africa",
      addressLines: ["The Address, Muthangari Drive", "Westlands, Nairobi"],
      phone: "+254 20 271 0000",
      email: "nairobi@example-sdrs.com",
    },
    {
      id: "office-melbourne",
      city: "Melbourne",
      country: "Australia",
      region: "Australasia",
      addressLines: ["Level 17, 1 Nicholson Street", "East Melbourne, VIC 3002"],
      phone: "+61 3 9668 5500",
      email: "melbourne@example-sdrs.com",
    },
    {
      id: "office-auckland",
      city: "Auckland",
      country: "New Zealand",
      region: "Australasia",
      addressLines: ["Level 8, 44 Khyber Pass Road", "Grafton, Auckland 1023"],
      phone: "+64 9 359 9200",
      email: "auckland@example-sdrs.com",
    },
  ],

  enquiryTopics: [
    { value: "project", label: "A project or commission" },
    { value: "careers", label: "Careers and recruitment" },
    { value: "media", label: "Media and press" },
    { value: "supplier", label: "Supplier or partnership" },
    { value: "other", label: "Something else" },
  ],

  faqs: [
    {
      question: "How quickly will I hear back?",
      answer:
        "Project enquiries are routed to the relevant market team and answered within two working days. Media enquiries are handled same-day where the deadline allows — say so in your message if it is tight.",
    },
    {
      question: "I am applying for a job. Should I use this form?",
      answer:
        "No. Applications go through the careers site so that they reach the hiring team and are tracked properly. This form will only slow you down.",
    },
    {
      question: "Do you take on small projects?",
      answer:
        "Yes, regularly — including short advisory pieces and single-discipline reviews. Scale matters much less to us than whether the problem is one we can add something to.",
    },
    {
      question: "Can you work outside the countries you have offices in?",
      answer:
        "Yes. We work in far more countries than we have permanent offices in, usually with a local partner for delivery. Tell us where and we will be straight with you about what we can and cannot cover.",
    },
    {
      question: "How do I raise a concern about conduct?",
      answer:
        "Use the Speak Up route rather than this form. It is available to anyone, including people outside the firm, and reports can be made confidentially.",
    },
  ],
};
