---
name: API Zod date serialization
description: Why DB rows must be JSON-serialized before parsing with Orval-generated Zod response schemas
---

# Serialize DB rows before Zod `.parse()` in API responses

When returning Drizzle rows through Orval-generated Zod response schemas, run the
row through a JSON round-trip first (`JSON.parse(JSON.stringify(row))`, see the
`toJson` helper in `artifacts/api-server/src/lib/serialize.ts`).

**Why:** Drizzle returns `timestamp` columns as JS `Date` objects, but the
generated Zod schemas type date fields as ISO `string`. Calling `.parse()` on a
raw row throws because `z.string()` rejects a `Date`. The JSON round-trip turns
`Date` into an ISO string and drops `undefined`, so the schema parses cleanly.

**How to apply:** Any new API route that validates its output with a generated
response schema should wrap the DB result in `toJson()` before `.parse()`.
