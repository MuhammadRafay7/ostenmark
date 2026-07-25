"use client";

import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  AdminButton,
  AdminCard,
  AdminDialog,
  AdminEmptyState,
  AdminInput,
  AdminLoading,
  AdminPage,
  AdminStatus,
  AdminTextarea,
} from "@/components/admin/ui";
import { revalidateContent } from "@/app/actions/revalidate";
import { supabase } from "@/lib/supabase";

/**
 * Team editor.
 *
 * The public team section renders **only when at least one member exists** — so
 * adding nobody here is a valid, supported state, and the site simply doesn't
 * claim a team. That matters for the studio's positioning: a one-person "Our
 * team" section reads worse to a prospective client than no section at all.
 *
 * Order is explicit rather than alphabetical: the sequence people appear in is a
 * deliberate signal, so it's controlled with move up/down rather than inferred.
 */

interface MemberDraft {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  linkedin_url: string;
  github_url: string;
  /** Local object URL for a not-yet-uploaded photo. */
  pendingFile: File | null;
  pendingPreview: string;
}

function blankMember(): MemberDraft {
  return {
    // crypto.randomUUID is available in every browser this admin supports.
    id: crypto.randomUUID(),
    name: "",
    role: "",
    bio: "",
    photo_url: "",
    linkedin_url: "",
    github_url: "",
    pendingFile: null,
    pendingPreview: "",
  };
}

