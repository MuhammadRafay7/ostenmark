"use client";

import { BookOpen, ImageIcon, Upload, X, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminLoading,
  AdminPage,
  AdminStatus,
  AdminTextarea,
} from "@/components/admin/ui";
import { revalidateContent } from "@/app/actions/revalidate";
import { cn } from "@/lib/cn";
import { supabase } from "@/lib/supabase";

/**
 * Homepage and About page copy.
 *
 * Field labels are now the names of the things they control ("First headline
 * line", "Introduction") rather than invented system jargon ("Protocol Label",
 * "Experience Index", "Visual Asset Protocol"). Whoever edits this site should not
 * have to guess which field maps to which piece of the page.
 *
 * The read-modify-write on save is preserved from the original: each tab owns
 * only part of its `content` object, so a blind overwrite would delete fields
 * belonging to the capabilities editor.
 */

type Tab = "hero" | "about";

type Content = Record<string, string>;

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{
    state: "idle" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });

  const [hero, setHero] = useState<Content>({});
  const [about, setAbout] = useState<Content>({});
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const [heroRes, aboutRes] = await Promise.all([
      supabase
        .from("site_config")
        .select("content")
        .eq("id", "hero_content")
        .maybeSingle(),
      supabase
        .from("site_config")
        .select("content")
        .eq("id", "about_page_content")
        .maybeSingle(),
    ]);

    setHero(heroRes.data?.content ?? {});
    setAbout(aboutRes.data?.content ?? {});
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus({ state: "idle" });
    try {
      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `uploads/about-${Date.now()}.${extension}`;
      const { error } = await supabase.storage
        .from("site-assets")
        .upload(path, file);
      if (error) throw error;

      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      setAbout((current) => ({ ...current, imageUrl: data.publicUrl }));
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error
            ? `Upload failed: ${error.message}`
            : "Upload failed. Check that a 'site-assets' storage bucket exists.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus({ state: "idle" });

    const rowId = tab === "hero" ? "hero_content" : "about_page_content";
    const payload = tab === "hero" ? hero : about;

    try {
      const { data: existing } = await supabase
        .from("site_config")
        .select("content")
        .eq("id", rowId)
        .maybeSingle();

      const { error } = await supabase.from("site_config").upsert({
        id: rowId,
        content: { ...(existing?.content ?? {}), ...payload },
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      // The hero lives on the settings row; the About copy on its own.
      await revalidateContent(tab === "hero" ? "settings" : "about");
      setStatus({
        state: "saved",
        message: `${tab === "hero" ? "Homepage" : "About page"} content saved.`,
      });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Could not save changes.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoading label="Loading content…" />;

  const setHeroField = (key: string) => (event: { target: { value: string } }) =>
    setHero((current) => ({ ...current, [key]: event.target.value }));
  const setAboutField = (key: string) => (event: { target: { value: string } }) =>
    setAbout((current) => ({ ...current, [key]: event.target.value }));

  return (
    <AdminPage
      title="Content"
      description="Copy for the homepage hero and the About page. Everything else on those pages is set in code — see the README."
    >
      {/* Tabs. Implemented with the tab role so arrow-key semantics and the
          selected state are announced correctly. */}
      <div role="tablist" aria-label="Content section" className="flex gap-1">
        {(
          [
            { id: "hero", label: "Homepage hero", icon: Zap },
            { id: "about", label: "About page", icon: BookOpen },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={tab === item.id}
            onClick={() => {
              setTab(item.id);
              setStatus({ state: "idle" });
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
              tab === item.id
                ? "bg-accent-subtle text-accent"
                : "text-fg-muted hover:bg-surface hover:text-fg",
            )}
          >
            <item.icon size={15} aria-hidden />
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {tab === "hero" ? (
          <AdminCard
            title="Homepage hero"
            icon={Zap}
            description="The first thing a visitor reads. The headline renders as one sentence across two lines, with the second line in the accent colour."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminInput
                label="Eyebrow label"
                hint="Small label above the headline."
                value={hero.upperLabel ?? ""}
                onChange={setHeroField("upperLabel")}
                placeholder="Product engineering studio"
              />
              <AdminInput
                label="Availability"
                hint="Shown next to a green dot in the hero and footer."
                value={hero.availability ?? ""}
                onChange={setHeroField("availability")}
                placeholder="Available for new projects"
              />
              <AdminInput
                label="First headline line"
                value={hero.mainTitleLine1 ?? ""}
                onChange={setHeroField("mainTitleLine1")}
                placeholder="Software teams for companies"
              />
              <AdminInput
                label="Second headline line"
                hint="Rendered in the accent colour."
                value={hero.mainTitleLine2 ?? ""}
                onChange={setHeroField("mainTitleLine2")}
                placeholder="that need it shipped properly."
              />
              <AdminTextarea
                label="Supporting paragraph"
                hint="One or two sentences under the headline."
                value={hero.subtext ?? ""}
                onChange={setHeroField("subtext")}
                rows={4}
              />
            </div>
          </AdminCard>
        ) : (
          <>
            <AdminCard
              title="About page copy"
              icon={BookOpen}
              description="The heading renders as one sentence across two lines, with the second part in the accent colour."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <AdminInput
                  label="First heading line"
                  value={about.headlineLine1 ?? ""}
                  onChange={setAboutField("headlineLine1")}
                  placeholder="How we"
                />
                <AdminInput
                  label="Second heading line"
                  hint="Rendered in the accent colour."
                  value={about.headlineLine2 ?? ""}
                  onChange={setAboutField("headlineLine2")}
                  placeholder="work."
                />
                <AdminInput
                  label="Years of experience"
                  hint="A number. Leave blank to hide the experience figure."
                  value={about.experienceYears ?? ""}
                  onChange={setAboutField("experienceYears")}
                  placeholder="8"
                />
                <AdminTextarea
                  label="Introduction"
                  hint="The paragraph directly under the heading."
                  value={about.subheading ?? ""}
                  onChange={setAboutField("subheading")}
                  rows={3}
                />
                <AdminTextarea
                  label="Main narrative"
                  hint="Separate paragraphs with a blank line — they'll render as separate paragraphs."
                  value={about.philosophy ?? ""}
                  onChange={setAboutField("philosophy")}
                  rows={8}
                />
              </div>
            </AdminCard>

            <AdminCard
              title="About image"
              icon={ImageIcon}
              description="Displayed at the top of the About page in a 16:9 frame. A landscape photo works best."
            >
              <div className="flex flex-wrap items-center gap-5">
                <div className="relative grid h-24 w-40 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-canvas">
                  {about.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS host
                    <img
                      src={about.imageUrl}
                      alt="About image preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-fg-subtle">No image</span>
                  )}
                  {uploading ? (
                    <div className="absolute inset-0 grid place-items-center bg-canvas/80 text-xs text-fg-muted">
                      Uploading…
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  <AdminButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    busy={uploading}
                    onClick={() => fileInput.current?.click()}
                  >
                    <Upload size={14} aria-hidden />
                    {about.imageUrl ? "Replace image" : "Upload image"}
                  </AdminButton>

                  {about.imageUrl ? (
                    <AdminButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setAbout((current) => ({ ...current, imageUrl: "" }))
                      }
                    >
                      <X size={14} aria-hidden />
                      Remove
                    </AdminButton>
                  ) : null}
                </div>
              </div>
            </AdminCard>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <AdminStatus state={status.state} message={status.message} />
          <AdminButton type="submit" busy={saving}>
            {saving ? "Saving…" : "Save changes"}
          </AdminButton>
        </div>
      </form>
    </AdminPage>
  );
}
