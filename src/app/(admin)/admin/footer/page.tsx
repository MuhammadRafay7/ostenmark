"use client";

import { Copyright, MapPin, Share2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AdminButton,
  AdminCard,
  AdminCombobox,
  AdminInput,
  AdminLoading,
  AdminPage,
  AdminStatus,
  AdminTextarea,
} from "@/components/admin/ui";
import { revalidateContent } from "@/app/actions/revalidate";
import { supabase } from "@/lib/supabase";

/**
 * The full IANA timezone list, straight from the runtime so it never goes stale.
 * Falls back to a short curated set on the rare engine without
 * `Intl.supportedValuesOf`. `current` is folded in so a value already saved in
 * the CMS is always selectable even if it isn't in the list.
 */
function timezoneOptions(current: string): string[] {
  let zones: string[];
  try {
    zones = (
      Intl as typeof Intl & { supportedValuesOf?: (k: string) => string[] }
    ).supportedValuesOf?.("timeZone") ?? [];
  } catch {
    zones = [];
  }

  if (zones.length === 0) {
    zones = [
      "UTC",
      "Europe/London",
      "Europe/Berlin",
      "America/New_York",
      "America/Los_Angeles",
      "Asia/Dubai",
      "Asia/Karachi",
      "Asia/Kolkata",
      "Asia/Singapore",
      "Australia/Sydney",
    ];
  }

  const withUtc = zones.includes("UTC") ? zones : ["UTC", ...zones];
  return current && !withUtc.includes(current)
    ? [current, ...withUtc]
    : withUtc;
}

/**
 * Footer, contact details and social links.
 *
 * These live in the `footer_json` column of the `hero_content` row — a column of
 * its own, so unlike the other editors this one can safely replace its whole
 * payload without disturbing the hero copy in the adjacent `content` column.
 */

const SOCIALS = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "twitter", label: "X / Twitter" },
  { key: "instagram", label: "Instagram" },
] as const;

type FooterData = {
  copyright: string;
  narrative: string;
  email: string;
  notifyEmail: string;
  location: string;
  timezone: string;
  availability: string;
  socials: Record<string, string>;
};

const EMPTY: FooterData = {
  copyright: "",
  narrative: "",
  email: "",
  notifyEmail: "",
  location: "",
  timezone: "UTC",
  availability: "",
  socials: {},
};

export default function AdminFooterPage() {
  const [data, setData] = useState<FooterData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    state: "idle" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });

  const load = useCallback(async () => {
    const { data: row } = await supabase
      .from("site_config")
      .select("footer_json")
      .eq("id", "hero_content")
      .maybeSingle();

    const footer = row?.footer_json ?? {};
    setData({
      copyright: footer.copyright ?? "",
      narrative: footer.narrative ?? "",
      email: footer.email ?? "",
      notifyEmail: footer.notifyEmail ?? "",
      location: footer.location ?? "",
      timezone: footer.timezone ?? "UTC",
      availability: footer.availability ?? "",
      socials: footer.socials ?? {},
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const timezones = useMemo(
    () => timezoneOptions(data.timezone),
    [data.timezone],
  );

  function field(key: keyof Omit<FooterData, "socials">) {
    return (event: { target: { value: string } }) => {
      setData((current) => ({ ...current, [key]: event.target.value }));
      setStatus({ state: "idle" });
    };
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus({ state: "idle" });

    try {
      const { error } = await supabase.from("site_config").upsert({
        id: "hero_content",
        footer_json: data,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      await revalidateContent("settings");
      setStatus({ state: "saved", message: "Footer and contact details saved." });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Could not save.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoading label="Loading footer settings…" />;

  return (
    <AdminPage
      title="Footer & contact"
      description="Contact details, availability and social links. These appear in the footer, on the contact page, and in the site's structured data for search engines."
    >
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <AdminCard
          title="Contact details"
          icon={MapPin}
          description="The public address appears in the footer, on the contact page and in search metadata. The notification address is where the contact form delivers — it can be a different mailbox."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminInput
              label="Email address"
              type="email"
              value={data.email}
              onChange={field("email")}
              placeholder="hello@ostenmark.com"
              hint="Public address. Used for the footer, the contact page, mailto links and search metadata."
            />
            <AdminInput
              label="Inquiry notifications to"
              type="email"
              value={data.notifyEmail}
              onChange={field("notifyEmail")}
              placeholder="hello@ostenmark.com"
              hint="Where contact form submissions are delivered. Never shown publicly. Leave blank to use the public address above."
            />
            <AdminInput
              label="Location"
              value={data.location}
              onChange={field("location")}
              placeholder="Remote — worldwide"
            />
            <AdminCombobox
              label="Local time zone"
              value={data.timezone}
              onValueChange={(timezone) => {
                setData((current) => ({ ...current, timezone }));
                setStatus({ state: "idle" });
              }}
              options={timezones}
              hint="Drives the live “local time” clock in the footer and on the contact page. Type to search."
            />
            <AdminInput
              label="Availability"
              value={data.availability}
              onChange={field("availability")}
              placeholder="Available for new projects"
              hint="Shown next to a green status dot."
            />
            <AdminInput
              label="Copyright name"
              value={data.copyright}
              onChange={field("copyright")}
              placeholder="Ostenmark"
              hint="The year is added automatically."
            />
          </div>
        </AdminCard>

        <AdminCard
          title="Footer message"
          icon={Copyright}
          description="A short invitation shown above the contact button in the footer."
        >
          <AdminTextarea
            label="Message"
            value={data.narrative}
            onChange={field("narrative")}
            rows={3}
            placeholder="Tell us what you're building. We'll come back with an honest view on scope, cost and timeline."
          />
        </AdminCard>

        <AdminCard
          title="Social links"
          icon={Share2}
          description="Leave a field blank to hide that link. Full URLs including https://."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {SOCIALS.map((social) => (
              <AdminInput
                key={social.key}
                label={social.label}
                type="url"
                value={data.socials[social.key] ?? ""}
                onChange={(event) => {
                  setData((current) => ({
                    ...current,
                    socials: { ...current.socials, [social.key]: event.target.value },
                  }));
                  setStatus({ state: "idle" });
                }}
                placeholder={`https://${social.key}.com/…`}
              />
            ))}
          </div>
        </AdminCard>

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
