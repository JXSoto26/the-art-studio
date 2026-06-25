import { useEffect, useState, type FormEvent } from "react";
import { useAdminData } from "../../lib/admin/AdminDataProvider";
import { AdminPageHeader } from "../../components/admin/ui/AdminPageHeader";
import { Card, CardBody, CardHeader } from "../../components/admin/ui/Card";
import { Field, Input, Textarea } from "../../components/admin/ui/Form";
import {
  ErrorState,
  LoadingState,
} from "../../components/admin/ui/StateViews";
import type { SiteSettings } from "../../lib/admin/types";

export function SettingsPage() {
  const { settings, loading, error, refresh, updateSettings } = useAdminData();

  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (loading || !form) {
    if (error) return <ErrorState message={error} onRetry={refresh} />;
    return <LoadingState label="Loading settings…" />;
  }

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaveError(null);
    setSaving(true);
    try {
      await updateSettings(form);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Content and contact details used across the public site."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {saveError && <ErrorState message={saveError} />}

        <Card>
          <CardHeader title="Hero" description="The first thing visitors see." />
          <CardBody className="space-y-5">
            <Field label="Hero title" htmlFor="hero-title">
              <Input
                id="hero-title"
                value={form.hero_title}
                onChange={(e) => set("hero_title", e.target.value)}
              />
            </Field>
            <Field label="Hero subtitle" htmlFor="hero-sub">
              <Textarea
                id="hero-sub"
                rows={2}
                value={form.hero_subtitle}
                onChange={(e) => set("hero_subtitle", e.target.value)}
              />
            </Field>
            <Field
              label="Hero image URL"
              htmlFor="hero-img"
              hint="Paste a hosted image URL."
            >
              <Input
                id="hero-img"
                value={form.hero_image_url}
                onChange={(e) => set("hero_image_url", e.target.value)}
                placeholder="https://…"
              />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Contact & hours"
            description="Shown in the footer and contact page."
          />
          <CardBody className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" htmlFor="set-email">
              <Input
                id="set-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
            <Field label="WhatsApp number" htmlFor="set-wa">
              <Input
                id="set-wa"
                value={form.whatsapp_number}
                onChange={(e) => set("whatsapp_number", e.target.value)}
              />
            </Field>
            <Field label="Address" htmlFor="set-addr" className="sm:col-span-2">
              <Input
                id="set-addr"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>
            <Field label="Business hours" htmlFor="set-hours">
              <Input
                id="set-hours"
                value={form.business_hours}
                onChange={(e) => set("business_hours", e.target.value)}
              />
            </Field>
            <Field label="Instagram URL" htmlFor="set-ig">
              <Input
                id="set-ig"
                value={form.instagram_url}
                onChange={(e) => set("instagram_url", e.target.value)}
                placeholder="https://instagram.com/…"
              />
            </Field>
          </CardBody>
        </Card>

        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="text-sm font-medium text-olive">
              ✓ Settings saved
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-olive px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-olive-deep disabled:opacity-60"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/40 border-t-ivory" />
            )}
            Save settings
          </button>
        </div>
      </form>
    </>
  );
}
