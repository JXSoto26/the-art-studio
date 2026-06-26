import { useMemo, useState, type FormEvent } from "react";
import { useAdminData } from "../../lib/admin/AdminDataProvider";
import { AdminPageHeader } from "../../components/admin/ui/AdminPageHeader";
import { Card } from "../../components/admin/ui/Card";
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
import { ConfirmDialog, Modal } from "../../components/admin/ui/Modal";
import { Field, Input, Select } from "../../components/admin/ui/Form";
import { formatDate } from "../../lib/format";
import { cn } from "../../lib/cn";
import type {
  Booking,
  BookingInput,
  BookingStatus,
} from "../../lib/admin/types";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "paid", "cancelled"];
const FILTERS: Array<BookingStatus | "all"> = [
  "all",
  "pending",
  "confirmed",
  "paid",
  "cancelled",
];

export function BookingsPage() {
  const {
    bookings,
    workshops,
    sessions,
    loading,
    error,
    refresh,
    createBooking,
    updateBookingStatus,
    deleteBooking,
  } = useAdminData();

  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? bookings
        : bookings.filter((b) => b.status === filter),
    [bookings, filter],
  );

  const workshopName = (id: string | null) =>
    id ? (workshops.find((w) => w.id === id)?.title ?? "—") : "General inquiry";
  const sessionLabel = (id: string | null) => {
    if (!id) return "—";
    const s = sessions.find((x) => x.id === id);
    return s ? `${formatDate(s.date)} · ${s.start_time}` : "—";
  };

  async function changeStatus(id: string, status: BookingStatus) {
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, status);
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteBooking(toDelete.id);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const newButton = (
    <button
      type="button"
      onClick={() => setCreating(true)}
      className="rounded-full bg-olive px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-olive-deep"
    >
      + New booking
    </button>
  );

  return (
    <>
      <AdminPageHeader
        title="Bookings"
        description="Track and update customer reservations."
        actions={bookings.length > 0 ? newButton : undefined}
      />

      {loading ? (
        <LoadingState label="Loading bookings…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="When customers book a workshop, they'll show up here."
          icon="🗓"
          action={newButton}
        />
      ) : (
        <>
          {/* Status filter tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const count =
                f === "all"
                  ? bookings.length
                  : bookings.filter((b) => b.status === f).length;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                    filter === f
                      ? "bg-olive text-ivory"
                      : "border border-ink/15 text-ink-soft hover:bg-ink/[0.04]",
                  )}
                >
                  {f} ({count})
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title={`No ${filter} bookings`}
              description="Try a different filter."
            />
          ) : (
            <Card>
              <Table>
                <THead>
                  <TR>
                    <TH>Customer</TH>
                    <TH>Workshop</TH>
                    <TH>Session</TH>
                    <TH>Guests</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {filtered.map((b) => (
                    <TR key={b.id}>
                      <TD>
                        <p className="font-medium text-ink">
                          {b.customer_name}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {b.customer_email}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {b.customer_phone}
                        </p>
                        {b.notes && (
                          <p className="mt-1 max-w-xs whitespace-pre-line text-xs italic text-ink-soft/80">
                            “{b.notes}”
                          </p>
                        )}
                      </TD>
                      <TD className="text-ink-soft">
                        {workshopName(b.workshop_id)}
                      </TD>
                      <TD className="text-ink-soft">
                        {sessionLabel(b.session_id)}
                      </TD>
                      <TD className="text-ink-soft">{b.participants}</TD>
                      <TD>
                        <BookingStatusBadge status={b.status} />
                      </TD>
                      <TD className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Select
                            aria-label="Change status"
                            value={b.status}
                            disabled={updatingId === b.id}
                            onChange={(e) =>
                              changeStatus(
                                b.id,
                                e.target.value as BookingStatus,
                              )
                            }
                            className="w-32 py-1.5 text-xs"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s} className="capitalize">
                                {s}
                              </option>
                            ))}
                          </Select>
                          <button
                            type="button"
                            onClick={() => setToDelete(b)}
                            className="rounded-lg border border-clay/30 px-3 py-1.5 text-xs font-medium text-clay-deep transition-colors hover:bg-clay/10"
                          >
                            Delete
                          </button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Card>
          )}
        </>
      )}

      {creating && (
        <NewBookingModal
          onClose={() => setCreating(false)}
          onCreate={createBooking}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete booking?"
        message={`${toDelete?.customer_name}'s booking will be permanently removed.`}
        confirmLabel="Delete booking"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

/* --------------------------------------------------------- new booking modal */

function NewBookingModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: BookingInput) => Promise<Booking>;
}) {
  const { workshops, sessions } = useAdminData();
  const [form, setForm] = useState<BookingInput>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    workshop_id: workshops[0]?.id ?? "",
    session_id: "",
    participants: 1,
    status: "pending",
    notes: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workshopSessions = sessions.filter(
    (s) => s.workshop_id === form.workshop_id,
  );

  function setField<K extends keyof BookingInput>(
    key: K,
    value: BookingInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.customer_name.trim() || !form.customer_email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      // Empty selects mean "not tied to a workshop/session" — store as null.
      await onCreate({
        ...form,
        workshop_id: form.workshop_id || null,
        session_id: form.session_id || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="New booking" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-clay/30 bg-clay/10 px-4 py-2.5 text-sm text-clay-deep">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Customer name" htmlFor="bk-name" required>
            <Input
              id="bk-name"
              value={form.customer_name}
              onChange={(e) => setField("customer_name", e.target.value)}
            />
          </Field>
          <Field label="Participants" htmlFor="bk-part">
            <Input
              id="bk-part"
              type="number"
              min={1}
              value={form.participants}
              onChange={(e) => setField("participants", Number(e.target.value))}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" htmlFor="bk-email" required>
            <Input
              id="bk-email"
              type="email"
              value={form.customer_email}
              onChange={(e) => setField("customer_email", e.target.value)}
            />
          </Field>
          <Field label="Phone" htmlFor="bk-phone">
            <Input
              id="bk-phone"
              value={form.customer_phone}
              onChange={(e) => setField("customer_phone", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Workshop" htmlFor="bk-ws">
          <Select
            id="bk-ws"
            value={form.workshop_id ?? ""}
            onChange={(e) => {
              setField("workshop_id", e.target.value);
              setField("session_id", "");
            }}
          >
            <option value="">Select a workshop…</option>
            {workshops.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Session" htmlFor="bk-se">
          <Select
            id="bk-se"
            value={form.session_id ?? ""}
            onChange={(e) => setField("session_id", e.target.value)}
            disabled={!form.workshop_id}
          >
            <option value="">
              {form.workshop_id ? "Select a session…" : "Pick a workshop first"}
            </option>
            {workshopSessions.map((s) => (
              <option key={s.id} value={s.id}>
                {formatDate(s.date)} · {s.start_time}–{s.end_time}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="bk-status">
          <Select
            id="bk-status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value as BookingStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink/[0.04]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-olive px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-olive-deep disabled:opacity-60"
          >
            {saving && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ivory/40 border-t-ivory" />
            )}
            Create booking
          </button>
        </div>
      </form>
    </Modal>
  );
}
