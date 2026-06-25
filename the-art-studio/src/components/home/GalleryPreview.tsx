import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { galleryPieces } from "../../lib/content";
import { cn } from "../../lib/cn";

export function GalleryPreview() {
  const preview = galleryPieces.slice(0, 5);

  return (
    <section className="py-20 lg:py-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="From our makers"
            title="A look inside the gallery"
            description="Work made in our studios — by first-timers and long-time residents alike."
          />
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-all hover:gap-2.5 hover:text-clay"
          >
            View all work <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-12 grid auto-rows-[200px] grid-cols-2 gap-4 lg:grid-cols-4">
          {preview.map((piece, i) => (
            <Link
              key={piece.id}
              to="/gallery"
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-gradient-to-br shadow-sm",
                piece.tone,
                // First piece spans larger for an editorial, gallery-wall feel.
                i === 0 && "col-span-2 row-span-2",
              )}
            >
              <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/20" />
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="rounded-xl bg-ivory/90 px-4 py-3 backdrop-blur-sm">
                  <p className="font-display text-base text-ink">{piece.title}</p>
                  <p className="text-xs text-ink-soft">
                    {piece.medium} · {piece.artist}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
