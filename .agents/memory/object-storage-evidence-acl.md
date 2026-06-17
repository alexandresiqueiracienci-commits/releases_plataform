---
name: Object storage evidence ACL
description: Security invariants for the signed-URL upload + private-object download flow used by evidências
---

# Object storage evidence ACL

When using the Replit object-storage templates' 2-step upload (request signed URL → PUT → register row), the server MUST NOT trust the client-supplied `objectPath`.

**Rule 1 — validate on registration.** On evidence/file registration, reject any `objectPath` that is not the canonical issued prefix `^/objects/uploads/<id>$`. Otherwise an authorized uploader can register arbitrary private objects as their own.

**Rule 2 — bind downloads to records.** The private-object serve route (`GET /storage/objects/*`) authorizes by role only (`requireApproved`); it does not know which objects are legitimately shared. Before streaming, look up the requested `objectPath` in the owning table (e.g. `evidenciasTable`) and 404 if absent. This binds object access to a business record instead of exposing the whole private bucket to every approved user.

**Why:** code review flagged that role-only protection on both register and serve lets a permitted uploader surface any private object to all approved users (cross-object disclosure). The two checks together close the gap.

**How to apply:** apply both whenever adding new signed-URL upload flows on top of the object-storage templates — template `getObjectEntityFile` only checks existence, not authorization.
