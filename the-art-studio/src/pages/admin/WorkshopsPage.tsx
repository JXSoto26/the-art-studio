import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  ActiveBadge,
  FeaturedBadge,
} from "../../components/admin/ui/StatusBadge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/admin/ui/StateViews";
import { ConfirmDialog } from "../../components/admin/ui/Modal";
import { Button } from "../../components/ui/Button";
import {
  formatCurrency,
  formatDuration,
  titleCase,
} from "../../lib/admin/format";
import type { Workshop } from "../../lib/admin/types";

export function WorkshopsPage() {
  const { workshops, sessions, loading, error, refresh, deleteWorkshop } =
    useAdminData();
  const navigate = useNavigate();

  const [toDelete, setToDelete] = useState<Workshop | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sessionCount = (workshopId: string) =>
    sessions.filter((s) => s.workshop_id === workshopId).length;

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteWorkshop(toDelete.id);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const newButton = (
    <Button to="/admin/workshops/new" variant="primary" size="md">
      + New workshop
    </Button>
  );

  return (
    <>
      <AdminPageHeader
        title="Workshops"
        description="Create and manage the classes shown on your site."
        actions={workshops.length > 0 ? newButton : undefined}
      />

      {loading ? (
        <Card className="p-2">
          <LoadingState label="Loading workshops…" />
        </Card>
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : workshops.length === 0 ? (
        <EmptyState
          title="No workshops yet"
          description="Create your first workshop to start taking bookings."
          action={newButton}
        />
      ) : (
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Workshop</TH>
                <TH>Category</TH>
                <TH>Price</TH>
                <TH>Duration</TH>
                <TH>Sessions</TH>
                <TH>Status</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {workshops.map((w) => (
                <TR key={w.id}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink">{w.title}</p>
                      {w.featured && <FeaturedBadge />}
                    </div>
                    <p className="text-xs text-ink-soft">/{w.slug}</p>
                  </TD>
                  <TD className="text-ink-soft">{titleCase(w.category)}</TD>
                  <TD className="text-ink-soft">{formatCurrency(w.price)}</TD>
                  <TD className="text-ink-soft">
                    {formatDuration(w.duration_minutes)}
                  </TD>
                  <TD className="text-ink-soft">{sessionCount(w.id)}</TD>
                  <TD>
                    <ActiveBadge active={w.is_active} />
                  </TD>
                  <TD className="text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/workshops/${w.id}/edit`)}
                        className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ink/[0.04]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(w)}
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

      <p className="mt-4 text-sm text-ink-soft">
        Tip: add and manage session dates from a workshop's{" "}
        <Link to="/admin/workshops" className="text-olive hover:underline">
          edit page
        </Link>
        .
      </p>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete workshop?"
        message={`"${toDelete?.title}" and its sessions will be permanently removed. This can't be undone.`}
        confirmLabel="Delete workshop"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
