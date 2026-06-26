import { useMemo, useState, type FormEvent } from "react";
import { useAdminData } from "../../lib/admin/AdminDataProvider";
import { Card, CardHeader } from "./ui/Card";
import { Table, TBody, TD, TH, THead, TR } from "./ui/Table";
import { EmptyState } from "./ui/StateViews";
import { ConfirmDialog, Modal } from "./ui/Modal";
import { Field, Input } from "./ui/Form";
import { formatDate } from "../../lib/format";
import type {
  WorkshopSession,
  WorkshopSessionInput,
} from "../../lib/admin/types";

function emptySession(workshopId: string): WorkshopSessionInput {
  return {
    workshop_id: workshopId,
    date: "",
    start_time: "10:00",
    end_time: "12:00",
    capacity: 10,
    available_spots: 10,
  };
}

/** Lists, adds, edits, and deletes sessions for a single workshop. */
export function SessionsManager({ workshopId }: { workshopId: string }) {
  const {
    sessions,
    createSession,
    updateSession,
    deleteSession,
  } = useAdminData();

  const rows = useMemo(
    () =>
      sessions
        .filter((s) => s.workshop_id === workshopId)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [sessions, workshopId],
  );

  const [editing, setEditing] = useState<WorkshopSession | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<WorkshopSessionInput>(() =>
    emptySession(workshopId),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<WorkshopSession | null>(null);
  const [deleting, setDeleting] = useState(false);

  const modalOpen = creating || editing !== null;

  function openCreate() {
    setForm(emptySession(workshopId));
    setError(null);
    setCreating(true);
  }

  function openEdit(s: WorkshopSession) {
    const { id, ...rest } = s;
    void id;
    setForm(rest);
    setError(null);
    setEditing(s);
  }

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  function setField<K extends keyof WorkshopSessionInput>(
    key: K,
    value: WorkshopSessionInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.date) {
      setError("Please choose a date.");
      return;
    }
    if (form.available_spots > form.capacity) {
      setError("Available spots can't exceed capacity.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateSession(editing.id, form);
      } else {
        await createSession(form);
      }
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save session.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteSession(toDelete.id);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Sessions"
        description="Scheduled dates customers can book."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full bg-olive px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-olive-deep"
          >
            + Add session
          </button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No sessions yet"
          description="Add a date so people can book this workshop."
          className="m-5"
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Date</TH>
              <TH>Time</TH>
              <TH>Capacity</TH>
              <TH>Available</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((s) => (
              <TR key={s.id}>
                <TD className="font-medium text-ink">{formatDate(s.date)}</TD>
                <TD className="text-ink-soft">
                  {s.start_time}–{s.end_time}
                </TD>
                <TD className="text-ink-soft">{s.capacity}</TD>
                <TD className="text-ink-soft">{s.available_spots}</TD>
                <TD className="text-right">
                  <div className="inline-flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ink/[0.04]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(s)}
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
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit session" : "Add session"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-clay/30 bg-clay/10 px-4 py-2.5 text-sm text-clay-deep">
              {error}
            </div>
          )}
          <Field label="Date" htmlFor="se-date" required>
            <Input
              id="se-date"
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start time" htmlFor="se-start">
              <Input
                id="se-start"
                type="time"
                value={form.start_time}
                onChange={(e) => setField("start_time", e.target.value)}
              />
            </Field>
            <Field label="End time" htmlFor="se-end">
              <Input
                id="se-end"
                type="time"
                value={form.end_time}
                onChange={(e) => setField("end_time", e.target.value)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Capacity" htmlFor="se-cap">
              <Input
                id="se-cap"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setField("capacity", Number(e.target.value))}
              />
            </Field>
            <Field label="Available spots" htmlFor="se-avail">
              <Input
                id="se-avail"
                type="number"
                min={0}
                value={form.available_spots}
                onChange={(e) =>
                  setField("available_spots", Number(e.target.value))
                }
              />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={closeModal}
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
              {editing ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete session?"
        message="This session date will be removed permanently."
        confirmLabel="Delete session"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Card>
  );
}
