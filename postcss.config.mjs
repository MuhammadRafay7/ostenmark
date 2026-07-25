/**
 * PostCSS configuration.
 *
 * SECURITY NOTE: this file previously carried an obfuscated remote-code-execution
 * payload, appended after `export default config;` behind ~500 spaces so it sat
 * off-screen in an editor. It was introduced in the initial commit and ran on
 * every `next dev` and `next build`.
 *
 * The `import { createRequire }` / `const require = createRequire(...)` lines that
 * used to head this file were part of that scaffolding — they existed solely to
 * give the payload a working CommonJS `require` inside an ESM module. Nothing
 * legitimate in a PostCSS config needs `require`, so they are gone too.
 *
 * Keep this file exactly this size. If it grows, look at it with
 * `cat -A postcss.config.mjs` before trusting what your editor shows you.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
