import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils/cn";
import type { Person } from "@sdrs/shared/types/content";

export interface PersonGridProps {
  people: Person[];
  columns?: 2 | 3;
  /** Hide the quote for a compact directory listing. */
  showQuote?: boolean;
  className?: string;
}

/** Profile cards for leadership and colleague stories. */
export function PersonGrid({
  people,
  columns = 3,
  showQuote = true,
  className,
}: PersonGridProps) {
  return (
    <ul
      className={cn(
        "grid gap-x-8 gap-y-12",
        columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {people.map((person, index) => (
        <li key={person.id}>
          <Reveal delay={Math.min(index, 3) * 80} className="group h-full">
            <Media
              image={person.image}
              ratio="portrait"
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            />
            <div className="pt-5">
              <h3 className="text-lg font-medium text-ink-900">{person.name}</h3>
              <p className="mt-1 text-sm text-brand-600">{person.role}</p>
              <p className="mt-1 text-sm text-ink-500">{person.location}</p>
              {showQuote && (
                <blockquote className="mt-4 border-l-2 border-ink-200 pl-4 text-sm leading-relaxed text-ink-600">
                  {person.quote}
                </blockquote>
              )}
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
