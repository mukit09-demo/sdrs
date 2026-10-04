import { Reveal } from "@/components/ui/Reveal";
import type { Milestone } from "@sdrs/shared/types/content";

export interface TimelineProps {
  milestones: Milestone[];
}

/** Chronological list of milestones, rendered as a definition list. */
export function Timeline({ milestones }: TimelineProps) {
  return (
    <ol className="relative border-l border-ink-200 pl-8 md:pl-12">
      {milestones.map((milestone, index) => (
        <li key={milestone.year} className="relative pb-12 last:pb-0">
          <span
            aria-hidden="true"
            className="absolute top-2 -left-8 size-2.5 -translate-x-1/2 rounded-full bg-brand-500 md:-left-12"
          />
          <Reveal delay={Math.min(index, 4) * 60}>
            <p className="font-display text-sm font-medium tracking-widest text-brand-600">
              {milestone.year}
            </p>
            <h3 className="mt-2 text-xl font-medium text-ink-900 md:text-2xl">
              {milestone.title}
            </h3>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-600">
              {milestone.description}
            </p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
