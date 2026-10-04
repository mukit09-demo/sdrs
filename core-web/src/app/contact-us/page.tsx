import type { Metadata } from "next";
import { EnquiryForm } from "@/components/sections/EnquiryForm";
import { OfficeDirectory } from "@/components/sections/OfficeDirectory";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Accordion } from "@/components/ui/Accordion";
import { routes } from "@/lib/config/routes";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Send an enquiry to SDRS, or find contact details for our offices across Europe, the Americas, Asia, Australasia, the Middle East and Africa.",
};

export default async function ContactPage() {
  const contact = await content.getContactContent();

  return (
    <>
      <PageHero
        title="Contact us"
        eyebrow="Get in touch"
        intro={contact.intro}
        crumbs={[{ label: "Home", href: routes.home }, { label: "Contact us" }]}
      />

      <Section id="enquiry">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeader
              eyebrow="Enquiries"
              title="Send us a message"
              description="Give us as much context as you can — the more specific the question, the more useful our first reply will be."
            />
            <div className="mt-10">
              <EnquiryForm topics={contact.enquiryTopics} />
            </div>
          </div>

          <aside className="border-t-2 border-ink-900 pt-8 lg:border-t-0 lg:border-l lg:border-ink-200 lg:pt-0 lg:pl-12">
            <h2 className="text-xs font-medium tracking-widest text-ink-500 uppercase">
              Common questions
            </h2>
            <Accordion
              className="mt-6"
              items={contact.faqs.map((faq) => ({
                id: faq.question,
                title: faq.question,
                content: faq.answer,
              }))}
              defaultOpenId={contact.faqs[0]?.question}
            />
          </aside>
        </div>
      </Section>

      <Section id="offices" tone="muted">
        <SectionHeader
          eyebrow="Offices"
          title="Find your nearest team"
          description="We work from offices in more than 30 countries. Contact the nearest one directly if you would rather not use the form."
        />
        <div className="mt-14">
          <OfficeDirectory offices={contact.offices} />
        </div>
      </Section>
    </>
  );
}
