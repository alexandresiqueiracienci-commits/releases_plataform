---
name: xlsx seeding
description: Gotchas when parsing .xlsx in this repo's Node ESM sandbox/scripts for data seeding
---

# Parsing .xlsx for seeding

The seed pipeline lives in `@workspace/scripts` (`scripts/src/seed.ts`), run via
`pnpm --filter @workspace/scripts run seed`. Lessons that cost multiple attempts:

- **`xlsx` ESM build has no `readFile`/`writeFile`** (no bundled `fs`). Use
  `XLSX.read(fs.readFileSync(path), { type: "buffer" })`, not `XLSX.readFile`.
- **Non-ASCII filenames break literal paths.** `attached_assets` filenames with
  accents (e.g. "Liberação") can be NFC/NFD-mismatched vs. what you type, so
  `fs.readFileSync("...Liberação...")` throws ENOENT. Resolve files by scanning
  the dir and matching a plain-ASCII substring instead of hardcoding the name.
- **The code_execution sandbox can't `await import('xlsx')` from the workspace root**
  (not resolvable there). Run xlsx parsing from inside the scripts package with tsx.
- **Spreadsheets from the business are messy.** The scenarios sheet maps cleanly by
  column index, but roster/schedule sheets interleave section-label rows in the name
  column (empty empresa+papel) and a header row ("Nome"). Filter both out, or they
  get seeded as fake people.
- **Why seed is transactional + idempotent:** the seed deletes then reloads all four
  tables inside one `db.transaction` so a mid-run parse/DB failure can't leave a
  half-empty DB. File selection fails loudly if >1 xlsx matches a substring (avoids
  silently seeding from a stale workbook).
