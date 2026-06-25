import { Container } from "../ui/Container";
import { Button } from "../ui/Button";

export function GiftCard() {
  return (
    <section className="py-20 lg:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-beige px-8 py-14 sm:px-12 lg:px-16">
          {/* Decorative wash */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-clay/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-olive/15 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
                The perfect gift
              </p>
              <h2 className="font-display text-3xl leading-tight text-ink text-balance sm:text-4xl">
                Give the gift of making
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
                A studio gift card is a beautiful way to share the craft. Redeemable
                across every class, workshop, and open-studio session — and it never
                expires.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button href="#" variant="secondary" size="lg">
                  Buy a gift card
                </Button>
                <Button to="/contact" variant="ghost" size="lg">
                  Ask a question
                </Button>
              </div>
            </div>

            {/* Gift card visual */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="rotate-[-3deg] rounded-2xl bg-gradient-to-br from-olive to-olive-deep p-7 text-ivory shadow-xl transition-transform duration-500 hover:rotate-0">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl">The Art Studio</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-ivory/15 font-display">
                    A
                  </span>
                </div>
                <p className="mt-10 text-xs uppercase tracking-[0.2em] text-ivory/70">
                  Gift Card
                </p>
                <p className="mt-1 font-display text-4xl">$150</p>
                <div className="mt-6 flex items-center justify-between text-xs text-ivory/70">
                  <span>No expiry</span>
                  <span>Any class · Any medium</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
