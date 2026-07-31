"use client";

import { Layers, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminLoading,
  AdminPage,
  AdminStatus,
} from "@/components/admin/ui";
import { DragHandle, sortableRowClass, useReorder } from "@/components/admin/sortable";
import { revalidateContent } from "@/app/actions/revalidate";
import { cn } from "@/lib/cn";
import { supabase } from "@/lib/supabase";

/**
 * Capability tags shown on the Expertise and About pages.
 *
 * Stored on the `about_page_content` row (not a row of its own), which is why the
 * save does a read-modify-write — the About copy editor owns the other fields in
 * the same object.
 *
 * The stored array's order is the display order, so the list is drag-sortable.
 * Unlike Work, nothing here writes until you press Save — the whole page is one
 * pending edit, and reordering joins it rather than fighting it.
 */
export default function AdminStackPage() {
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{
    state: "idle" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("site_config")
      .select("content")
      .eq("id", "about_page_content")
      .maybeSingle();

    const capabilities = data?.content?.capabilities;
    if (Array.isArray(capabilities)) setItems(capabilities);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;

    // Case-insensitive duplicate check: "React" and "react" are the same tag,
    // and showing both looks like an oversight.
    if (items.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setStatus({ state: "error", message: `"${value}" is already in the list.` });
      return;
    }

    setItems((current) => [...current, value]);
    setDraft("");
    setDirty(true);
    setStatus({ state: "idle" });
  }

  const { getItemProps, move } = useReorder({
    items,
    onReorder: (next) => {
      setItems(next);
      setDirty(true);
      setStatus({ state: "idle" });
    },
  });

  async function handleSave() {
    setSaving(true);
    setStatus({ state: "idle" });

    try {
      const { data: existing } = await supabase
        .from("site_config")
        .select("content")
        .eq("id", "about_page_content")
        .maybeSingle();

      const { error } = await supabase.from("site_config").upsert({
        id: "about_page_content",
        content: { ...(existing?.content ?? {}), capabilities: items },
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      await revalidateContent("about");
      setDirty(false);
      setStatus({ state: "saved", message: "Capabilities saved." });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Could not save.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoading label="Loading capabilities…" />;

  return (
    <AdminPage
      title="Capabilities"
      description="Tools and technologies listed on the Expertise and About pages. The main stack rationale on the Expertise page is set in code."
    >
      <AdminCard
        title="Add a capability"
        icon={Layers}
        description="Short names work best — a technology or discipline, not a sentence."
      >
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="capability" className="sr-only">
              Capability name
            </label>
            <input
              id="capability"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="PostgreSQL"
              maxLength={60}
              className="w-full rounded-md border border-line-strong bg-canvas px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring"
            />
          </div>
          <AdminButton type="submit" variant="secondary">
            <Plus size={15} aria-hidden />
            Add
          </AdminButton>
        </form>
      </AdminCard>

      <AdminCard
        title={`Current list (${items.length})`}
        description="These appear in the order shown here — drag a tag to move it. Changes save when you press Save."
      >
        {items.length === 0 ? (
          <AdminEmptyState
            title="No capabilities yet"
            description="Add a few above. The sections that use them are hidden while the list is empty."
          />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <li
                key={item}
                {...getItemProps(index)}
                className={cn(
                  "inline-flex cursor-grab items-center gap-1 rounded-full border border-line bg-canvas py-1 pl-1 pr-1 text-sm text-fg active:cursor-grabbing",
                  sortableRowClass,
                  "data-[drop-target]:border-accent data-[drop-target]:shadow-none",
                )}
              >
                <DragHandle
                  label={item}
                  index={index}
                  count={items.length}
                  onMove={move}
                  className="h-6 w-5 rounded-full"
                />
                {item}
                <button
                  type="button"
                  onClick={() => {
                    setItems((current) => current.filter((entry) => entry !== item));
                    setDirty(true);
                    setStatus({ state: "idle" });
                  }}
                  className="grid h-6 w-6 place-items-center rounded-full text-fg-subtle transition-colors hover:bg-critical/10 hover:text-critical"
                >
                  <X size={13} aria-hidden />
                  <span className="sr-only">Remove {item}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {status.state === "idle" && dirty ? (
          <p className="text-sm text-fg-muted">Unsaved changes.</p>
        ) : (
          <AdminStatus state={status.state} message={status.message} />
        )}
        <AdminButton onClick={handleSave} busy={saving}>
          {saving ? "Saving…" : "Save capabilities"}
        </AdminButton>
      </div>
    </AdminPage>
  );
}
