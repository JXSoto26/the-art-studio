import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAdminData } from "../../lib/admin/AdminDataProvider";
import { AdminPageHeader } from "../../components/admin/ui/AdminPageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/admin/ui/StateViews";
import { FeaturedBadge } from "../../components/admin/ui/StatusBadge";
import { ConfirmDialog, Modal } from "../../components/admin/ui/Modal";
import { Field, Input, Toggle } from "../../components/admin/ui/Form";
import { cn } from "../../lib/cn";
import type { GalleryItem, GalleryItemInput } from "../../lib/admin/types";

function emptyItem(order: number): GalleryItemInput {
  return {
    title: "",
    image_url: "",
    category: "painting",
    featured: false,
    display_order: order,
  };
}

export function GalleryPage() {
  const {
    gallery,
    loading,
    error,
    refresh,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
  } = useAdminData();

  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<GalleryItemInput>(emptyItem(1));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const modalOpen = creating || editing !== null;

  function openCreate() {
    setForm(emptyItem(gallery.length + 1));
    setFormError(null);
    setCreating(true);
  }

  function openEdit(item: GalleryItem) {
    const { id, created_at, ...rest } = item;
    void id;
    void created_at;
    setForm(rest);
    setFormError(null);
    setEditing(item);
  }

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  function setField<K extends keyof GalleryItemInput>(
    key: K,
    value: GalleryItemInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField("image_url", String(reader.result));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim()) {
      setFormError("Please add a title.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateGalleryItem(editing.id, form);
      } else {
        await createGalleryItem(form);
      }
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteGalleryItem(toDelete.id);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const addButton = (
    <button
      type="button"
      onClick={openCreate}
      className="rounded-full bg-olive px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-olive-deep"
    >
      + Add image
    </button>
  );

  return (
    <>
      <AdminPageHeader
        title="Gallery"
        description="Curate the work shown on your public gallery."
        actions={gallery.length > 0 ? addButton : undefined}
      />

      {loading ? (
        <LoadingState label="Loading gallery…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : gallery.length === 0 ? (
        <EmptyState
          title="No gallery images"
          description="Add your first piece to showcase studio work."
          icon="🖼"
          action={addButton}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <figure
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-ink/10 bg-ivory shadow-sm"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-beige">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-olive/40 via-clay/30 to-beige text-sm text-ink-soft">
                    No image
                  </div>
                )}
                {item.featured && (
                  <span className="absolute left-3 top-3">
                    <FeaturedBadge />
                  </span>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-ivory/90 px-2 py-0.5 text-xs font-medium text-ink-soft">
                  #{item.display_order}
                </span>
              </div>
              <figcaption className="flex items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{item.title}</p>
                  <p className="text-xs capitalize text-ink-soft">
                    {item.category}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ink/[0.04]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(item)}
                    className="rounded-lg border border-clay/30 px-2.5 py-1.5 text-xs font-medium text-clay-deep transition-colors hover:bg-clay/10"
                  >
                    Delete
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit image" : "Add image"}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-clay/30 bg-clay/10 px-4 py-2.5 text-sm text-clay-deep">
              {formError}
            </div>
          )}

          {/* Preview */}
          <div
            className={cn(
              "flex aspect-[4/2] items-center justify-center overflow-hidden rounded-xl border border-ink/10",
              !form.image_url && "bg-beige/60",
            )}
          >
            {form.image_url ? (
              <img
                src={form.image_url}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm text-ink-soft">Image preview</span>
            )}
          </div>

          <Field label="Upload image" htmlFor="gal-file" hint="Or paste a URL below.">
            <input
              id="gal-file"
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-olive file:px-4 file:py-2 file:text-sm file:font-medium file:text-ivory hover:file:bg-olive-deep"
            />
          </Field>

          <Field label="Image URL" htmlFor="gal-url">
            <Input
              id="gal-url"
              value={form.image_url}
              onChange={(e) => setField("image_url", e.target.value)}
              placeholder="https://…"
            />
          </Field>

          <Field label="Title" htmlFor="gal-title" required>
            <Input
              id="gal-title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Morning Fields"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" htmlFor="gal-cat">
              <Input
                id="gal-cat"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                placeholder="painting"
              />
            </Field>
            <Field label="Display order" htmlFor="gal-order">
              <Input
                id="gal-order"
                type="number"
                min={1}
                value={form.display_order}
                onChange={(e) =>
                  setField("display_order", Number(e.target.value))
                }
              />
            </Field>
          </div>

          <Toggle
            label="Featured"
            description="Highlight on the homepage gallery preview."
            checked={form.featured}
            onChange={(v) => setField("featured", v)}
          />

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
              {editing ? "Save" : "Add image"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete image?"
        message={`"${toDelete?.title}" will be removed from the gallery.`}
        confirmLabel="Delete image"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
