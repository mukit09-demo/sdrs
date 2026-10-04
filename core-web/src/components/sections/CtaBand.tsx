import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import type { MediaImage } from "@sdrs/shared/types/content";

export interface CtaBandProps {
  title: string;
  description?: string;
  /**
   * The single action for the band. Deliberately one button and not two: a
   * navigational second button ("See our markets") competes with the one thing
   * the band is for, and the nav already covers it.
   */
  primaryAction: { label: string; href: string };
  /** Background artwork. Omit for a flat dark band. */
  image?: MediaImage;
}

/** Closing call to action, used at the foot of most pages. */
export function CtaBand({
  title,
  description,
  primaryAction,
  image,
}: CtaBandProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 text-white">
      {image && (
        <>
          <Media image={image} fill sizes="100vw" />
          <div
            className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/60"
            aria-hidden="true"
          />
        </>
      )}

      {/* Copy left, actions right: the buttons occupy space the stacked layout
          left empty, so the band needs roughly half the height. */}
      <Container className="relative flex flex-col gap-6 py-7 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl leading-[1.08] font-medium md:text-4xl">{title}</h2>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              {description}
            </p>
          )}
        </div>

        <div className="md:shrink-0">
          <Button href={primaryAction.href} size="lg" icon="arrow">
            {primaryAction.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
