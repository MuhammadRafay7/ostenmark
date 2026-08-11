"use client";

import { ChevronDown, ChevronUp, Handshake, Plus, Trash2 } from "lucide-react";
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
import { engagementDefaults } from "@/lib/site";
import { supabase } from "@/lib/supabase";

/**
 * "Ways to work with us" editor.
 *
 * One `engagement_content` row holding `{ heading, items }`. Each model lists
 * what's included as one-per-line text. Empty list falls back to the built-in
 * defaults.
 */

interface ModelDraft {
  id: string;
  name: string;
  duration: string;
  summary: string;
  /** Edited as one-per-line text; split to an array on save. */
  includes: string;
}

function blankModel(): ModelDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    duration: "",
    summary: "",
    includes: "",
  };
}

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AdminEngagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    state: "idle" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });

  const [eyebrow, setEyebrow] = useState("");
  const [title, setTitle] = useState("");
  const [lede, setLede] = useState("");
  const [items, setItems] = useState<ModelDraft[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("site_config")
      .select("content")
      .eq("id", "engagement_content")
      .maybeSingle();

    // Pre-fill from the live defaults when nothing is saved yet, so the editor
    // opens showing the content currently on the site rather than a blank form.
    const content = data?.content ?? {};
    const h = content.heading ?? engagementDefaults.heading;
    const rawItems = Array.isArray(content.items) ? content.items : null;

    setEyebrow(h.eyebrow ?? "");
    setTitle(h.title ?? "");
    setLede(h.lede ?? "");
    setItems(
      (rawItems ?? engagementDefaults.items).map((item: Record<string, unknown>) => ({
        ...blankModel(),
        ...item,
        id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
        includes: Array.isArray(item.includes) ? item.includes.join("\n") : "",
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function update(id: string, patch: Partial<ModelDraft>) {
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
      const unnamed = items.findIndex((item) => !item.name.trim());
      if (unnamed !== -1) {
        setStatus({
          state: "error",
          message: `Model ${unnamed + 1} needs a name before you can save.`,
        });
        setSaving(false);
        return;
      }

      const resolved = items.map((item) => ({
        id: item.id,
        name: item.name.trim(),
        duration: item.duration.trim(),
        summary: item.summary.trim(),
        includes: linesToArray(item.includes),
      }));

      const { error } = await supabase.from("site_config").upsert({
        id: "engagement_content",
        content: {
          heading: { eyebrow: eyebrow.trim(), title: title.trim(), lede: lede.trim() },
          items: resolved,
        },
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      await revalidateContent("engagement");
      setStatus({
        state: "saved",
        message:
          resolved.length === 0
            ? "Saved. With no models, the section shows the built-in defaults."
            : `Saved ${resolved.length} model${resolved.length === 1 ? "" : "s"}.`,
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

  if (loading) return <AdminLoading label="Loading engagement models…" />;

  return (
    <AdminPage
      title="Ways to work with us"
      description="The engagement-model cards on the homepage. Leave the list empty to fall back to the built-in defaults."
      actions={
        <AdminButton
          variant="secondary"
          onClick={() => setItems((current) => [...current, blankModel()])}
        >
          <Plus size={15} aria-hidden />
          Add model
        </AdminButton>
      }
    >
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <AdminCard
          title="Section heading"
          icon={Handshake}
          description="The eyebrow, title and intro shown above the cards."
        >
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminInput
                label="Eyebrow"
                value={eyebrow}
                onChange={(event) => setEyebrow(event.target.value)}
                placeholder="Engagement models"
              />
              <AdminInput
                label="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ways to work with us"
              />
            </div>
            <AdminTextarea
              label="Intro"
              value={lede}
              onChange={(event) => setLede(event.target.value)}
              rows={2}
              placeholder="A sentence introducing the models."
            />
          </div>
        </AdminCard>

        {items.length === 0 ? (
          <AdminEmptyState
            title="No engagement models"
            description="The homepage will show the built-in default models. Add one to override them."
            action={
              <AdminButton
                variant="secondary"
                onClick={() => setItems([blankModel()])}
              >
                <Plus size={15} aria-hidden />
                Add the first model
              </AdminButton>
            }
          />
        ) : (
          items.map((item, index) => (
            <AdminCard
              key={item.id}
              title={item.name.trim() || `Model ${index + 1}`}
              description={item.duration || undefined}
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
                    label="Name"
                    value={item.name}
                    onChange={(event) => update(item.id, { name: event.target.value })}
                    placeholder="Discovery sprint"
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
                  placeholder="What this way of working is and who it suits."
                />
                <AdminTextarea
                  label="Included"
                  value={item.includes}
                  onChange={(event) =>
                    update(item.id, { includes: event.target.value })
                  }
                  rows={4}
                  hint="One item per line — each becomes a ticked bullet. Optional."
                  placeholder={"Requirements workshop\nArchitecture plan\nCosted estimate"}
                />
              </div>
            </AdminCard>
          ))
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <AdminStatus state={status.state} message={status.message} />
          <AdminButton type="submit" busy={saving}>
            {saving ? "Saving…" : "Save engagement models"}
          </AdminButton>
        </div>
      </form>
    </AdminPage>
  );
}
