"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's right-hand column: a slowly rotating wireframe form in WebGL.
 *
 * Decoration, and treated as such throughout — the section is `aria-hidden`, it
 * renders only at `lg` and above, and everything below is written so that if any
 * part of it fails the page is exactly as usable as before.
 *
 * Four constraints shaped this file:
 *
 * - **three.js must not be in the homepage bundle.** It is imported inside an
 *   effect, so the bundler emits it as a separate chunk fetched at runtime
 *   rather than shipping ~150KB gzipped to every visitor for a decoration. The
 *   import doesn't even start until the element is actually on screen.
 * - **No React state in the animation path.** Pointer parallax and drag both
 *   mutate plain locals that the rAF loop reads. The hero previously called
 *   `setState` on every `mousemove` and re-rendered the whole section
 *   continuously (see the note in Hero.tsx); tracking the pointer is fine,
 *   re-rendering React for it is not. This matters more now that the form is
 *   draggable — a drag is a burst of pointer events, and one re-render each
 *   would be the same bug in a new place.
 * - **It must stop when nobody is looking.** An IntersectionObserver and the
 *   Page Visibility API both gate the loop, so a scrolled-past or backgrounded
 *   tab isn't spinning a GPU for nothing.
 * - **Reduced motion means no WebGL at all**, not a paused canvas: the static
 *   SVG below is what those visitors get, and three.js is never fetched.
 */

/** Radius of the outer form, in world units. The camera is framed around this. */
const OUTER_RADIUS = 1.55;
const INNER_RADIUS = 0.92;

/** Radians of rotation per pixel of drag. Roughly a half-turn across the form. */
const DRAG_SENSITIVITY = 0.006;
/** Fraction of the throw's speed kept per second after release. */
const FRICTION = 0.06;
/** Idle rotation speed, rad/s. Also the threshold the throw decays back to. */
const AUTO_SPIN = 0.16;
/** Vertical clamp, radians (~70°). Beyond this the wireframe reads as noise. */
const MAX_TILT = 1.2;

/**
 * Reads a design token and returns something three.js can parse.
 *
 * Only tokens that resolve to a hex or `rgb()` value are safe here — several of
 * the line tokens are authored as `color-mix()`, which computes to `color(srgb
 * …)` in current browsers and which `Color.setStyle` cannot read. So the visual
 * is built from `--accent` and `--fg-subtle`, both plain colours in every theme,
 * and anything unexpected falls back rather than rendering black.
 */
function readToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return /^(#|rgb)/.test(value) ? value : fallback;
}

