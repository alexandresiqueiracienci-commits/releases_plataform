# SRI – Release Go Live Control

Aplicação web de controle do *go live* da implantação SAP (ECC / S/4) da Natura:
cenários de teste do cutover, dashboards de progresso, escala de plantão e contatos.
Interface em português (pt-BR), sem emojis.

## Run & Operate

- Workflows do Replit rodam os apps (não use `pnpm dev` na raiz):
  - `artifacts/api-server: API Server` — backend Express
  - `artifacts/sri: web` — frontend React/Vite (previewPath `/`)
- `pnpm run typecheck` — typecheck de todos os pacotes
- `pnpm run build` — typecheck + build
- `pnpm --filter @workspace/api-spec run codegen` — regenera hooks/Zod do OpenAPI
- `pnpm --filter @workspace/db run push` — aplica schema no banco (dev)
- Env obrigatórias: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`,
  `VITE_CLERK_PUBLISHABLE_KEY`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + shadcn/ui + Recharts + Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validação: Zod (`zod/v4`), `drizzle-zod`
- Codegen: Orval (a partir do OpenAPI)
- Auth: Clerk (`@clerk/express` no servidor, `@clerk/react` no cliente), Google OAuth

## Where things live

- DB schema (fonte da verdade): `lib/db/src/schema/*.ts`
- Contrato da API: `lib/api-spec/openapi.yaml` → `@workspace/api-zod` (Zod) e
  `@workspace/api-client-react` (hooks React Query)
- Rotas backend: `artifacts/api-server/src/routes/*` (barrel em `routes/index.ts`)
- Auth/gating backend: `artifacts/api-server/src/middlewares/auth.ts`
- Páginas frontend: `artifacts/sri/src/pages/*`, shell em `components/layout/AppShell.tsx`

## Architecture decisions

- **Lookups são uma única tabela genérica** (`lookups`) com coluna `category`.
  Categorias: status_cenario, status_erro, bloco_execucao, cds_hub, centros,
  entregas, site, macro_processo, facilitador, quem_executa, sistema, prioridade.
- **Acesso é decidido no backend** via `requireApproved` (leitura) e `requireAdmin`
  (escrita/admin); a UI apenas reflete o que o servidor permite.
- **Provisionamento JIT de usuário** no primeiro login (em `middlewares/auth.ts`):
  admin inicial `alexandresiqueira.cienci@natura.net` → ADMINISTRADOR/APROVADO;
  `@natura.net` → USUARIO/APROVADO; terceiros → USUARIO/PENDENTE.
- **Respostas da API são serializadas para JSON antes do `.parse()` do Zod**
  (helper `toJson`), pois o Drizzle devolve `Date` e os schemas gerados esperam
  strings ISO.

## Product

Landing "Release Go Live Control" (PDF macro cutover + navegação), Dashboards
(matriz Site × Status + gráficos, filtro por Prioridade), Cenários (lista +
formulário completo com SELECTs de domínio), Cadastros (CRUD das listas de
domínio, admin), Docs Úteis (Escala e Contatos) e Usuários (aprovação, admin).

## User preferences

- Idioma da interface: português do Brasil (pt-BR). Sem emojis.

## Gotchas

- A carga inicial (Cadastros + ~546 cenários) vem de uma planilha `.xlsx` da área;
  até importar, o app funciona com listas vazias.
- Sempre rode `pnpm --filter @workspace/api-spec run codegen` após mudar o OpenAPI.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
