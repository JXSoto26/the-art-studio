import { PageHero } from "../components/ui/PageHero";
import { Container } from "../components/ui/Container";
import { GridSkeleton, SectionMessage } from "../components/ui/SectionState";
import { usePublicData } from "../lib/public/PublicDataProvider";
import { categoryLabel, toneForCategory } from "../lib/public/display";
import { cn } from "../lib/cn";

const GRID = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

export function GalleryPage() {
  const { gallery, loading, error } = usePublicData();

  return (
    <>
      <PageHero
        eyebrow="The Gallery"
        title="Made here, by hand"
        description="A rotating collection of work from our students, residents, and visiting artists. Many pieces are available to purchase — ask at the front desk."
      />

      <section className="py-16 lg:py-20">
        <Container>
          {loading ? (
            <GridSkeleton count={6} gridClassName={GRID} cardClassName="h-80" />
          ) : error ? (
            <SectionMessage tone="error">
              We couldn't load the gallery just now. Please refresh to try again.
            </SectionMessage>
          ) : gallery.length === 0 ? (
            <SectionMessage>
              There's no work on display yet — new pieces are added after each
              term.
            </SectionMessage>
          ) : (
            <div className={GRID}>
              {gallery.map((piece) => (
                <figure
                  key={piece.id}
                  className="group overflow-hidden rounded-2xl border border-ink/10 bg-ivory shadow-sm"
                >
                  <div
                    className={cn(
                      "relative aspect-[4/5] bg-gradient-to-br",
                      !piece.image_url && toneForCategory(piece.category),
                    )}
                  >
                    {piece.image_url && (
                      <img
                        src={piece.image_url}
                        alt={piece.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/10" />
                  </div>
                  <figcaption className="flex items-start justify-between gap-3 p-5">
                    <div>
                      <p className="font-display text-lg text-ink">
                        {piece.title}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {categoryLabel(piece.category)}
                      </p>
                    </div>
                    {piece.featured && (
                      <p className="text-right text-sm font-medium text-olive">
                        Featured
                      </p>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
