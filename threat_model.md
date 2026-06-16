# Threat Model

## Project Overview

SRI – Release Go Live Control is a React + Vite frontend backed by an Express 5 API and PostgreSQL via Drizzle. It manages SAP cutover test scenarios, progress dashboards, duty roster data, contact directories, and user approvals for Natura's release go-live process. Authentication is provided by Clerk with Google OAuth, and authorization is enforced server-side through local user records with approved and admin states.

Production scope for this scan is limited to the `artifacts/sri` frontend, the `artifacts/api-server` backend, and shared libraries they consume. `artifacts/mockup-sandbox` is a development-only preview surface and should be ignored unless production reachability is demonstrated. The current deployment is private, so Replit's edge blocks public internet access to endpoints; insider and authenticated-user threats still matter.

## Assets

- **Operational release data** — scenario definitions, statuses, site/system mappings, Jira identifiers, and cutover planning details in `scenarios`. Unauthorized access exposes internal release execution plans and operational state.
- **Internal contact and roster data** — names, companies, phone/email contact fields, and duty roster entries in `contatos` and `escala`. This is internal directory information that can enable social engineering or privacy harm if disclosed too broadly.
- **User accounts and authorization state** — Clerk identities linked to local `users` rows, including approval status and admin role. Compromise or misassignment directly changes what data and actions a user can access.
- **Administrative reference data** — lookup tables and user approval/admin controls. Tampering can corrupt core workflows or expand access.
- **Application secrets and auth material** — Clerk secret key, publishable keys, database connection string, and session cookies/tokens. Leakage could enable impersonation or service compromise.
- **Protected governance content embedded in the frontend** — release governance notes, named personnel, meeting dates, environment details, and operational risks rendered by the governance page. If shipped in the client bundle before app authorization, this content is exposed without API access.

## Trust Boundaries

- **Browser to API** — all frontend requests cross from an untrusted client into the Express API. Every protected endpoint must authenticate and authorize on the server regardless of UI gating.
- **API to PostgreSQL** — the API has direct database access for all business data. Injection or broken authorization at the API layer exposes the full dataset.
- **API to Clerk** — authentication state and user provisioning depend on Clerk identity data and the production proxy endpoint under `/api/__clerk`.
- **Signed-out to authenticated/approved users** — `/` and auth flows are reachable without an approved app account, while most business data requires `requireApproved`.
- **Approved users to administrators** — write paths and user-management paths must remain restricted to `ADMINISTRADOR` users with `APROVADO` status.
- **Production to dev-only artifacts** — `artifacts/mockup-sandbox` and local seed/import scripts are not production attack surfaces unless separately exposed.

## Scan Anchors

- Production backend entry points: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/*.ts`
- Auth and role enforcement: `artifacts/api-server/src/middlewares/auth.ts`, Clerk proxy in `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts`
- Public surface: `/api/healthz`, signed-out frontend route `/`, Clerk sign-in/sign-up flows
- Approved-user data surface: `/api/scenarios`, `/api/lookups`, `/api/escala`, `/api/contatos`, `/api/dashboard/*`
- Admin surface: `/api/users` plus POST/PATCH/DELETE on scenarios, lookups, escala, and contatos
- Static-content caution: sensitive operational content hardcoded in eagerly imported frontend pages can cross the signed-out boundary even when the route is UI-gated
- Dev-only areas usually out of scope: `artifacts/mockup-sandbox/**`, `scripts/**`, generated `dist/**`

## Threat Categories

### Spoofing

The application trusts Clerk as the identity provider and then maps Clerk users into a local authorization model. The system must only grant approved or administrative access based on trustworthy identity attributes, and protected API routes must reject requests that lack a valid authenticated user.

### Tampering

Approved users can read broad operational datasets, while admins can modify scenarios, lookup tables, contacts, rosters, and user state. All write endpoints must validate input with strict schemas and enforce server-side admin checks so clients cannot alter privileged records through forged requests or parameter manipulation.

### Information Disclosure

This project stores internal release coordination data and internal contact information that should not leak to unapproved users, unrelated employees, or external parties. API responses, logs, public routes, and embedded documents must avoid exposing internal operational details or PII beyond the intended audience. The same rule applies to frontend bundles: route gating is not sufficient if sensitive governance content is hardcoded into eagerly loaded client modules that signed-out users can still download.

### Denial of Service

The API offers list endpoints that can return sizable datasets and performs per-request provisioning lookups against Clerk and PostgreSQL. Public or lightly protected endpoints must not permit trivial abuse that exhausts database, auth-provider, or application resources.

### Elevation of Privilege

The main risk is a user crossing from signed-out to approved access or from approved access to administrator capabilities. The system must ensure role and status checks are applied consistently to every sensitive route and that no trust is placed in client-side routing, client-provided role data, or unsafe query construction.
