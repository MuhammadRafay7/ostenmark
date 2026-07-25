"use client";

import {
  FolderKanban,
  Pencil,
  Plus,
  Smartphone,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  AdminButton,
  AdminCard,
  AdminCheckbox,
  AdminDialog,
  AdminEmptyState,
  AdminInput,
  AdminLoading,
  AdminPage,
  AdminSelect,
  AdminStatus,
  AdminTextarea,
} from "@/components/admin/ui";
import { revalidateContent } from "@/app/actions/revalidate";
import { cn } from "@/lib/cn";
import { supabase } from "@/lib/supabase";

/**
 * Case-study editor.
 *
 * One behavioural fix beyond the restyle: the original called the
 * `increment_order_indices` RPC on **every** save, including edits. That shifts
 * every other project's rank down by one each time you edit an existing project,
 * so repeatedly saving the same entry silently inflated the whole ordering. The
 * RPC now runs only when inserting a new project, which is the case it was written
 * for.
 *
 * Errors also surface inline instead of through `alert()`.
 */

const CATEGORIES = ["Web", "Mobile", "Design"];

interface ProjectRow {
  id: string;
  title: string;
  category: string;
  description: string | null;
  cover_image: string | null;
  stack: string[] | null;
  live_link: string | null;
  apk_url: string | null;
  featured: boolean;
  order_index: number;
}

function publicUrl(path: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl;
}

