// Convert DB rows (with Date objects) into JSON-safe plain objects so the
// generated Zod response schemas (which expect ISO strings) can parse them.
export function toJson<T>(value: T): unknown {
  return JSON.parse(JSON.stringify(value));
}
