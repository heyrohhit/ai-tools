// Renders a JSON-LD structured-data block. Server-safe (no client JS).
//
// Usage: <StructuredData data={{ "@context": "https://schema.org", ... }} />
export default function StructuredData({ data }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw JSON in the DOM; dangerouslySetInnerHTML is the
      // standard, safe pattern here because the input is our own object.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
