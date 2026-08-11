"use client";

import { ChevronDown, ChevronUp, ListChecks, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminInput,
  AdminLoading,
  AdminPage,
  AdminStatus,
  AdminTextarea,
} from "@/components/admin/ui";
import { revalidateContent } from "@/app/actions/revalidate";
import { approachDefaults } from "@/lib/site";
import { supabase } from "@/lib/supabase";

/**
 * "A process you can hold us to" editor.
 *
 * One `approach_content` row holding `{ heading, items }`. The step number (01,
 * 02…) is derived from order on the public site, so it isn't edited here — moving
 * a phase up or down renumbers it automatically. Empty list falls back to the
 * built-in defaults.
 */

interface PhaseDraft {
  id: string;
  title: string;
  duration: string;
  summary: string;
  deliverable: string;
}

function blankPhase(): PhaseDraft {
  return {
    id: crypto.randomUUID(),
    title: "",
    duration: "",
    summary: "",
    deliverable: "",
  };
}

export default function AdminApproachPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    state: "idle" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });

  const [eyebrow, setEyebrow] = useState("");
  const [title, setTitle] = useState("");
  const [lede, setLede] = useState("");
  const [items, setItems] = useState<PhaseDraft[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("site_config")
      .select("content")
      .eq("id", "approach_content")
      .maybeSingle();

    // Pre-fill from the live defaults when nothing is saved yet, so the editor
    // opens showing the content currently on the site rather than a blank form.
    const content = data?.content ?? {};
    const h = content.heading ?? approachDefaults.heading;
    const rawItems = Array.isArray(content.items) ? content.items : null;

    setEyebrow(h.eyebrow ?? "");
    setTitle(h.title ?? "");
    setLede(h.lede ?? "");
    setItems(
      (rawItems ?? approachDefaults.items).map((item: Record<string, unknown>) => ({
        ...blankPhase(),
        ...item,
        id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function update(id: string, patch: Partial<PhaseDraft>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    setStatus({ state: "idle" });
  }

  function move(index: number, direction: -1 | 1) {
    setItems((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
    setStatus({ state: "idle" });
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus({ state: "idle" });

    try {
      const unnamed = items.findIndex((item) => !item.title.trim());
      if (unnamed !== -1) {
        setStatus({
          state: "error",
          message: `Phase ${unnamed + 1} needs a title before you can save.`,
        });
        setSaving(false);
        return;
      }

      const resolved = items.map((item) => ({
        id: item.id,
        title: item.title.trim(),
        duration: item.duration.trim(),
        summary: item.summary.trim(),
        deliverable: item.deliverable.trim(),
      }));

      const { error } = await supabase.from("site_config").upsert({
        id: "approach_content",
        content: {
          heading: { eyebrow: eyebrow.trim(), title: title.trim(), lede: lede.trim() },
          items: resolved,
        },
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      await revalidateContent("approach");
      setStatus({
        state: "saved",
        message:
          resolved.length === 0
            ? "Saved. With no phases, the section shows the built-in defaults."
            : `Saved ${resolved.length} phase${resolved.length === 1 ? "" : "s"}.`,
      });
      await load();
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Could not save.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoading label="Loading process…" />;

  return (
    <AdminPage
      title="A process you can hold us to"
      description="The delivery phases on the homepage. Step numbers follow the order below. Leave the list empty to fall back to the built-in defaults."
      actions={
        <AdminButton
          variant="secondary"
          onClick={() => setItems((current) => [...current, blankPhase()])}
        >
          <Plus size={15} aria-hidden />
          Add phase
        </AdminButton>
      }
    >
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <AdminCard
          title="Section heading"
          icon={ListChecks}
          description="The eyebrow, title and intro shown above the phases."
        >
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminInput
                label="Eyebrow"
                value={eyebrow}
                onChange={(event) => setEyebrow(event.target.value)}
                placeholder="Approach"
              />
              <AdminInput
                label="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="A process you can hold us to"
              />
            </div>
            <AdminTextarea
              label="Intro"
              value={lede}
              onChange={(event) => setLede(event.target.value)}
              rows={2}
              placeholder="A sentence introducing the phases."
            />
          </div>
        </AdminCard>

        {items.length === 0 ? (
          <AdminEmptyState
            title="No phases"
            description="The homepage will show the built-in default phases. Add one to override them."
            action={
              <AdminButton
                variant="secondary"
                onClick={() => setItems([blankPhase()])}
              >
                <Plus size={15} aria-hidden />
                Add the first phase
              </AdminButton>
            }
          />
        ) : (
          items.map((item, index) => (
            <AdminCard
              key={item.id}
              title={`${String(index + 1).padStart(2, "0")} · ${item.title.trim() || `Phase ${index + 1}`}`}
              footer={
                <>
                  <div className="flex items-center gap-1">
                    <AdminButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ChevronUp size={15} aria-hidden />
                      <span className="sr-only">Move up</span>
                    </AdminButton>
                    <AdminButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ChevronDown size={15} aria-hidden />
                      <span className="sr-only">Move down</span>
                    </AdminButton>
                    <span className="ml-1 text-xs text-fg-subtle">
                      Position {index + 1} of {items.length}
                    </span>
                  </div>
                  <AdminButton
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      setItems((current) =>
                        current.filter((entry) => entry.id !== item.id),
                      )
                    }
                  >
                    <Trash2 size={14} aria-hidden />
                    Remove
                  </AdminButton>
                </>
              }
            >
              <div className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <AdminInput
                    label="Title"
                    value={item.title}
                    onChange={(event) => update(item.id, { title: event.target.value })}
                    placeholder="Scope"
                    required
                  />
                  <AdminInput
                    label="Duration"
                    value={item.duration}
                    onChange={(event) =>
                      update(item.id, { duration: event.target.value })
                    }
                    placeholder="1–2 weeks"
                    hint="Shown top-right of the card. Optional."
                  />
                </div>
                <AdminTextarea
                  label="Summary"
                  value={item.summary}
                  onChange={(event) => update(item.id, { summary: event.target.value })}
                  rows={3}
                  placeholder="What happens in this phase."
                />
                <AdminInput
                  label="Deliverable"
                  value={item.deliverable}
                  onChange={(event) =>
                    update(item.id, { deliverable: event.target.value })
                  }
                  placeholder="What the client receives at the end."
                  hint="Shown under a “You receive” label. Optional."
                  wide
                />
              </div>
            </AdminCard>
          ))
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <AdminStatus state={status.state} message={status.message} />
          <AdminButton type="submit" busy={saving}>
            {saving ? "Saving…" : "Save process"}
          </AdminButton>
        </div>
      </form>
    </AdminPage>
  );
}
