import { useState } from "react";
import { PageHero } from "../components/ui/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20";

export function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Say hello"
        title="Get in touch"
        description="Questions about a class, a private booking, or a gift card? Drop us a note — we usually reply within a day."
      />

      <section className="py-16 lg:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          {/* Form */}
          <div>
            {sent ? (
              <div className="rounded-2xl border border-olive/30 bg-olive/10 p-8 text-center">
                <h2 className="font-display text-2xl text-olive">Thank you!</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Your message is on its way. We'll be in touch soon.
                </p>
                <Button
                  variant="ghost"
                  size="md"
                  className="mt-6"
                  onClick={() => setSent(false)}
                >
                  Send another
                </Button>
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
                      Name
                    </label>
                    <input id="name" name="name" required className={inputClass} placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                      Email
                    </label>
                    <input id="email" name="email" type="email" required className={inputClass} placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-ink">
                    Subject
                  </label>
                  <input id="subject" name="subject" className={inputClass} placeholder="What's this about?" />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell us a little about what you're looking for…"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg">
                  Send message
                </Button>
              </form>
            )}
          </div>

          {/* Details */}
          <aside className="space-y-8">
            <div className="rounded-2xl border border-ink/10 bg-beige/50 p-7">
              <h3 className="font-display text-xl text-ink">Visit the studio</h3>
              <address className="mt-3 space-y-1 text-sm not-italic leading-relaxed text-ink-soft">
                <p>42 Kiln Lane</p>
                <p>Portland, OR 97209</p>
              </address>
              <p className="mt-4 text-sm font-medium text-olive">Open Tue – Sun · 9am – 6pm</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-beige/50 p-7">
              <h3 className="font-display text-xl text-ink">Reach us</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li>
                  <span className="font-medium text-ink">Email · </span>
                  hello@theartstudio.com
                </li>
                <li>
                  <span className="font-medium text-ink">Phone · </span>
                  (503) 555-0142
                </li>
              </ul>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
