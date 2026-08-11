import {
  Boxes,
  Cloud,
  Code2,
  Database,
  Gauge,
  Layout,
  Lock,
  type LucideIcon,
  Plug,
  Rocket,
  Server,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Workflow,
} from "lucide-react";

/**
 * Icon registry for CMS-managed sections.
 *
 * Service cards carry a lucide icon, but the CMS can only store a string. This
 * maps a stable key to the component, so the admin picks a key from a fixed set
 * and the public site resolves it. Keys are the source of truth — renaming one
 * would orphan any content saved against the old name, so add rather than rename.
 */
export const SECTION_ICONS = {
  layout: Layout,
  cloud: Cloud,
  server: Server,
  smartphone: Smartphone,
  boxes: Boxes,
  code: Code2,
  database: Database,
  lock: Lock,
  plug: Plug,
  workflow: Workflow,
  gauge: Gauge,
  rocket: Rocket,
  cart: ShoppingCart,
  sparkles: Sparkles,
} as const satisfies Record<string, LucideIcon>;

export type SectionIconKey = keyof typeof SECTION_ICONS;

/** The keys, for populating an admin select. */
export const SECTION_ICON_KEYS = Object.keys(SECTION_ICONS) as SectionIconKey[];

export const DEFAULT_SECTION_ICON: SectionIconKey = "sparkles";

/** Resolves a stored key to a component, falling back so a bad key never throws. */
export function resolveIcon(key: string | undefined): LucideIcon {
  return SECTION_ICONS[(key ?? "") as SectionIconKey] ?? SECTION_ICONS[DEFAULT_SECTION_ICON];
}
