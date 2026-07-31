import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import FadeImage from "@/components/ui/FadeImage";
import { Container } from "@/components/ui/layout";
import type { Project } from "@/lib/types";

/**
 * Continuously scrolling band of project lockups — a cover thumbnail beside the
 * project name.
 *
 * The thumbnail is what makes this read as a logo strip. An earlier version set
 * the names as type alone, which was honest but uniform: a row of words in one
 * face at one size has no silhouette, so it scanned as a sentence scrolling past
 * rather than as a body of work. A real logo strip gets its rhythm from each mark
 * having its own shape, and the cover images already supply that.
 *
 * Deliberately small at 56px, and deliberately not the 16:10 crop used by
 * ProjectCard: the card grid further down the page shows the same images, and
 * matching their size here would make this band read as a preview of that section
 * instead of as its own element.
 *
 * Still a server component with no client bundle, no measurement pass and no
 * layout shift. See `marquee-viewport` and `--animate-marquee` in globals.css for
 * the loop, the edge fade, the hover/focus pause, the sibling dimming and the
 * reduced-motion fallback.
 */

/**
 * The track must overflow its container for the loop to read as motion, and each
 * half must be wide enough to cover the viewport on its own — otherwise a studio
 * with three projects shows a gap sweeping past. Repeating up to this count fills
 * the row regardless of how many projects exist.
 */
const MIN_ITEMS_PER_HALF = 8;

/**
 * Seconds of travel per item. Slow is the whole point: a band that moves fast
 * enough to notice reads as an advertisement, one that drifts reads as
 * confidence. At 5.5s an item stays legible for its entire pass.
 */
const SECONDS_PER_ITEM = 5.5;

/** Rendered size of the cover thumbnail, in px. Matches the `size-14` box. */
const THUMB_PX = 56;

export default function ProjectMarquee({ projects }: { projects: Project[] }) {
  // A single project would loop past the same name forever, which reads as a
  // bug rather than as a body of work.
  if (projects.length < 2) return null;

  const half = Array.from(
    { length: Math.max(MIN_ITEMS_PER_HALF, projects.length) },
    (_, index) => projects[index % projects.length],
  );

  return (
    <section
      aria-labelledby="work-marquee-heading"
      // Bottom border only: the hero above already draws its own bottom edge, and
      // a border-t here would stack against it into a visible 2px rule.
      className="overflow-hidden border-b border-line bg-surface/40 py-14 sm:py-16"
    >
      <Container>
        {/* Rules flanking the label, sized to the cap height of the text they sit
            beside. Cheaper than a heavier heading and it centres the band without
            competing with the wordmarks for weight. */}
        <div className="flex items-center justify-center gap-5">
          <span aria-hidden className="h-px w-10 bg-line-strong sm:w-16" />
          <h2 id="work-marquee-heading" className="label text-fg-subtle">
            Selected work
          </h2>
          <span aria-hidden className="h-px w-10 bg-line-strong sm:w-16" />
        </div>
      </Container>

      <div className="marquee-viewport mt-11">
        <div
          data-marquee-track
          className="flex w-max animate-marquee items-center"
          style={
            {
              "--marquee-duration": `${(half.length * SECONDS_PER_ITEM).toFixed(1)}s`,
            } as CSSProperties
          }
        >
          <MarqueeHalf items={half} />
          {/* The seamless-loop duplicate. Hidden from assistive tech and removed
              from the tab order so the same names aren't announced or tabbed
              through twice — it exists only to fill the space the first half
              vacates as it scrolls. */}
          <MarqueeHalf items={half} duplicate />
        </div>
      </div>
    </section>
  );
}

function MarqueeHalf({
  items,
  duplicate = false,
}: {
  items: Project[];
  duplicate?: boolean;
}) {
  return (
    <ul
      aria-hidden={duplicate || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((project, index) => (
        <li
          key={`${project.id}-${index}`}
          className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14"
        >
          <Link
            href={`/projects/${project.id}`}
            tabIndex={duplicate ? -1 : undefined}
            data-marquee-item
            className="group flex items-center gap-4 text-fg-subtle transition-[opacity,color] duration-500 ease-out-quint"
          >
            <span className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-raised shadow-xs">
              {project.coverImage ? (
                <FadeImage
                  src={project.coverImage}
                  // Decorative here: the name sits directly beside it in the same
                  // link, so alt text would be read out twice.
                  alt=""
                  width={THUMB_PX}
                  height={THUMB_PX}
                  // No `sizes` here, intentionally. On a fixed-size image it
                  // makes next/image treat the width as viewport-relative: it
                  // drops the srcset and points src at the largest configured
                  // width, so each 56px thumbnail was fetching a 1536px original.
                  // Omitting it yields a proper 1x/2x srcset off the small
                  // imageSizes instead.
                  //
                  // Desaturated at rest, full colour on the item under the
                  // cursor — the treatment every considered logo strip uses. At
                  // 56px thirteen competing screenshot palettes read as noise;
                  // monochrome lets the row scan as one object, and returning the
                  // colour makes the hover feel like a reward rather than a state
                  // change.
                  className="size-full object-cover grayscale transition-[transform,filter] duration-700 ease-out-quint group-hover:scale-105 group-hover:grayscale-0"
                />
              ) : (
                // Projects without a cover still need a silhouette, or the row
                // collapses to bare text at that position and the rhythm breaks.
                <span
                  aria-hidden
                  className="grid size-full place-items-center font-display text-xl font-semibold text-line-strong"
                >
                  {project.title.charAt(0)}
                </span>
              )}
            </span>

            {/* Name over category, rather than the name alone. The pairing is
                what turns a picture next to a word into a lockup: the label gives
                the eye somewhere to land after the name and sets a second,
                quieter typographic level, so each item has internal structure
                instead of being one uniform blob of text. */}
            <span className="flex flex-col gap-1">
              {/* Medium rather than semibold. A wordmark reads as a mark through
                  size and letterfit, not through weight — bolding it makes a row
                  of names look like a row of headlines. */}
              <span className="flex items-center gap-1.5 whitespace-nowrap font-display text-xl font-medium tracking-tight sm:text-2xl">
                {project.title}
                {/* Same affordance ProjectCard uses, so a hovered item here
                    announces itself as a link the same way it does in the grid. */}
                <ArrowUpRight
                  size={15}
                  aria-hidden
                  className="shrink-0 -translate-x-1 opacity-0 transition-[transform,opacity] duration-500 ease-out-quint group-hover:translate-x-0 group-hover:opacity-100"
                />
              </span>

              {project.category ? (
                <span className="label whitespace-nowrap text-fg-subtle">
                  {project.category}
                </span>
              ) : null}
            </span>
          </Link>

          {/* A hairline rule rather than a dot. The dot read as decoration and
              picked up the brand accent, which put a row of coloured marks in
              competition with the names; a rule reads as typographic setting and
              stays out of the way. Faded at both ends so it reads as a division
              rather than as a hard stroke between items. */}
          <span
            aria-hidden
            className="h-10 w-px shrink-0 bg-gradient-to-b from-transparent via-line-strong to-transparent sm:h-12"
          />
        </li>
      ))}
    </ul>
  );
}
