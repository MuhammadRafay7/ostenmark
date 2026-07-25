/**
 * Applies the stored theme before first paint.
 *
 * This has to be a blocking inline script in <head>: if the theme were applied
 * from a React effect, a visitor who chose dark would get a flash of the light
 * theme on every navigation-free page load. Kept deliberately tiny and
 * dependency-free for that reason.
 *
 * With no stored preference, no attribute is set at all — the CSS then falls
 * through to the `prefers-color-scheme` block, so the OS setting wins.
 */

export const THEME_STORAGE_KEY = "starvix-theme";

const script = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {
    /* Private-mode or blocked storage: fall back to the OS preference. */
  }
})();
`;

export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
