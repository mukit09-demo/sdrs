import { Reveal } from "@/components/ui/Reveal";
import type { ProcessStep } from "@sdrs/shared/types/content";

export interface ProcessStepsProps {
  steps: ProcessStep[];
}

/** Numbered stages of a process, e.g. the application journey. */
export function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => (
        <li key={step.step}>
          <Reveal delay={Math.min(index, 3) * 80}>
            <p
              aria-hidden="true"
              className="font-display text-5xl leading-none font-medium text-ink-200"
            >
              {String(step.step).padStart(2, "0")}
            </p>
            <h3 className="mt-4 text-xl font-medium text-ink-900">{step.title}</h3>
            <p className="mt-3 leading-relaxed text-ink-600">{step.description}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
