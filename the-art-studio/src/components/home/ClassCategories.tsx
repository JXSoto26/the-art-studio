import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { classCategories } from "../../lib/content";

export function ClassCategories() {
  return (
    <section className="py-20 lg:py-24">
      <Container>
        <SectionHeading
          eyebrow="What you can make"
          title="Find your medium"
          description="Four core disciplines, each taught in small groups by working artists. Start anywhere — many of our makers move between them."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {classCategories.map((cat, i) => (
            <Link
              key={cat.id}
              to="/classes"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-beige/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-clay/40 hover:bg-beige hover:shadow-lg"
            >
              <span className="font-display text-5xl text-clay/30 transition-colors group-hover:text-clay/60">
                0{i + 1}
              </span>
              <h3 className="mt-5 font-display text-xl text-ink">{cat.title}</h3>
              <p className="mt-1 text-sm font-medium text-olive">{cat.blurb}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                {cat.detail}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-all group-hover:gap-2.5">
                Browse classes
                <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
