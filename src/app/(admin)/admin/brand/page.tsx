"use client";

import { Fingerprint, Palette, Star, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminLoading,
  AdminPage,
  AdminStatus,
} from "@/components/admin/ui";
import { revalidateContent } from "@/app/actions/revalidate";
import { supabase } from "@/lib/supabase";

/**
 * Brand identity editor.
 *
 * Now also manages the **favicon**, which previously had no editor at all — the
 * site shipped a static `favicon.ico` that could only be changed by a developer
 * committing a file. It is a separate asset from the logo because a wordmark that
 * reads well in the header is usually illegible at 32px; a favicon generally needs
 * a cropped mark. If none is set, the site falls back to the logo and then to the
 * studio initial on the accent colour (see `src/app/icon.tsx`).
 */

interface Asset {
  /** An existing stored URL, or a local object URL for a pending upload. */
  preview: string;
  file: File | null;
}

const EMPTY: Asset = { preview: "", file: null };

export default function AdminBrandPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    state: "idle" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });

  const [studioName, setStudioName] = useState("");
  const [accentColor, setAccentColor] = useState("#1f47e0");
  const [logo, setLogo] = useState<Asset>(EMPTY);
  const [favicon, setFavicon] = useState<Asset>(EMPTY);

  const logoInput = useRef<HTMLInputElement>(null);
  const faviconInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("site_config")
      .select("content")
      .eq("id", "brand_identity")
      .maybeSingle();

    const content = data?.content ?? {};
    const brand = content.brand ?? {};
    setStudioName(brand.studio_name ?? "");
    setAccentColor(content.accentColor ?? "#1f47e0");
    setLogo({ preview: brand.logo_url ?? "", file: null });
    setFavicon({ preview: brand.favicon_url ?? "", file: null });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function pick(setter: (asset: Asset) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      // An object URL previews the exact bytes with no round-trip to storage.
      setter({ preview: URL.createObjectURL(file), file });
      setStatus({ state: "idle" });
    };
  }

  async function upload(file: File, prefix: string) {
    const extension = file.name.split(".").pop() ?? "png";
    const path = `brand/${prefix}-${Date.now()}.${extension}`;
    const { error } = await supabase.storage
      .from("uploads")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus({ state: "idle" });

    try {
      const logoUrl = logo.file ? await upload(logo.file, "logo") : logo.preview;
      const faviconUrl = favicon.file
        ? await upload(favicon.file, "favicon")
        : favicon.preview;

      // Read-modify-write: `content` also carries fields owned by other editors,
      // so upserting only these keys would delete the rest.
      const { data: current } = await supabase
        .from("site_config")
        .select("content")
        .eq("id", "brand_identity")
        .maybeSingle();

      const { error } = await supabase.from("site_config").upsert({
        id: "brand_identity",
        content: {
          ...(current?.content ?? {}),
          accentColor,
          brand: {
            ...(current?.content?.brand ?? {}),
            studio_name: studioName,
            logo_url: logoUrl,
            favicon_url: faviconUrl,
            logo_initial: studioName ? studioName.charAt(0).toUpperCase() : "S",
          },
        },
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      await revalidateContent("settings");
      setStatus({
        state: "saved",
        message: "Brand saved. The favicon may need a browser refresh to update.",
      });
      await load();
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : "Could not save the brand.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoading label="Loading brand settings…" />;

  const isValidHex = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(accentColor);

  return (
    <AdminPage
      title="Brand"
      description="Studio name, logo, favicon and accent colour. These apply across the public site, this admin, and generated social share images."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <AdminCard
          title="Identity"
          icon={Fingerprint}
          description="The studio name appears in the header, footer, page titles and share images."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminInput
              label="Studio name"
              value={studioName}
              onChange={(event) => setStudioName(event.target.value)}
              placeholder="Ostenmark"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="accent" className="text-sm font-medium text-fg">
                Accent colour
              </label>
              <p className="text-xs text-fg-subtle">
                Six-digit hex. Used for links, buttons and highlights.
              </p>
              <div className="flex gap-2">
                <input
                  id="accent"
                  type="color"
                  value={isValidHex ? accentColor : "#1f47e0"}
                  onChange={(event) => setAccentColor(event.target.value)}
                  className="h-10 w-14 shrink-0 cursor-pointer rounded-md border border-line-strong bg-canvas p-1"
                />
                <input
                  aria-label="Accent colour hex value"
                  value={accentColor}
                  onChange={(event) => setAccentColor(event.target.value)}
                  aria-invalid={!isValidHex}
                  className={`w-full rounded-md border bg-canvas px-3 py-2.5 font-mono text-sm text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring ${
                    isValidHex ? "border-line-strong" : "border-critical"
                  }`}
                />
              </div>
              {!isValidHex ? (
                <p className="text-xs text-critical">
                  Not a valid hex colour — the site will fall back to its default.
                </p>
              ) : null}
            </div>
          </div>
        </AdminCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <AssetField
            title="Logo"
            icon={Star}
            description="Shown in the site header and on the credentials sheet. A transparent PNG or SVG works best."
            asset={logo}
            inputRef={logoInput}
            onPick={pick(setLogo)}
            onClear={() => {
              setLogo(EMPTY);
              if (logoInput.current) logoInput.current.value = "";
            }}
            previewClassName="h-20 w-20"
          />

          <AssetField
            title="Favicon"
            icon={Palette}
            description="The browser tab icon. Use a square, cropped mark — a full wordmark won't be legible this small. Falls back to the logo, then the studio initial."
            asset={favicon}
            inputRef={faviconInput}
            onPick={pick(setFavicon)}
            onClear={() => {
              setFavicon(EMPTY);
              if (faviconInput.current) faviconInput.current.value = "";
            }}
            previewClassName="h-12 w-12"
            // Also previewed at true tab size, so an illegible mark is obvious here
            // rather than after deploying.
            showTabSizePreview
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <AdminStatus state={status.state} message={status.message} />
          <AdminButton type="submit" busy={saving}>
            {saving ? "Saving…" : "Save brand"}
          </AdminButton>
        </div>
      </form>
    </AdminPage>
  );
}

function AssetField({
  title,
  icon,
  description,
  asset,
  inputRef,
  onPick,
  onClear,
  previewClassName,
  showTabSizePreview = false,
}: {
  title: string;
  icon: typeof Star;
  description: string;
  asset: Asset;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  previewClassName: string;
  showTabSizePreview?: boolean;
}) {
  return (
    <AdminCard title={title} icon={icon} description={description}>
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-3">
          <div
            className={`grid shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-canvas ${previewClassName}`}
          >
            {asset.preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS host plus local object URLs
              <img
                src={asset.preview}
                alt={`${title} preview`}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <span className="text-xs text-fg-subtle">None</span>
            )}
          </div>

          {showTabSizePreview && asset.preview ? (
            <div className="flex flex-col items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
              <img
                src={asset.preview}
                alt=""
                className="h-4 w-4 rounded-sm object-contain"
              />
              <span className="text-2xs text-fg-subtle">16px</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={onPick}
            className="hidden"
          />
          <AdminButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={14} aria-hidden />
            {asset.preview ? "Replace" : "Upload"}
          </AdminButton>

          {asset.preview ? (
            <AdminButton type="button" variant="ghost" size="sm" onClick={onClear}>
              <X size={14} aria-hidden />
              Remove
            </AdminButton>
          ) : null}
        </div>
      </div>
    </AdminCard>
  );
}