export default function AdminProjectsPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ProjectRow | null>(null);
  const [category, setCategory] = useState("Web");
  const [coverPreview, setCoverPreview] = useState("");
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [deleting, setDeleting] = useState<ProjectRow | null>(null);
  const [filter, setFilter] = useState("All");
  const [status, setStatus] = useState<{
    state: "idle" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      setStatus({ state: "error", message: `Could not load projects: ${error.message}` });
    } else {
      setProjects(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = useCallback((project: ProjectRow) => {
    setEditing(project);
    setCategory(project.category || "Web");
    setCoverPreview("");
    setApkFile(null);
    setStatus({ state: "idle" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const reset = useCallback(() => {
    setEditing(null);
    setCategory("Web");
    setCoverPreview("");
    setApkFile(null);
    formRef.current?.reset();
  }, []);

  async function uploadFile(file: File, folder: string) {
    const extension = file.name.split(".").pop() ?? "bin";
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) throw error;
    return path;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus({ state: "idle" });

    const formData = new FormData(event.currentTarget);

    try {
      const rank = Number.parseInt(String(formData.get("orderIndex")), 10) || 0;

      // Only shift other projects when inserting. On an edit the record already
      // occupies a slot, so shifting would move everything else every save.
      if (!editing) {
        const { error } = await supabase.rpc("increment_order_indices", {
          start_rank: rank,
        });
        if (error) throw error;
      }

      const coverFile = formData.get("coverFile") as File | null;
      let coverPath = editing?.cover_image ?? "";
      if (coverFile && coverFile.size > 0) {
        coverPath = await uploadFile(coverFile, "projects");
      }

      let apkPath = editing?.apk_url ?? "";
      if (apkFile) apkPath = await uploadFile(apkFile, "builds");

      const payload = {
        title: String(formData.get("title") ?? "").trim(),
        category,
        description: String(formData.get("description") ?? "").trim(),
        live_link: String(formData.get("liveLink") ?? "").trim(),
        apk_url: apkPath,
        stack: String(formData.get("stack") ?? "")
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
        featured: formData.get("featured") === "on",
        cover_image: coverPath,
        order_index: rank,
        updated_at: new Date().toISOString(),
      };

      const { error } = editing
        ? await supabase.from("projects").update(payload).eq("id", editing.id)
        : await supabase.from("projects").insert([payload]);
      if (error) throw error;

      await revalidateContent("projects");
      setStatus({
        state: "saved",
        message: editing ? `"${payload.title}" updated.` : `"${payload.title}" added.`,
      });
      reset();
      await load();
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Could not save the project.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);

    const { error } = await supabase.from("projects").delete().eq("id", target.id);
    if (error) {
      setStatus({ state: "error", message: `Could not delete: ${error.message}` });
    } else {
      await revalidateContent("projects");
      setStatus({ state: "saved", message: `"${target.title}" deleted.` });
      if (editing?.id === target.id) reset();
      await load();
    }
  }

  if (loading) return <AdminLoading label="Loading projects…" />;

  const categories = ["All", ...new Set(projects.map((p) => p.category).filter(Boolean))];
  const visible =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <AdminPage
      title="Work"
      description="Case studies shown on the homepage and the work index. Featured projects appear on the homepage."
      actions={
        editing ? (
          <AdminButton variant="secondary" onClick={reset}>
            <X size={15} aria-hidden />
            Cancel edit
          </AdminButton>
        ) : undefined
      }
    >
      <AdminDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleting?.title ?? ""}"?`}
        description="This permanently removes the project and its case-study page. This can't be undone."
        confirmLabel="Delete project"
        destructive
      />

      <AdminCard
        title={editing ? `Editing: ${editing.title}` : "Add a project"}
        icon={FolderKanban}
        description={
          editing
            ? "Changes apply as soon as you save. Leave the image fields alone to keep the current files."
            : "Only the title is strictly required, but a cover image and description make a far better case study."
        }
      >
        <form
          key={editing?.id ?? "new"}
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminInput
              label="Project title"
              name="title"
              defaultValue={editing?.title ?? ""}
              placeholder="Occuin"
              required
            />
            <AdminSelect
              label="Category"
              options={CATEGORIES}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
            <AdminInput
              label="Display order"
              name="orderIndex"
              type="number"
              min={0}
              defaultValue={editing?.order_index ?? 0}
              hint="Lower numbers appear first."
            />
            <AdminInput
              label={category === "Mobile" ? "App store URL" : "Live site URL"}
              name="liveLink"
              type="url"
              defaultValue={editing?.live_link ?? ""}
              placeholder="https://…"
            />
            <AdminInput
              label="Tech stack"
              name="stack"
              defaultValue={editing?.stack?.join(", ") ?? ""}
              placeholder="Next.js, TypeScript, PostgreSQL"
              hint="Comma separated."
              wide
            />
            <AdminTextarea
              label="Description"
              name="description"
              defaultValue={editing?.description ?? ""}
              rows={5}
              hint="What the product does and what problem it solves. Separate paragraphs with a blank line."
            />
          </div>

          {/* Files */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="coverFile" className="text-sm font-medium text-fg">
                Cover image
              </label>
              <p className="text-xs text-fg-subtle">
                Used on the cards and at the top of the case study. Landscape, 16:10 or wider.
              </p>
              <div className="mt-1 flex items-center gap-3">
                <div className="grid h-20 w-32 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-canvas">
                  {coverPreview || editing?.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS host plus object URLs
                    <img
                      src={coverPreview || publicUrl(editing?.cover_image ?? null)}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-fg-subtle">None</span>
                  )}
                </div>
                <input
                  id="coverFile"
                  type="file"
                  name="coverFile"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setCoverPreview(URL.createObjectURL(file));
                  }}
                  className="block w-full text-sm text-fg-muted file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-line-strong file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-fg hover:file:bg-surface-sunken"
                />
              </div>
            </div>

            {/* Android build, only relevant to mobile projects. */}
            {category === "Mobile" ? (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="apkFile" className="text-sm font-medium text-fg">
                  Android build (.apk)
                </label>
                <p className="text-xs text-fg-subtle">
                  Optional. Adds a download button to the case study.
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <div className="grid h-20 w-32 shrink-0 place-items-center rounded-md border border-line bg-canvas px-2 text-center">
                    {apkFile ? (
                      <span className="truncate text-xs text-fg">{apkFile.name}</span>
                    ) : editing?.apk_url ? (
                      <span className="text-xs text-positive">Build attached</span>
                    ) : (
                      <Smartphone size={18} aria-hidden className="text-fg-subtle" />
                    )}
                  </div>
                  <input
                    id="apkFile"
                    type="file"
                    accept=".apk"
                    onChange={(event) => setApkFile(event.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-fg-muted file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-line-strong file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-fg hover:file:bg-surface-sunken"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-5 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <AdminCheckbox
              label="Feature on the homepage"
              description="Featured projects appear in the homepage work grid."
              name="featured"
              defaultChecked={editing?.featured ?? false}
            />
            <div className="flex items-center gap-3">
              <AdminButton type="submit" busy={saving}>
                {saving
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Add project"}
              </AdminButton>
              {!editing ? null : (
                <AdminButton type="button" variant="secondary" onClick={reset}>
                  Cancel
                </AdminButton>
              )}
            </div>
          </div>

          <AdminStatus state={status.state} message={status.message} />
        </form>
      </AdminCard>

      {/* Index */}
      <AdminCard
        title={`All projects (${projects.length})`}
        description="Click edit to load a project into the form above."
      >
        {categories.length > 2 ? (
          <div className="mb-5 flex flex-wrap gap-1.5">
            {categories.map((entry) => {
              const active = filter === entry;
              const count =
                entry === "All"
                  ? projects.length
                  : projects.filter((p) => p.category === entry).length;
              return (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setFilter(entry)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-accent bg-accent text-fg-on-accent"
                      : "border-line bg-canvas text-fg-muted hover:text-fg",
                  )}
                >
                  {entry}
                  <span className="font-mono text-2xs">{count}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {visible.length === 0 ? (
          <AdminEmptyState
            title={projects.length === 0 ? "No projects yet" : `No ${filter} projects`}
            description={
              projects.length === 0
                ? "Add your first case study using the form above."
                : "Try another category."
            }
            action={
              projects.length === 0 ? undefined : (
                <AdminButton variant="secondary" size="sm" onClick={() => setFilter("All")}>
                  Show all
                </AdminButton>
              )
            }
          />
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {visible.map((project) => (
              <li
                key={project.id}
                className={cn(
                  "flex flex-wrap items-center gap-4 py-3",
                  editing?.id === project.id && "-mx-3 rounded-md bg-accent-subtle px-3",
                )}
              >
                <div className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-canvas">
                  {project.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS host
                    <img
                      src={publicUrl(project.cover_image)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xs text-fg-subtle">—</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-fg">
                    {project.title}
                    {project.featured ? (
                      <>
                        <Star
                          size={12}
                          aria-hidden
                          className="shrink-0 fill-accent text-accent"
                        />
                        <span className="sr-only">Featured</span>
                      </>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-fg-subtle">
                    {project.category} · order {project.order_index}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(project)}
                  >
                    <Pencil size={14} aria-hidden />
                    <span className="sr-only sm:not-sr-only">Edit</span>
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleting(project)}
                    className="text-fg-subtle hover:bg-critical/10 hover:text-critical"
                  >
                    <Trash2 size={14} aria-hidden />
                    <span className="sr-only">Delete {project.title}</span>
                  </AdminButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      {!editing ? (
        <p className="flex items-center gap-2 text-sm text-fg-subtle">
          <Plus size={14} aria-hidden />
          Scroll up to add another project.
        </p>
      ) : null}
    </AdminPage>
  );
}
