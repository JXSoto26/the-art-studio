import { PageHero } from "../components/ui/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";

const values = [
  {
    title: "Process over polish",
    body: "We care more about the hour you spent making than how the piece turns out. Skill follows curiosity.",
  },
  {
    title: "Small by design",
    body: "Classes are capped so everyone gets real time at the wheel, the easel, and with the instructor.",
  },
  {
    title: "Materials that matter",
    body: "Honest clay, good pigment, natural fibre. We source thoughtfully and waste little.",
  },
];

const team = [
  { name: "Lena Ortiz", role: "Founder · Painting", tone: "from-clay/70 to-beige" },
  { name: "Marcus Bell", role: "Ceramics lead", tone: "from-olive/70 to-beige" },
  { name: "Aisha Rahman", role: "Printmaking", tone: "from-ink/50 to-beige" },
  { name: "Jonah Pike", role: "Textiles & dye", tone: "from-clay/50 to-olive/40" },
];

export function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="A studio built around the joy of making"
        description="The Art Studio began in 2014 as a single pottery wheel in a borrowed garage. Today it's a warm, light-filled home for hundreds of makers."
      />

      {/* Story */}
      <section className="py-16 lg:py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-olive/70 via-clay/30 to-beige shadow-sm" />
          <div className="flex flex-col justify-center">
            <h2 className="font-display text-3xl text-ink text-balance">
              We believe everyone is a maker
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-soft">
              <p>
                Somewhere along the way, most of us were told we weren't "the
                creative type." We're here to gently disagree. Making things by
                hand is a birthright, not a talent reserved for the few.
              </p>
              <p>
                Our studio is a place to slow down, get a little messy, and
                rediscover the quiet satisfaction of working with your hands —
                guided by artists who love to teach.
              </p>
            </div>
            <Button to="/classes" variant="primary" size="lg" className="mt-8 self-start">
              Join a class
            </Button>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="bg-beige/50 py-16 lg:py-20">
        <Container>
          <h2 className="font-display text-3xl text-ink">What guides us</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-ink/10 bg-ivory p-7"
              >
                <h3 className="font-display text-xl text-olive">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{v.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="py-16 lg:py-20">
        <Container>
          <h2 className="font-display text-3xl text-ink">The artists</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name}>
                <div
                  className={`aspect-square overflow-hidden rounded-2xl bg-gradient-to-br ${member.tone} shadow-sm`}
                />
                <p className="mt-4 font-display text-lg text-ink">{member.name}</p>
                <p className="text-sm text-ink-soft">{member.role}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
