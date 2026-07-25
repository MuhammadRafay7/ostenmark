/**
 * Emits a JSON-LD structured-data block.
 *
 * Rendered as a plain script tag rather than via next/script so it is present in
 * the server-rendered HTML — crawlers that don't execute JavaScript still need to
 * see it. `JSON.stringify` output is escaped for `</script>` sequences, which is
 * the only injection vector for a JSON-LD payload built from CMS content.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const payload = JSON.stringify(Array.isArray(data) ? data : [data]).replace(
    /</g,
    "\\u003c",
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}
