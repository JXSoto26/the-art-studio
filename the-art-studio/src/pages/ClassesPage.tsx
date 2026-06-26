import { PageHero } from "../components/ui/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { GridSkeleton, SectionMessage } from "../components/ui/SectionState";
import { classCategories } from "../lib/content";
import { usePublicData } from "../lib/public/PublicDataProvider";
import { activeWorkshops, toWorkshopCard } from "../lib/public/display";

export function ClassesPage() {
  const { workshops, sessions, loading, error } = usePublicData();
  const cards = activeWorkshops(workshops).map((w) =>
    toWorkshopCard(w, sessions),
  );

  return (
    <>
      <PageHero
        eyebrow="Classes & Workshops"
        title="Learn a craft, at your own pace"
        description="Small groups, generous studio time, and all materials included. Whether you have an hour or a whole season, there's a place for you at the table."
      />

      {/* Disciplines */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {classCategories.map((cat) => (
              <article
                key={cat.id}
                className="flex flex-col rounded-2xl border border-ink/10 bg-beige/40 p-7 transition-colors hover:border-clay/40"
              >
                <h2 className="font-display text-2xl text-ink">{cat.title}</h2>
                <p className="mt-1 text-sm font-medium text-olive">{cat.blurb}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                  {cat.detail}
                </p>
                <Button to="/contact" variant="ghost" size="md" className="mt-6 self-start">
                  Enquire about {cat.title}
                </Button>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Upcoming schedule */}
      <section className="bg-beige/50 py-16 lg:py-20">
        <Container>
          <h2 className="font-display text-3xl text-ink">Upcoming schedule</h2>
          {loading ? (
            <GridSkeleton
              count={3}
              gridClassName="mt-8 grid gap-4"
              cardClassName="h-28"
            />
          ) : error ? (
            <SectionMessage tone="error" className="mt-8">
              We couldn't load the schedule just now. Please refresh to try
              again.
            </SectionMessage>
          ) : cards.length === 0 ? (
            <SectionMessage className="mt-8">
              No classes are scheduled at the moment — please check back soon or
              get in touch.
            </SectionMessage>
          ) : (
            <div className="mt-8 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-ivory">
              {cards.map((w) => (
                <div
                  key={w.id}
                  className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-xl text-ink">
                        {w.title}
                      </h3>
                      <Badge>{w.level}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">
                      {w.shortDescription || w.description}
                    </p>
                    <p className="mt-2 text-sm font-medium text-olive">
                      {w.duration}
                      {w.begins && ` · Begins ${w.begins}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-5 sm:flex-col sm:items-end">
                    <span className="font-display text-2xl text-clay">
                      {w.price}
                    </span>
                    <Button to={`/classes/${w.slug}`} variant="primary" size="md">
                      Reserve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
