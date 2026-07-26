"use client";

import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  AdminButton,
  AdminCard,
  AdminDialog,
  AdminEmptyState,
  AdminLoading,
  AdminPage,
  AdminStatus,
} from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { supabase } from "@/lib/supabase";

/**
 * Inquiry inbox.
 *
 * This page previously carried a second "Global Configuration" form editing the
 * contact email, location, phone and social links — the same fields the Footer &
 * contact editor owns. Two editors for one set of fields is a usability problem in
 * itself, and this copy was actively destructive: it called
 *
 *     upsert({ id: 'hero_content', content: updatedContent })
 *
 * with a freshly-built object, replacing the whole `content` column. Every save
 * silently wiped the hero eyebrow, both headline lines, the supporting paragraph,
 * the availability text and the capabilities list.
 *
 * The fix is deletion, not repair: contact settings live at /admin/footer, and this
 * page is now only an inbox.
 */

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

type Filter = "all" | "unread";

export default function AdminInboxPage() {
  const [messages, setMessages] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [deleting, setDeleting] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState<{
    state: "idle" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setStatus({ state: "error", message: `Could not load inquiries: ${error.message}` });
    } else {
      setMessages(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Guards against a state update landing after unmount, and keeps the
    // fetch-on-mount inside the effect rather than calling a setState-bearing
    // callback straight from the effect body.
    let active = true;

    (async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        setStatus({
          state: "error",
          message: `Could not load inquiries: ${error.message}`,
        });
      } else {
        setMessages(data ?? []);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  async function toggleRead(inquiry: Inquiry) {
    // Optimistic: a read toggle should feel instant, and a failure is recoverable.
    setMessages((current) =>
      current.map((entry) =>
        entry.id === inquiry.id ? { ...entry, read: !entry.read } : entry,
      ),
    );

    const { error } = await supabase
      .from("inquiries")
      .update({ read: !inquiry.read })
      .eq("id", inquiry.id);

    if (error) {
      setStatus({ state: "error", message: "Could not update. Reloading…" });
      await load();
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);

    const { error } = await supabase.from("inquiries").delete().eq("id", target.id);
    if (error) {
      setStatus({ state: "error", message: `Could not delete: ${error.message}` });
    } else {
      setStatus({ state: "saved", message: `Inquiry from ${target.name} deleted.` });
      await load();
    }
  }

  if (loading) return <AdminLoading label="Loading inbox…" />;

  const unread = messages.filter((entry) => !entry.read).length;
  const visible = filter === "unread" ? messages.filter((entry) => !entry.read) : messages;

  return (
    <AdminPage
      title="Inbox"
      description={
        messages.length === 0
          ? "Messages submitted through the contact form arrive here."
          : `${messages.length} inquir${messages.length === 1 ? "y" : "ies"}, ${unread} unread. Contact details are managed under Footer & contact.`
      }
    >
      <AdminDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete this inquiry?"
        description={`The message from ${deleting?.name ?? "this person"} will be permanently removed. Consider replying first — this can't be undone.`}
        confirmLabel="Delete"
        destructive
      />

      <AdminStatus state={status.state} message={status.message} />

      {messages.length === 0 ? (
        <AdminEmptyState
          title="No inquiries yet"
          description="When someone submits the contact form, their message appears here and you get an email about it at the same time."
        />
      ) : (
        <>
          <div className="flex gap-1.5">
            {(
              [
                { id: "all", label: `All (${messages.length})` },
                { id: "unread", label: `Unread (${unread})` },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                aria-pressed={filter === option.id}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  filter === option.id
                    ? "border-accent bg-accent text-fg-on-accent"
                    : "border-line bg-surface-raised text-fg-muted hover:text-fg",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <AdminEmptyState
              title="Nothing unread"
              description="You're up to date."
              action={
                <AdminButton variant="secondary" size="sm" onClick={() => setFilter("all")}>
                  Show all
                </AdminButton>
              }
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {visible.map((inquiry) => (
                <li key={inquiry.id}>
                  <AdminCard
                    className={cn(
                      // Unread gets an accent edge — a colour-plus-label cue, since
                      // the "Unread" badge below carries the same information in text.
                      !inquiry.read && "border-l-2 border-l-accent",
                    )}
                    footer={
                      <>
                        <AdminButton
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRead(inquiry)}
                        >
                          {inquiry.read ? (
                            <>
                              <Mail size={14} aria-hidden />
                              Mark unread
                            </>
                          ) : (
                            <>
                              <MailOpen size={14} aria-hidden />
                              Mark read
                            </>
                          )}
                        </AdminButton>

                        <div className="flex items-center gap-1">
                          <a
                            href={`mailto:${inquiry.email}?subject=${encodeURIComponent(
                              `Re: your inquiry`,
                            )}`}
                            className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-fg-on-accent transition-colors hover:bg-accent-hover"
                          >
                            <Reply size={14} aria-hidden />
                            Reply
                          </a>
                          <AdminButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleting(inquiry)}
                            className="text-fg-subtle hover:bg-critical/10 hover:text-critical"
                          >
                            <Trash2 size={14} aria-hidden />
                            <span className="sr-only">
                              Delete inquiry from {inquiry.name}
                            </span>
                          </AdminButton>
                        </div>
                      </>
                    }
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
                          {inquiry.name}
                          {!inquiry.read ? (
                            <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-2xs font-medium tracking-normal text-accent">
                              Unread
                            </span>
                          ) : null}
                        </h2>
                        <a
                          href={`mailto:${inquiry.email}`}
                          className="mt-0.5 block truncate text-sm text-fg-muted underline decoration-line-strong underline-offset-2 hover:text-fg"
                        >
                          {inquiry.email}
                        </a>
                      </div>

                      <time
                        dateTime={inquiry.created_at}
                        className="shrink-0 text-xs text-fg-subtle"
                      >
                        {new Date(inquiry.created_at).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>

                    {/* whitespace-pre-line preserves the submitter's paragraphs,
                        including the Company/Budget lines the form prepends. */}
                    <p className="mt-4 whitespace-pre-line border-l-2 border-line pl-4 text-sm leading-relaxed text-fg-muted">
                      {inquiry.message}
                    </p>
                  </AdminCard>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </AdminPage>
  );
}
