/**
 * Publishes the CMS brand accent colour as CSS custom properties on :root.
 *
 * The accent is client-editable (see /admin/brand) so it cannot live in the
 * stylesheet. Injecting it as a style rule rather than an inline style on a
 * wrapper element means portalled content — modals, the mobile menu — inherits it
 * too, and it applies before hydration.
 *
 * `color` is validated as a hex literal in `src/lib/content.ts` before it reaches
 * this component, which is what makes interpolating it into CSS safe.
 */
export default function BrandAccent({ color }: { color: string }) {
  const css = `:root{--accent:${color};}`;

  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
