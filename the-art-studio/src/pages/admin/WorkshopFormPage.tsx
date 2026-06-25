import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminData } from "../../lib/admin/AdminDataProvider";
import { AdminPageHeader } from "../../components/admin/ui/AdminPageHeader";
import { Card, CardBody, CardHeader } from "../../components/admin/ui/Card";
import {
  Field,
  Input,
  Select,
  Textarea,
  Toggle,
} from "../../components/admin/ui/Form";
import {
  ErrorState,
  LoadingState,
} from "../../components/admin/ui/StateViews";
import { slugify } from "../../lib/admin/format";
import type {
  SkillLevel,
  Workshop,
  WorkshopCategory,
  WorkshopInput,
} from "../../lib/admin/types";
import { SessionsManager } from "../../components/admin/SessionsManager";

const CATEGORIES: WorkshopCategory[] = [
  "painting",
  "ceramics",
  "printmaking",
  "textiles",
];
const LEVELS: SkillLevel[] = ["beginner", "intermediate", "advanced", "all"];

function emptyForm(): WorkshopInput {
  return {
    title: "",
    slug: "",
    description: "",
    short_description: "",
    price: 0,
    duration_minutes: 120,
    category: "painting",
    skill_level: "beginner",
    image_url: "",
    is_active: true,
    featured: false,
  };
}

function toInput(w: Workshop): WorkshopInput {
  const { id, created_at, updated_at, ...rest } = w;
  void id;
  void created_at;
  void updated_at;
  return rest;
}

export function WorkshopFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const {
    workshops,
    loading,
    createWorkshop,
    updateWorkshop,
  } = useAdminData();

  const existing = useMemo(
    () => (id ? workshops.find((w) => w.id === id) ?? null : null),
    [id, workshops],
  );

  const [form, setForm] = useState<WorkshopInput>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Populate the form once the workshop is available (edit mode).
  useEffect(() => {
    if (existing) {
      setForm(toInput(existing));
      setSlugTouched(true);
    }
  }, [existing]);

  function set<K extends keyof WorkshopInput>(key: K, value: WorkshopInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.slug.trim()) next.slug = "Slug is required.";
    if (!form.short_description.trim())
      next.short_description = "A short description is required.";
    if (form.price < 0) next.price = "Price can't be negative.";
    if (form.duration_minutes <= 0)
      next.duration_minutes = "Duration must be greater than zero.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateWorkshop(id, form);
      } else {
        const created = await createWorkshop(form);
        // Jump to the edit page so sessions can be added next.
        navigate(`/admin/workshops/${created.id}/edit`, { replace: true });
        return;
      }
      navigate("/admin/workshops");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  // Edit mode but the workshop genuinely doesn't exist.
  if (isEdit && !existing) {
    if (loading) return <LoadingState label="Loading workshop…" />;
    return (
      <ErrorState
        message="That workshop could not be found."
        onRetry={() => navigate("/admin/workshops")}
      />
    );
  }

  return (
    <>
      <AdminPageHeader
        title={isEdit ? "Edit workshop" : "New workshop"}
        description={
          isEdit
            ? "Update details and manage session dates."
            : "Add a new class to your studio."
        }
        actions={
          <Link
            to="/admin/workshops"
            className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink/[0.04]"
          >
            ← Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {saveError && <ErrorState message={saveError} />}

        <Card>
          <CardHeader title="Details" />
          <CardBody className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Title"
              htmlFor="title"
              required
              error={errors.title}
              className="sm:col-span-2"
            >
              <Input
                id="title"
                value={form.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                placeholder="e.g. Intro to Oil Painting"
              />
            </Field>

            <Field
              label="Slug"
              htmlFor="slug"
              required
              hint="Used in the public URL."
              error={errors.slug}
              className="sm:col-span-2"
            >
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                placeholder="intro-to-oil-painting"
              />
            </Field>

            <Field
              label="Short description"
              htmlFor="short"
              required
              hint="One line shown on cards."
              error={errors.short_description}
              className="sm:col-span-2"
            >
              <Input
                id="short"
                value={form.short_description}
                onChange={(e) => set("short_description", e.target.value)}
                placeholder="Mix, layer, and finish your first oil still life."
              />
            </Field>

            <Field
              label="Full description"
              htmlFor="desc"
              className="sm:col-span-2"
            >
              <Textarea
                id="desc"
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the workshop in detail…"
              />
            </Field>

            <Field label="Category" htmlFor="category">
              <Select
                id="category"
                value={form.category}
                onChange={(e) =>
                  set("category", e.target.value as WorkshopCategory)
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c[0].toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Skill level" htmlFor="level">
              <Select
                id="level"
                value={form.skill_level}
                onChange={(e) =>
                  set("skill_level", e.target.value as SkillLevel)
                }
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l === "all" ? "All levels" : l[0].toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Price (USD)"
              htmlFor="price"
              required
              error={errors.price}
            >
              <Input
                id="price"
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </Field>

            <Field
              label="Duration (minutes)"
              htmlFor="duration"
              required
              error={errors.duration_minutes}
            >
              <Input
                id="duration"
                type="number"
                min={1}
                value={form.duration_minutes}
                onChange={(e) =>
                  set("duration_minutes", Number(e.target.value))
                }
              />
            </Field>

            <Field
              label="Image URL"
              htmlFor="image"
              hint="Paste a hosted image URL (upload comes with Supabase)."
              className="sm:col-span-2"
            >
              <Input
                id="image"
                value={form.image_url}
                onChange={(e) => set("image_url", e.target.value)}
                placeholder="https://…"
              />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Visibility" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Toggle
              label="Active"
              description="Show this workshop on the public site."
              checked={form.is_active}
              onChange={(v) => set("is_active", v)}
            />
            <Toggle
              label="Featured"
              description="Highlight in the featured section."
              checked={form.featured}
              onChange={(v) => set("featured", v)}
            />
          </CardBody>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/admin/workshops"
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink/[0.04]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-olive px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-olive-deep disabled:opacity-60"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/40 border-t-ivory" />
            )}
            {isEdit ? "Save changes" : "Create workshop"}
          </button>
        </div>
      </form>

      {/* Sessions are managed once the workshop exists. */}
      {isEdit && existing && (
        <div className="mt-8">
          <SessionsManager workshopId={existing.id} />
        </div>
      )}
    </>
  );
}
