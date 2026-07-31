"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { cn } from "@/lib/cn";

/**
 * `next/image` that fades in once the image has decoded.
 *
 * Covers come from Supabase storage over a connection that may be slow and far
 * away, so without this a page of case studies fills in as a series of grey boxes
 * snapping to full-colour photographs. The fade doesn't make them arrive sooner;
 * it stops their arrival from being the most distracting thing on the page.
 *
 * Two behaviours worth knowing about:
 *
 * - **Priority images never fade.** They are the ones chosen to be the largest
 *   contentful paint, and starting them transparent would delay the very metric
 *   they exist to improve. They render as a plain `next/image`.
 * - **Already-cached images are handled.** An image restored from cache can
 *   finish decoding before React hydrates, so its `load` event fires with no
 *   listener attached and the fade would never start — leaving it invisible for
 *   good. The ref callback checks `complete` on attach to catch exactly that.
 *
 * The animation itself is `img-fade` in globals.css, including the no-JavaScript
 * guard.
 */
/* `alt` is required by ImageProps and supplied by every caller, so the lint rule
   is looking for a literal prop that only exists after the spread. */
/* eslint-disable jsx-a11y/alt-text */
export default function FadeImage({ className, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  if (props.priority) {
    return <Image {...props} className={className} />;
  }

  return (
    <Image
      {...props}
      ref={(node) => {
        if (node?.complete) setLoaded(true);
      }}
      onLoad={(event) => {
        setLoaded(true);
        props.onLoad?.(event);
      }}
      data-loaded={loaded ? "true" : "false"}
      className={cn("img-fade", className)}
    />
  );
}
