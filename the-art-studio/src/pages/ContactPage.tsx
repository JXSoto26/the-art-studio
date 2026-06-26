import { useState, type FormEvent } from "react";
import { PageHero } from "../components/ui/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { usePublicData } from "../lib/public/PublicDataProvider";

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20";

const emptyForm = { name: "", email: "", subject: "", message: "" };

type Status = "idle" | "submitting" | "success" | "error";

export function ContactPage() {
  const { settings, submitInquiry } = usePublicData();
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // settings.address is a single string ("42 Kiln Lane, Portland, OR 97209");
  // split into lines to keep the stacked address look.
  const addressLines = settings?.address.split(",").map((l) => l.trim()) ?? [];

  function setField(key: keyof typeof emptyForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setErrorMsg("Please add your name, email, and a message.");
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);
    try {
      await submitInquiry(form);
      setStatus("success");
      setForm(emptyForm);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong sending your message. Please try again.",
      );
    }
  }

  const submitting = status === "submitting";

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
            {status === "success" ? (
              <div className="rounded-2xl border border-olive/30 bg-olive/10 p-8 text-center">
                <h2 className="font-display text-2xl text-olive">Thank you!</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Your message is on its way. We'll be in touch soon.
                </p>
                <Button
                  variant="ghost"
                  size="md"
                  className="mt-6"
                  onClick={() => setStatus("idle")}
                >
                  Send another
                </Button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                {status === "error" && errorMsg && (
                  <div
                    role="alert"
                    className="rounded-xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay-deep"
                  >
                    {errorMsg}
                  </div>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      disabled={submitting}
                      className={inputClass}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      disabled={submitting}
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-ink">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={(e) => setField("subject", e.target.value)}
                    disabled={submitting}
                    className={inputClass}
                    placeholder="What's this about?"
                  />
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
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    disabled={submitting}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell us a little about what you're looking for…"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/40 border-t-ivory" />
                  )}
                  {submitting ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </div>

          {/* Details */}
          <aside className="space-y-8">
            <div className="rounded-2xl border border-ink/10 bg-beige/50 p-7">
              <h3 className="font-display text-xl text-ink">Visit the studio</h3>
              <address className="mt-3 space-y-1 text-sm not-italic leading-relaxed text-ink-soft">
                {addressLines.length ? (
                  addressLines.map((line) => <p key={line}>{line}</p>)
                ) : (
                  <p>&nbsp;</p>
                )}
              </address>
              {settings?.business_hours && (
                <p className="mt-4 text-sm font-medium text-olive">
                  Open {settings.business_hours}
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-ink/10 bg-beige/50 p-7">
              <h3 className="font-display text-xl text-ink">Reach us</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li>
                  <span className="font-medium text-ink">Email · </span>
                  {settings?.email ?? ""}
                </li>
                <li>
                  <span className="font-medium text-ink">Phone · </span>
                  {settings?.whatsapp_number ?? ""}
                </li>
              </ul>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
