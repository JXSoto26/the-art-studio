import { Container } from "../ui/Container";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { GridSkeleton, SectionMessage } from "../ui/SectionState";
import { usePublicData } from "../../lib/public/PublicDataProvider";
import { featuredWorkshops, toWorkshopCard } from "../../lib/public/display";

const GRID = "mt-12 grid gap-6 md:grid-cols-3";

export function FeaturedWorkshops() {
  const { workshops, sessions, loading, error } = usePublicData();
  const cards = featuredWorkshops(workshops).map((w) =>
    toWorkshopCard(w, sessions),
  );

  return (
    <section className="bg-olive py-20 text-ivory lg:py-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
              Upcoming this season
            </p>
            <h2 className="font-display text-3xl leading-tight text-ivory text-balance sm:text-4xl">
              Featured workshops
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ivory/75">
              Limited seats, all materials included, and a finished piece to take
              home. Reserve early — these fill quickly.
            </p>
          </div>
          <Button to="/classes" variant="secondary" size="md">
            See full schedule
          </Button>
        </div>

        {loading ? (
          <GridSkeleton count={3} gridClassName={GRID} cardClassName="h-80" />
        ) : error ? (
          <SectionMessage tone="error" className="mt-12">
            We couldn't load the workshops just now. Please refresh to try again.
          </SectionMessage>
        ) : cards.length === 0 ? (
          <SectionMessage className="mt-12">
            No featured workshops right now — check the full schedule for what's
            coming up.
          </SectionMessage>
        ) : (
          <div className={GRID}>
            {cards.map((w) => (
              <article
                key={w.id}
                className="flex flex-col rounded-2xl bg-ivory p-6 text-ink shadow-sm transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 flex items-center justify-between">
                  <Badge>{w.level}</Badge>
                  <span className="font-display text-2xl text-clay">
                    {w.price}
                  </span>
                </div>
                <h3 className="font-display text-xl leading-snug text-ink">
                  {w.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                  {w.shortDescription || w.description}
                </p>
                <dl className="mt-5 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Duration</dt>
                    <dd className="font-medium text-ink">{w.duration}</dd>
                  </div>
                  {w.begins && (
                    <div className="flex justify-between">
                      <dt className="text-ink-soft">Begins</dt>
                      <dd className="font-medium text-ink">{w.begins}</dd>
                    </div>
                  )}
                </dl>
                <Button
                  to={`/classes/${w.slug}`}
                  variant="primary"
                  size="md"
                  className="mt-6 w-full"
                >
                  Reserve a seat
                </Button>
              </article>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
