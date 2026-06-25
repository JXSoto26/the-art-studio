import { Hero } from "../components/home/Hero";
import { ClassCategories } from "../components/home/ClassCategories";
import { FeaturedWorkshops } from "../components/home/FeaturedWorkshops";
import { GalleryPreview } from "../components/home/GalleryPreview";
import { GiftCard } from "../components/home/GiftCard";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";

export function HomePage() {
  return (
    <>
      <Hero />
      <ClassCategories />
      <FeaturedWorkshops />
      <GalleryPreview />
      <GiftCard />

      {/* Closing CTA band */}
      <section className="pb-8">
        <Container>
          <div className="rounded-3xl bg-ink px-8 py-16 text-center text-ivory sm:px-12">
            <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight text-balance sm:text-4xl">
              Your first piece is waiting to be made.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-ivory/70">
              Book a single class or join a season-long workshop. We'll have an
              apron and a warm cup waiting.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button to="/classes" variant="secondary" size="lg">
                Browse classes
              </Button>
              <Button to="/contact" variant="ghost" size="lg" className="border-ivory/30 text-ivory hover:border-ivory/60 hover:bg-ivory/[0.06]">
                Get in touch
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