export default function AdminTeamPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    state: "idle" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });

  const [heading, setHeading] = useState("");
  const [intro, setIntro] = useState("");
  const [members, setMembers] = useState<MemberDraft[]>([]);
  const [removing, setRemoving] = useState<MemberDraft | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("site_config")
      .select("content")
      .eq("id", "team_content")
      .maybeSingle();

    const content = data?.content ?? {};
    setHeading(content.heading ?? "");
    setIntro(content.intro ?? "");
    setMembers(
      (Array.isArray(content.members) ? content.members : []).map(
        (member: Record<string, unknown>) => ({
          ...blankMember(),
          ...member,
          // Never inherit transient upload state from stored data.
          pendingFile: null,
          pendingPreview: "",
          id: typeof member.id === "string" ? member.id : crypto.randomUUID(),
        }),
      ),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function update(id: string, patch: Partial<MemberDraft>) {
    setMembers((current) =>
      current.map((member) => (member.id === id ? { ...member, ...patch } : member)),
    );
    setStatus({ state: "idle" });
  }

  function move(index: number, direction: -1 | 1) {
    setMembers((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  async function uploadPhoto(file: File) {
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `team/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) throw error;
    return path;
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus({ state: "idle" });

    try {
      // A member with no name would render as a blank card, so require it here
      // rather than silently dropping it on read.
      const unnamed = members.findIndex((member) => !member.name.trim());
      if (unnamed !== -1) {
        setStatus({
          state: "error",
          message: `Team member ${unnamed + 1} needs a name before you can save.`,
        });
        setSaving(false);
        return;
      }

      const resolved = await Promise.all(
        members.map(async (member, index) => ({
          id: member.id,
          name: member.name.trim(),
          role: member.role.trim(),
          bio: member.bio.trim(),
          photo_url: member.pendingFile
            ? await uploadPhoto(member.pendingFile)
            : member.photo_url,
          linkedin_url: member.linkedin_url.trim(),
          github_url: member.github_url.trim(),
          order_index: index,
        })),
      );

      const { error } = await supabase.from("site_config").upsert({
        id: "team_content",
        content: { heading: heading.trim(), intro: intro.trim(), members: resolved },
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      await revalidateContent("team");
      setStatus({
        state: "saved",
        message:
          resolved.length === 0
            ? "Saved. With no members, the team section stays hidden on the site."
            : `Saved ${resolved.length} team member${resolved.length === 1 ? "" : "s"}.`,
      });
      await load();
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Could not save the team.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoading label="Loading team…" />;

  return (
    <AdminPage
      title="Team"
      description="People listed on the About page. Leave this empty and the team section won't appear on the site at all."
      actions={
        <AdminButton
          variant="secondary"
          onClick={() => setMembers((current) => [...current, blankMember()])}
        >
          <Plus size={15} aria-hidden />
          Add member
        </AdminButton>
      }
    >
      <AdminDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) {
            setMembers((current) =>
              current.filter((member) => member.id !== removing.id),
            );
          }
          setRemoving(null);
        }}
        title={`Remove ${removing?.name || "this member"}?`}
        description="They'll be removed from the list. Nothing is deleted until you save."
        confirmLabel="Remove"
        destructive
      />

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <AdminCard
          title="Section copy"
          icon={Users}
          description="Optional. Sensible defaults are used if you leave these blank."
        >
          <div className="grid gap-5">
            <AdminInput
              label="Heading"
              value={heading}
              onChange={(event) => setHeading(event.target.value)}
              placeholder="The people you'll work with"
              wide
            />
            <AdminTextarea
              label="Introduction"
              value={intro}
              onChange={(event) => setIntro(event.target.value)}
              placeholder="A sentence or two about how the team is set up."
              rows={3}
            />
          </div>
        </AdminCard>

        {members.length === 0 ? (
          <AdminEmptyState
            title="No team members"
            description="The About page will show no team section. Add someone if you want to introduce the people behind the studio."
            action={
              <AdminButton
                variant="secondary"
                onClick={() => setMembers([blankMember()])}
              >
                <Plus size={15} aria-hidden />
                Add the first member
              </AdminButton>
            }
          />
        ) : (
          members.map((member, index) => (
            <MemberEditor
              key={member.id}
              member={member}
              index={index}
              total={members.length}
              onChange={(patch) => update(member.id, patch)}
              onRemove={() => setRemoving(member)}
              onMove={(direction) => move(index, direction)}
            />
          ))
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <AdminStatus state={status.state} message={status.message} />
          <AdminButton type="submit" busy={saving}>
            {saving ? "Saving…" : "Save team"}
          </AdminButton>
        </div>
      </form>
    </AdminPage>
  );
}

function MemberEditor({
  member,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  member: MemberDraft;
  index: number;
  total: number;
  onChange: (patch: Partial<MemberDraft>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  // Stored values are bucket-relative paths; resolve for preview only.
  const storedPhoto = member.photo_url
    ? /^https?:\/\//i.test(member.photo_url)
      ? member.photo_url
      : supabase.storage.from("uploads").getPublicUrl(member.photo_url).data.publicUrl
    : "";
  const preview = member.pendingPreview || storedPhoto;

  return (
    <AdminCard
      title={member.name.trim() || `Team member ${index + 1}`}
      description={member.role || undefined}
      footer={
        <>
          <div className="flex items-center gap-1">
            <AdminButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={index === 0}
              onClick={() => onMove(-1)}
            >
              <ChevronUp size={15} aria-hidden />
              <span className="sr-only">
                Move {member.name || `member ${index + 1}`} up
              </span>
            </AdminButton>
            <AdminButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={index === total - 1}
              onClick={() => onMove(1)}
            >
              <ChevronDown size={15} aria-hidden />
              <span className="sr-only">
                Move {member.name || `member ${index + 1}`} down
              </span>
            </AdminButton>
            <span className="ml-1 text-xs text-fg-subtle">
              Position {index + 1} of {total}
            </span>
          </div>

          <AdminButton type="button" variant="danger" size="sm" onClick={onRemove}>
            <Trash2 size={14} aria-hidden />
            Remove
          </AdminButton>
        </>
      }
    >
      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Photo */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-line bg-canvas">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS host plus local object URLs
              <img
                src={preview}
                alt={`${member.name || "Team member"} photo preview`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs text-fg-subtle">No photo</span>
            )}
          </div>

          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              onChange({
                pendingFile: file,
                pendingPreview: URL.createObjectURL(file),
              });
            }}
          />
          <div className="flex items-center gap-1">
            <AdminButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={13} aria-hidden />
              Photo
            </AdminButton>
            {preview ? (
              <AdminButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange({ photo_url: "", pendingFile: null, pendingPreview: "" });
                  if (fileInput.current) fileInput.current.value = "";
                }}
              >
                <X size={13} aria-hidden />
                <span className="sr-only">Remove photo</span>
              </AdminButton>
            ) : null}
          </div>
        </div>

        {/* Details */}
        <div className="grid flex-1 gap-5 sm:grid-cols-2">
          <AdminInput
            label="Name"
            value={member.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="Jane Doe"
            required
          />
          <AdminInput
            label="Role"
            value={member.role}
            onChange={(event) => onChange({ role: event.target.value })}
            placeholder="Lead engineer"
          />
          <AdminTextarea
            label="Short bio"
            hint="One or two sentences. Keep it about what they do for clients."
            value={member.bio}
            onChange={(event) => onChange({ bio: event.target.value })}
            rows={3}
          />
          <AdminInput
            label="LinkedIn URL"
            type="url"
            value={member.linkedin_url}
            onChange={(event) => onChange({ linkedin_url: event.target.value })}
            placeholder="https://linkedin.com/in/…"
          />
          <AdminInput
            label="GitHub URL"
            type="url"
            value={member.github_url}
            onChange={(event) => onChange({ github_url: event.target.value })}
            placeholder="https://github.com/…"
          />
        </div>
      </div>
    </AdminCard>
  );
}
