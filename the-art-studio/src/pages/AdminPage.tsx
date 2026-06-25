import { PageHero } from "../components/ui/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { featuredWorkshops } from "../lib/content";

const stats = [
  { label: "Active classes", value: "12" },
  { label: "Seats booked", value: "184" },
  { label: "Gift cards sold", value: "37" },
  { label: "This month", value: "$8.4k" },
];

export function AdminPage() {
  return (
    <>
      <PageHero
        eyebrow="Studio Admin"
        title="Dashboard"
        description="A quick overview of bookings and upcoming sessions. (Placeholder — wire to your backend and auth.)"
      />

      <section className="py-12 lg:py-16">
        <Container>
          {/* Stat cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-ink/10 bg-beige/50 p-6"
              >
                <p className="text-sm text-ink-soft">{s.label}</p>
                <p className="mt-2 font-display text-3xl text-olive">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Bookings table */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-ink/10 bg-ivory">
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
              <h2 className="font-display text-xl text-ink">Upcoming sessions</h2>
              <button
                type="button"
                className="rounded-full bg-olive px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-olive-deep"
              >
                + New session
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-beige/40 text-ink-soft">
                  <tr>
                    <th className="px-6 py-3 font-medium">Workshop</th>
                    <th className="px-6 py-3 font-medium">Level</th>
                    <th className="px-6 py-3 font-medium">Schedule</th>
                    <th className="px-6 py-3 font-medium">Price</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {featuredWorkshops.map((w, i) => (
                    <tr key={w.id} className="hover:bg-beige/30">
                      <td className="px-6 py-4 font-medium text-ink">{w.title}</td>
                      <td className="px-6 py-4">
                        <Badge>{w.level}</Badge>
                      </td>
                      <td className="px-6 py-4 text-ink-soft">{w.schedule}</td>
                      <td className="px-6 py-4 text-ink-soft">{w.price}</td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            i === 0
                              ? "inline-flex rounded-full bg-clay/15 px-3 py-1 text-xs font-medium text-clay-deep"
                              : "inline-flex rounded-full bg-olive/15 px-3 py-1 text-xs font-medium text-olive"
                          }
                        >
                          {i === 0 ? "Almost full" : "Open"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
