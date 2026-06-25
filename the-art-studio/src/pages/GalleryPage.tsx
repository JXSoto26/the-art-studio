import { PageHero } from "../components/ui/PageHero";
import { Container } from "../components/ui/Container";
import { galleryPieces } from "../lib/content";
import { cn } from "../lib/cn";

export function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="The Gallery"
        title="Made here, by hand"
        description="A rotating collection of work from our students, residents, and visiting artists. Many pieces are available to purchase — ask at the front desk."
      />

      <section className="py-16 lg:py-20">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryPieces.map((piece) => (
              <figure
                key={piece.id}
                className="group overflow-hidden rounded-2xl border border-ink/10 bg-ivory shadow-sm"
              >
                <div
                  className={cn(
                    "relative aspect-[4/5] bg-gradient-to-br",
                    piece.tone,
                  )}
                >
                  <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/10" />
                </div>
                <figcaption className="flex items-start justify-between gap-3 p-5">
                  <div>
                    <p className="font-display text-lg text-ink">{piece.title}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">{piece.medium}</p>
                  </div>
                  <p className="text-right text-sm font-medium text-olive">
                    {piece.artist}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