export default function HeroVisual() {
  const hostRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Reduced motion: never load the library, never create a context. The SVG
    // fallback in the markup stays as the final state.
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    let disposed = false;
    let teardown: (() => void) | undefined;

    async function init() {
      const THREE = await import("three");
      // The element can unmount while the chunk is in flight.
      if (disposed || !host) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
      } catch {
        // No WebGL at all. Leave the fallback in place.
        return;
      }
      // Deliberately *not* passing `failIfMajorPerformanceCaveat`. It was set
      // here originally to avoid software rendering, but it also rejects the
      // context on any machine running Chrome without hardware acceleration —
      // common on Linux — and the visitor got a blank column instead. The scene
      // is a few hundred unlit line segments, which SwiftShader draws at frame
      // rate without trouble, so a software context is worth taking.

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      // Every material is unlit (Line/Points basic), so there are no lights and
      // no tone mapping to reconcile with the site's two themes — the colours on
      // screen are exactly the token values.
      const accent = new THREE.Color(readToken("--accent", "#1f47e0"));
      const subtle = new THREE.Color(readToken("--fg-subtle", "#6b7488"));

      const group = new THREE.Group();
      scene.add(group);

      const outerGeometry = new THREE.IcosahedronGeometry(OUTER_RADIUS, 1);
      const outerEdges = new THREE.EdgesGeometry(outerGeometry);
      const outerMaterial = new THREE.LineBasicMaterial({
        color: subtle,
        transparent: true,
        opacity: 0.45,
      });
      const outer = new THREE.LineSegments(outerEdges, outerMaterial);
      group.add(outer);

      // Vertex markers, echoing the node dots used in the site's eyebrows.
      const pointsMaterial = new THREE.PointsMaterial({
        color: accent,
        size: 0.055,
        transparent: true,
        opacity: 0.9,
        // Keeps markers a consistent visual weight regardless of how the
        // perspective camera foreshortens the far side of the form.
        sizeAttenuation: false,
      });
      const points = new THREE.Points(outerGeometry, pointsMaterial);
      group.add(points);

      const innerGeometry = new THREE.IcosahedronGeometry(INNER_RADIUS, 0);
      const innerEdges = new THREE.EdgesGeometry(innerGeometry);
      const innerMaterial = new THREE.LineBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.75,
      });
      const inner = new THREE.LineSegments(innerEdges, innerMaterial);
      group.add(inner);

      const canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      // Fades in once the first frame is on screen, so the canvas never appears
      // as a blank rectangle over the grid while the chunk loads.
      canvas.style.opacity = "0";
      canvas.style.transition = "opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      host.appendChild(canvas);

      function resize() {
        if (!host) return;
        const { width, height } = host.getBoundingClientRect();
        if (width === 0 || height === 0) return;
        // Capped: past ~1.75 the extra pixels are invisible on a wireframe and
        // cost real fill rate on high-DPI laptops.
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      resize();

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);

      // Pointer parallax. Written to a ref-like local and consumed by the loop —
      // no React involvement, so moving the mouse costs one property write.
      const pointer = { x: 0, y: 0 };
      const target = { x: 0, y: 0 };
      function onPointerMove(event: PointerEvent) {
        if (drag.active) return; // The drag handler owns the pointer.
        // Normalised to roughly -1..1 across the viewport.
        target.x = (event.clientX / window.innerWidth) * 2 - 1;
        target.y = (event.clientY / window.innerHeight) * 2 - 1;
      }
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      // Grab-and-turn. The rotation is owned here rather than accumulated onto
      // `group.rotation` by the loop, because dragging, momentum and the idle
      // spin all write to the same two angles and need one source of truth.
      const rotation = { x: 0, y: 0 };
      /** Angular velocity in rad/s, fed by the drag and decayed after release. */
      const velocity = { x: 0, y: 0 };
      const drag = { active: false, x: 0, y: 0, pointerId: -1 };

      function onPointerDown(event: PointerEvent) {
        // Touch is left alone: this sits in a scrollable page and hijacking a
        // vertical swipe to spin a decoration is a bad trade. The visual is
        // `lg`-only anyway, so this is a touchscreen-laptop edge case.
        if (event.pointerType === "touch") return;
        drag.active = true;
        drag.x = event.clientX;
        drag.y = event.clientY;
        drag.pointerId = event.pointerId;
        velocity.x = 0;
        velocity.y = 0;
        canvas.setPointerCapture(event.pointerId);
        canvas.style.cursor = "grabbing";
      }

      function onDragMove(event: PointerEvent) {
        if (!drag.active) return;
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        drag.x = event.clientX;
        drag.y = event.clientY;

        rotation.y += dx * DRAG_SENSITIVITY;
        rotation.x += dy * DRAG_SENSITIVITY;
        // Past about ±70° the form is being read end-on and the wireframe turns
        // to mush, so the vertical axis is clamped rather than free-spinning.
        rotation.x = Math.max(-MAX_TILT, Math.min(MAX_TILT, rotation.x));

        // Velocity is taken from the frame's own movement rather than a running
        // average: a flick should throw the form, and a slow drag that stops
        // before release should leave it where the pointer left it.
        velocity.y = dx * DRAG_SENSITIVITY * 60;
        velocity.x = dy * DRAG_SENSITIVITY * 60;
      }

      function onPointerUp(event: PointerEvent) {
        if (!drag.active) return;
        drag.active = false;
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
        canvas.style.cursor = "grab";
      }

      canvas.style.cursor = "grab";
      // `touch-action` is deliberately not set to `none`: see onPointerDown.
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onDragMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);

      // Theme can change after load (the toggle sets data-theme; with no stored
      // preference the OS query wins), and the accent is CMS-editable. Re-read
      // the tokens rather than baking colours in at init.
      function syncColors() {
        accent.set(readToken("--accent", "#1f47e0"));
        subtle.set(readToken("--fg-subtle", "#6b7488"));
        outerMaterial.color.copy(subtle);
        innerMaterial.color.copy(accent);
        pointsMaterial.color.copy(accent);
      }
      const themeObserver = new MutationObserver(syncColors);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "style", "class"],
      });
      const schemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      schemeQuery.addEventListener("change", syncColors);

      let frame = 0;
      let visible = false;
      let lastTime = performance.now();
      let firstFrameDrawn = false;

      function render(now: number) {
        frame = requestAnimationFrame(render);
        // Time-based rather than per-frame, so the form turns at the same speed
        // on a 60Hz panel and a 120Hz one.
        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        // Ease toward the pointer instead of tracking it exactly: the lag is
        // what makes it read as weight rather than as a cursor attachment.
        pointer.x += (target.x - pointer.x) * Math.min(delta * 2.2, 1);
        pointer.y += (target.y - pointer.y) * Math.min(delta * 2.2, 1);

        if (!drag.active) {
          // Momentum from the release, decayed exponentially so the rate is
          // frame-independent — `FRICTION` is the fraction of speed kept per
          // second, not per frame.
          rotation.y += velocity.y * delta;
          rotation.x += velocity.x * delta;
          rotation.x = Math.max(-MAX_TILT, Math.min(MAX_TILT, rotation.x));

          const decay = Math.pow(FRICTION, delta);
          velocity.x *= decay;
          velocity.y *= decay;
          if (Math.abs(velocity.x) < 0.001) velocity.x = 0;
          if (Math.abs(velocity.y) < 0.001) velocity.y = 0;

          // The idle spin fades back in as the throw dies out, so the form
          // resumes drifting instead of stopping dead where it was let go.
          const settled = 1 - Math.min(Math.abs(velocity.y) / AUTO_SPIN, 1);
          rotation.y += delta * AUTO_SPIN * settled;
          // The tilt returns to level on its own, but slowly enough that a
          // deliberate angle survives long enough to be looked at.
          rotation.x += (0 - rotation.x) * Math.min(delta * 0.35, 1);
        }

        group.rotation.y = rotation.y;
        // Parallax now rides on top of the user's angle rather than replacing
        // it, so a dragged form still responds to the pointer crossing the page.
        group.rotation.x = rotation.x + pointer.y * 0.22;
        // The counter-rotating inner form is the whole reason this reads as a
        // constructed object rather than a spinning ball.
        inner.rotation.y -= delta * 0.42;
        inner.rotation.z += delta * 0.12;

        camera.position.x = pointer.x * 0.55;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);

        if (!firstFrameDrawn) {
          firstFrameDrawn = true;
          canvas.style.opacity = "1";
          // Cross-fade: the placeholder rings hand over to the real form rather
          // than sitting behind it and doubling the linework.
          if (fallbackRef.current) fallbackRef.current.style.opacity = "0";
        }
      }

      function start() {
        if (frame !== 0) return;
        lastTime = performance.now();
        frame = requestAnimationFrame(render);
      }
      function stop() {
        if (frame === 0) return;
        cancelAnimationFrame(frame);
        frame = 0;
      }
      function sync() {
        if (visible && !document.hidden) start();
        else stop();
      }

      const viewObserver = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          sync();
        },
        { threshold: 0 },
      );
      viewObserver.observe(host);
      document.addEventListener("visibilitychange", sync);

      teardown = () => {
        stop();
        viewObserver.disconnect();
        resizeObserver.disconnect();
        themeObserver.disconnect();
        schemeQuery.removeEventListener("change", syncColors);
        document.removeEventListener("visibilitychange", sync);
        window.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onDragMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        canvas.remove();
        outerGeometry.dispose();
        outerEdges.dispose();
        innerGeometry.dispose();
        innerEdges.dispose();
        outerMaterial.dispose();
        innerMaterial.dispose();
        pointsMaterial.dispose();
        renderer.dispose();
        // Without this the context can outlive the component in Safari and
        // count against the browser's hard limit on live WebGL contexts.
        renderer.forceContextLoss();
      };
    }

    // Defer everything — including the network request for the chunk — until the
    // visual is actually on screen. Below `lg` the host is `display: none`, so
    // this never fires and mobile pays nothing at all.
    const gate = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      gate.disconnect();
      // Nothing here is load-bearing, but a silent rejection meant a blank
      // column with no clue why. Surface it and keep the fallback.
      void init().catch((error) => {
        console.warn("[HeroVisual] 3D visual unavailable:", error);
      });
    });
    gate.observe(host);

    return () => {
      disposed = true;
      gate.disconnect();
      teardown?.();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="relative ml-auto hidden aspect-square w-full max-w-md lg:block"
    >
      {/*
        Static fallback, and the only thing reduced-motion visitors see. It is
        also what fills the space while the WebGL chunk loads, so the column is
        never empty. Drawn from the same two tokens as the 3D form.
      */}
      <svg
        ref={fallbackRef}
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full transition-opacity duration-700"
        fill="none"
      >
        <circle cx="100" cy="100" r="62" stroke="var(--fg-subtle)" strokeOpacity="0.55" />
        <circle cx="100" cy="100" r="38" stroke="var(--accent)" strokeOpacity="0.8" />
        <circle cx="100" cy="38" r="3.5" fill="var(--accent)" />
        <circle cx="154" cy="131" r="3.5" fill="var(--accent)" />
        <circle cx="46" cy="131" r="3.5" fill="var(--accent)" />
      </svg>

      <div ref={hostRef} className="absolute inset-0" />
    </div>
  );
}
