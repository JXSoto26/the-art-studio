import { Link } from "react-router-dom";
import { useAdminData } from "../../lib/admin/AdminDataProvider";
import { AdminPageHeader } from "../../components/admin/ui/AdminPageHeader";
import { StatCard } from "../../components/admin/ui/StatCard";
import { Card, CardHeader } from "../../components/admin/ui/Card";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "../../components/admin/ui/Table";
import { BookingStatusBadge } from "../../components/admin/ui/StatusBadge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/admin/ui/StateViews";
import { formatCurrency, formatDate } from "../../lib/admin/format";

export function DashboardPage() {
  const { workshops, sessions, bookings, loading, error, refresh } =
    useAdminData();

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const activeWorkshops = workshops.filter((w) => w.is_active).length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const revenue = bookings
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => {
      const ws = workshops.find((w) => w.id === b.workshop_id);
      return sum + (ws ? ws.price * b.participants : 0);
    }, 0);

  const upcoming = [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const recentBookings = bookings.slice(0, 5);

  const workshopName = (id: string) =>
    workshops.find((w) => w.id === id)?.title ?? "—";

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="A snapshot of your studio at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active workshops"
          value={activeWorkshops}
          hint={`${workshops.length} total`}
        />
        <StatCard
          label="Total bookings"
          value={bookings.length}
          hint={`${pending} pending`}
        />
        <StatCard
          label="Upcoming sessions"
          value={sessions.length}
          hint="Scheduled"
        />
        <StatCard
          label="Paid revenue"
          value={formatCurrency(revenue)}
          hint="From paid bookings"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent bookings */}
        <Card>
          <CardHeader
            title="Recent bookings"
            action={
              <Link
                to="/admin/bookings"
                className="text-sm font-medium text-olive hover:underline"
              >
                View all
              </Link>
            }
          />
          {recentBookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="New bookings will appear here as they come in."
              className="m-5"
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Workshop</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {recentBookings.map((b) => (
                  <TR key={b.id}>
                    <TD>
                      <p className="font-medium text-ink">{b.customer_name}</p>
                      <p className="text-xs text-ink-soft">
                        {formatDate(b.created_at)}
                      </p>
                    </TD>
                    <TD className="text-ink-soft">
                      {workshopName(b.workshop_id)}
                    </TD>
                    <TD>
                      <BookingStatusBadge status={b.status} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>

        {/* Upcoming sessions */}
        <Card>
          <CardHeader
            title="Upcoming sessions"
            action={
              <Link
                to="/admin/workshops"
                className="text-sm font-medium text-olive hover:underline"
              >
                Manage
              </Link>
            }
          />
          {upcoming.length === 0 ? (
            <EmptyState
              title="No sessions scheduled"
              description="Add sessions from a workshop's edit page."
              className="m-5"
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Workshop</TH>
                  <TH>Date</TH>
                  <TH>Spots</TH>
                </TR>
              </THead>
              <TBody>
                {upcoming.map((s) => (
                  <TR key={s.id}>
                    <TD className="font-medium text-ink">
                      {workshopName(s.workshop_id)}
                    </TD>
                    <TD className="text-ink-soft">
                      {formatDate(s.date)}
                      <span className="block text-xs">
                        {s.start_time}–{s.end_time}
                      </span>
                    </TD>
                    <TD className="text-ink-soft">
                      {s.available_spots}/{s.capacity}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}
