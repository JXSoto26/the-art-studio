import { Container } from "./Container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

/** Compact, consistent page intro used at the top of inner pages. */
export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-ink/10 bg-beige/60">
      <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-clay/15 blur-3xl" />
      <Container className="relative py-16 lg:py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-clay">
          {eyebrow}
        </p>
        <h1 className="max-w-3xl font-display text-4xl leading-tight text-ink text-balance sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
