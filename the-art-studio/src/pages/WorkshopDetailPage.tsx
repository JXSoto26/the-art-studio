import { useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { PageHero } from "../components/ui/PageHero";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { usePublicData } from "../lib/public/PublicDataProvider";
import {
  categoryLabel,
  findWorkshopBySlug,
  sessionLabel,
  skillLevelLabel,
  upcomingSessionsForWorkshop,
} from "../lib/public/display";
import { formatCurrency, formatDuration } from "../lib/format";
import { cn } from "../lib/cn";

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20 disabled:opacity-60";

type Status = "idle" | "submitting" | "success" | "error";

const emptyForm = { name: "", email: "", phone: "", participants: 1, notes: "" };

export function WorkshopDetailPage() {
  const { slug } = useParams();
  const { workshops, sessions, loading, error, bookSession } = usePublicData();

  const workshop = slug ? findWorkshopBySlug(workshops, slug) : undefined;
  const workshopSessions = useMemo(
    () => (workshop ? upcomingSessionsForWorkshop(sessions, workshop.id) : []),
    [workshop, sessions],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    session: string;
    participants: number;
  } | null>(null);

  const selectedSession =
    workshopSessions.find((s) => s.id === selectedId) ?? null;
  const submitting = status === "submitting";

  function setField(key: keyof typeof emptyForm, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function selectSession(id: string) {
    setSelectedId(id);
    setForm((f) => ({ ...f, participants: 1 }));
    if (status === "error") setStatus("idle");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting || !workshop) return;

    if (!selectedSession) {
      setStatus("error");
      setErrorMsg("Please choose a session to book.");
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setStatus("error");
      setErrorMsg("Please add your name, email, and phone number.");
      return;
    }
    if (!Number.isInteger(form.participants) || form.participants < 1) {
      setStatus("error");
      setErrorMsg("Please book at least one spot.");
      return;
    }
    if (form.participants > selectedSession.available_spots) {
      setStatus("error");
      setErrorMsg(
        `Only ${selectedSession.available_spots} spot${
          selectedSession.available_spots === 1 ? "" : "s"
        } left for this session.`,
      );
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);
    try {
      await bookSession({
        workshopId: workshop.id,
        sessionId: selectedSession.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        participants: form.participants,
        notes: form.notes,
      });
      setConfirmation({
        session: sessionLabel(selectedSession),
        participants: form.participants,
      });
      setStatus("success");
      setForm(emptyForm);
      setSelectedId(null);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong booking your spot. Please try again.",
      );
    }
  }

  /* ----------------------------------------------------------- early states */

  if (loading) {
    return (
      <Container className="py-24">
        <div className="mx-auto max-w-2xl space-y-4" aria-hidden>
          <div className="h-10 w-2/3 animate-pulse rounded-lg bg-ink/[0.06]" />
          <div className="h-5 w-full animate-pulse rounded bg-ink/[0.05]" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-ink/[0.05]" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-24 text-center">
        <p className="text-sm text-clay-deep">{error}</p>
        <Button to="/classes" variant="ghost" size="md" className="mt-6">
          Back to classes
        </Button>
      </Container>
    );
  }

  if (!workshop) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Workshop not found</h1>
        <p className="mt-3 text-sm text-ink-soft">
          This workshop may have ended or is no longer listed.
        </p>
        <Button to="/classes" variant="primary" size="md" className="mt-6">
          Browse all classes
        </Button>
      </Container>
    );
  }

  /* ----------------------------------------------------------------- detail */

  return (
    <>
      <PageHero
        eyebrow={categoryLabel(workshop.category)}
        title={workshop.title}
        description={workshop.short_description}
      />

      <section className="py-16 lg:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          {/* Left: about + sessions */}
          <div>
            <Link
              to="/classes"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-clay"
            >
              <span aria-hidden>←</span> All classes
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge>{skillLevelLabel(workshop.skill_level)}</Badge>
              <span className="text-sm text-ink-soft">
                {formatDuration(workshop.duration_minutes)} per session
              </span>
              <span className="font-display text-2xl text-clay">
                {formatCurrency(workshop.price)}
              </span>
            </div>

            <h2 className="mt-8 font-display text-2xl text-ink">
              About this workshop
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              {workshop.description}
            </p>

            <h2 className="mt-10 font-display text-2xl text-ink">
              Upcoming sessions
            </h2>
            {workshopSessions.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-ink/10 bg-beige/40 px-5 py-6 text-sm text-ink-soft">
                No sessions are scheduled right now. Please check back soon or
                get in touch.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {workshopSessions.map((s) => {
                  const full = s.available_spots <= 0;
                  const active = s.id === selectedId;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        disabled={full}
                        onClick={() => selectSession(s.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-colors",
                          full
                            ? "cursor-not-allowed border-ink/10 bg-ink/[0.03] opacity-70"
                            : active
                              ? "border-olive bg-olive/10"
                              : "border-ink/15 bg-ivory hover:border-olive/50",
                        )}
                      >
                        <div>
                          <p className="font-medium text-ink">
                            {sessionLabel(s)}
                          </p>
                          <p className="mt-0.5 text-sm text-ink-soft">
                            {full
                              ? "Fully booked"
                              : `${s.available_spots} spot${
                                  s.available_spots === 1 ? "" : "s"
                                } left`}
                          </p>
                        </div>
                        {full ? (
                          <Badge>Full</Badge>
                        ) : active ? (
                          <span className="text-sm font-medium text-olive">
                            Selected
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-clay">
                            Select
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Right: booking form */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {status === "success" && confirmation ? (
              <div className="rounded-2xl border border-olive/30 bg-olive/10 p-8 text-center">
                <h2 className="font-display text-2xl text-olive">You're booked!</h2>
                <p className="mt-3 text-sm text-ink-soft">
                  We've reserved {confirmation.participants} spot
                  {confirmation.participants === 1 ? "" : "s"} for{" "}
                  <span className="font-medium text-ink">{workshop.title}</span>{" "}
                  on{" "}
                  <span className="font-medium text-ink">
                    {confirmation.session}
                  </span>
                  . We'll be in touch to confirm the details.
                </p>
                <Button
                  variant="ghost"
                  size="md"
                  className="mt-6"
                  onClick={() => setStatus("idle")}
                >
                  Book another session
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-2xl border border-ink/10 bg-beige/50 p-7"
              >
                <h2 className="font-display text-xl text-ink">
                  Reserve your spot
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {selectedSession
                    ? sessionLabel(selectedSession)
                    : "Select a session to get started."}
                </p>

                {status === "error" && errorMsg && (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay-deep"
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="bk-name"
                      className="mb-1.5 block text-sm font-medium text-ink"
                    >
                      Name
                    </label>
                    <input
                      id="bk-name"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      disabled={submitting}
                      className={inputClass}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="bk-email"
                      className="mb-1.5 block text-sm font-medium text-ink"
                    >
                      Email
                    </label>
                    <input
                      id="bk-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      disabled={submitting}
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="bk-phone"
                      className="mb-1.5 block text-sm font-medium text-ink"
                    >
                      Phone
                    </label>
                    <input
                      id="bk-phone"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      disabled={submitting}
                      className={inputClass}
                      placeholder="(555) 555-0123"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="bk-participants"
                      className="mb-1.5 block text-sm font-medium text-ink"
                    >
                      Participants
                    </label>
                    <input
                      id="bk-participants"
                      type="number"
                      min={1}
                      max={selectedSession?.available_spots ?? 1}
                      value={form.participants}
                      onChange={(e) =>
                        setField("participants", Number(e.target.value))
                      }
                      disabled={submitting || !selectedSession}
                      className={inputClass}
                    />
                    {selectedSession && (
                      <p className="mt-1 text-xs text-ink-soft">
                        {selectedSession.available_spots} available
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="bk-notes"
                      className="mb-1.5 block text-sm font-medium text-ink"
                    >
                      Notes <span className="text-ink-soft">(optional)</span>
                    </label>
                    <textarea
                      id="bk-notes"
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setField("notes", e.target.value)}
                      disabled={submitting}
                      className={`${inputClass} resize-none`}
                      placeholder="Anything we should know?"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting || !selectedSession}
                  className="mt-6 w-full"
                >
                  {submitting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/40 border-t-ivory" />
                  )}
                  {submitting ? "Booking…" : "Book now"}
                </Button>
              </form>
            )}
          </aside>
        </Container>
      </section>
    </>
  );
}
