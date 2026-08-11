"use client";

import { ChevronDown, ChevronUp, Boxes, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminInput,
  AdminLoading,
  AdminPage,
  AdminSelect,
  AdminStatus,
  AdminTextarea,
} from "@/components/admin/ui";
import { revalidateContent } from "@/app/actions/revalidate";
import { resolveIcon, SECTION_ICON_KEYS } from "@/lib/icons";
import { servicesDefaults } from "@/lib/site";
import { supabase } from "@/lib/supabase";

/**
 * "What we build" editor.
 *
 * One `services_content` row holding `{ heading, items }`. Leave the whole list
 * empty and the public site falls back to the built-in defaults in
 * `src/lib/site.ts`, so the section is never blank. Order is explicit — the
 * sequence cards appear in is set with move up/down.
 */

interface ServiceDraft {
  id: string;
  title: string;
  icon: string;
  summary: string;
  outcome: string;
  /** Edited as one-per-line text; split to an array on save. */
  stack: string;
}

function blankService(): ServiceDraft {
  return {
    id: crypto.randomUUID(),
    title: "",
    icon: "sparkles",
    summary: "",
    outcome: "",
    stack: "",
  };
}

/** One tag per line, trimmed, blanks dropped. */
function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AdminServicesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    state: "idle" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });

  const [eyebrow, setEyebrow] = useState("");
  const [title, setTitle] = useState("");
  const [lede, setLede] = useState("");
  const [items, setItems] = useState<ServiceDraft[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("site_config")
      .select("content")
      .eq("id", "services_content")
      .maybeSingle();

    // Pre-fill from the live defaults when nothing is saved yet, so the editor
    // opens showing the content currently on the site rather than a blank form.
    const content = data?.content ?? {};
    const h = content.heading ?? servicesDefaults.heading;
    const rawItems = Array.isArray(content.items) ? content.items : null;

    setEyebrow(h.eyebrow ?? "");
    setTitle(h.title ?? "");
    setLede(h.lede ?? "");
    setItems(
      (rawItems ?? servicesDefaults.items).map((item: Record<string, unknown>) => ({
        ...blankService(),
        ...item,
        id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
        stack: Array.isArray(item.stack) ? item.stack.join("\n") : "",
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function update(id: string, patch: Partial<ServiceDraft>) {
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
          message: `Service ${unnamed + 1} needs a title before you can save.`,
        });
        setSaving(false);
        return;
      }

      const resolved = items.map((item) => ({
        id: item.id,
        title: item.title.trim(),
        icon: item.icon,
        summary: item.summary.trim(),
        outcome: item.outcome.trim(),
        stack: linesToArray(item.stack),
      }));

      const { error } = await supabase.from("site_config").upsert({
        id: "services_content",
        content: {
          heading: { eyebrow: eyebrow.trim(), title: title.trim(), lede: lede.trim() },
          items: resolved,
        },
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      await revalidateContent("services");
      setStatus({
        state: "saved",
        message:
          resolved.length === 0
            ? "Saved. With no services, the section shows the built-in defaults."
            : `Saved ${resolved.length} service${resolved.length === 1 ? "" : "s"}.`,
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

  if (loading) return <AdminLoading label="Loading services…" />;

  return (
    <AdminPage
      title="What we build"
      description="The service cards on the homepage. Leave the list empty to fall back to the built-in defaults."
      actions={
        <AdminButton
          variant="secondary"
          onClick={() => setItems((current) => [...current, blankService()])}
        >
          <Plus size={15} aria-hidden />
          Add service
        </AdminButton>
      }
    >
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <AdminCard
          title="Section heading"
          icon={Boxes}
          description="The eyebrow, title and intro shown above the cards."
        >
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminInput
                label="Eyebrow"
                value={eyebrow}
                onChange={(event) => setEyebrow(event.target.value)}
                placeholder="Services"
              />
              <AdminInput
                label="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What we build"
              />
            </div>
            <AdminTextarea
              label="Intro"
              value={lede}
              onChange={(event) => setLede(event.target.value)}
              rows={2}
              placeholder="A sentence introducing the disciplines."
            />
          </div>
        </AdminCard>

        {items.length === 0 ? (
          <AdminEmptyState
            title="No services"
            description="The homepage will show the built-in default services. Add one to override them."
            action={
              <AdminButton
                variant="secondary"
                onClick={() => setItems([blankService()])}
              >
                <Plus size={15} aria-hidden />
                Add the first service
              </AdminButton>
            }
          />
        ) : (
          items.map((item, index) => {
            const Icon = resolveIcon(item.icon);
            return (
              <AdminCard
                key={item.id}
                title={item.title.trim() || `Service ${index + 1}`}
                icon={Icon}
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
                      onChange={(event) =>
                        update(item.id, { title: event.target.value })
                      }
                      placeholder="Web platforms"
                      required
                    />
                    <AdminSelect
                      label="Icon"
                      value={item.icon}
                      onChange={(event) => update(item.id, { icon: event.target.value })}
                      options={SECTION_ICON_KEYS}
                      hint="Shown at the top of the card."
                    />
                  </div>
                  <AdminTextarea
                    label="Summary"
                    value={item.summary}
                    onChange={(event) =>
                      update(item.id, { summary: event.target.value })
                    }
                    rows={3}
                    placeholder="What this discipline covers."
                  />
                  <AdminInput
                    label="Outcome"
                    value={item.outcome}
                    onChange={(event) =>
                      update(item.id, { outcome: event.target.value })
                    }
                    placeholder="What the client is left with."
                    hint="The highlighted line beneath the summary. Optional."
                    wide
                  />
                  <AdminTextarea
                    label="Stack tags"
                    value={item.stack}
                    onChange={(event) => update(item.id, { stack: event.target.value })}
                    rows={4}
                    hint="One technology per line. Optional."
                    placeholder={"Next.js\nReact\nTypeScript"}
                  />
                </div>
              </AdminCard>
            );
          })
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <AdminStatus state={status.state} message={status.message} />
          <AdminButton type="submit" busy={saving}>
            {saving ? "Saving…" : "Save services"}
          </AdminButton>
        </div>
      </form>
    </AdminPage>
  );
}
