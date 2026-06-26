import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { usePublicData } from "../../lib/public/PublicDataProvider";

export function Hero() {
  const { settings, loading } = usePublicData();

  return (
    <section className="relative overflow-hidden">
      {/* Soft layered background wash */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-clay/15 blur-3xl" />
        <div className="absolute -left-24 top-40 h-80 w-80 rounded-full bg-olive/15 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-beige/60 via-ivory to-ivory" />
      </div>

      <Container className="grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="animate-rise">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.26em] text-clay">
            Painting · Ceramics · Craft
          </p>
          {loading || !settings ? (
            <div className="space-y-4" aria-hidden>
              <div className="h-14 w-3/4 animate-pulse rounded-lg bg-ink/[0.06]" />
              <div className="h-14 w-2/3 animate-pulse rounded-lg bg-ink/[0.06]" />
              <div className="mt-6 h-6 w-full max-w-md animate-pulse rounded bg-ink/[0.05]" />
            </div>
          ) : (
            <>
              <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-ink text-balance sm:text-6xl lg:text-7xl">
                {settings.hero_title}
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
                {settings.hero_subtitle}
              </p>
            </>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button to="/classes" variant="primary" size="lg">
              Explore classes
            </Button>
            <Button to="/gallery" variant="ghost" size="lg">
              View the gallery
            </Button>
          </div>

          <dl className="mt-12 flex gap-10">
            {[
              { value: "12+", label: "Weekly classes" },
              { value: "6", label: "Resident artists" },
              { value: "2k+", label: "Pieces fired" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-3xl text-olive">{stat.value}</dt>
                <dd className="mt-1 text-sm text-ink-soft">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Image collage stand-in built from brand gradients */}
        <div className="relative animate-fade">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
            <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-2xl bg-olive/15" />
            <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-clay/70 via-clay/30 to-beige shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-ivory/85 p-5 backdrop-blur-sm">
                <p className="font-display text-lg text-ink">Studio No. 42</p>
                <p className="mt-1 text-sm text-ink-soft">
                  Open studio every Sunday — drop in, bring a friend.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -left-4 top-10 hidden rotate-[-6deg] rounded-xl bg-ivory p-3 shadow-lg sm:block">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-olive to-olive-deep" />
          </div>
        </div>
      </Container>
    </section>
  );
}
