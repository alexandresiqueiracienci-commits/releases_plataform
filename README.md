# SRI – Release Go Live Control

Aplicação web de controle do *go live* da implantação SAP (ECC / S/4) da Natura.
Acompanha cenários de teste do cutover, dashboards de progresso (Site × Status),
e documentação útil (escala de plantão e contatos). Interface em português (pt-BR).

## Visão geral

- **Landing "Release Go Live Control"** — pública e pós-login, com cards de
  navegação, linha do tempo macro e o PDF **"Jun_26 Plano Macro Cutover"** embutido.
- **Dashboards** — matriz Site × Status do Cenário (com totais e percentuais),
  filtro por Prioridade e gráficos de barras/pizza (por Status, Site e Sistema).
- **Cenários** — listagem com busca/filtros e formulário completo (~31 campos);
  campos de domínio são SELECTs alimentados pelas tabelas de Cadastros.
- **Cadastros** (somente ADMINISTRADOR) — CRUD genérico das listas de domínio.
- **Docs Úteis** — Escala (plantões) e Contatos, com busca.
- **Usuários** (somente ADMINISTRADOR) — aprovação de acessos e atribuição de perfil.

## Autenticação e perfis

Login via **Google OAuth (Clerk)**. No primeiro acesso o usuário é provisionado
automaticamente:

| E-mail | Perfil | Status |
| --- | --- | --- |
| `alexandresiqueira.cienci@natura.net` (admin inicial) | `ADMINISTRADOR` | `APROVADO` |
| Qualquer `@natura.net` | `USUARIO` | `APROVADO` |
| Terceiros (outros domínios) | `USUARIO` | `PENDENTE` (aguarda aprovação) |

- **PENDENTE** vê a tela "Aguardando aprovação"; **REJEITADO** vê "Acesso negado".
- **USUARIO** tem acesso de consulta (listas e dashboards).
- **ADMINISTRADOR** tem acesso total: Cadastros, CRUD de Cenários, Escala,
  Contatos e gestão de Usuários.

A regra é aplicada no backend pelos middlewares `requireApproved` (leitura) e
`requireAdmin` (escrita/admin) — a UI apenas reflete o que o servidor permite.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + shadcn/ui + Recharts + Wouter (artifact `sri`)
- Backend: Express 5 (artifact `api-server`)
- Banco: PostgreSQL + Drizzle ORM
- Contrato: OpenAPI (`lib/api-spec/openapi.yaml`) → hooks React Query
  (`@workspace/api-client-react`) e schemas Zod (`@workspace/api-zod`) via Orval
- Auth: Clerk (`@clerk/express` no servidor, `@clerk/react` no cliente)

## Estrutura

```
artifacts/
  sri/             # Frontend (React + Vite), previewPath "/"
  api-server/      # Backend Express, rotas em src/routes, auth em src/middlewares
lib/
  db/              # Schema Drizzle (src/schema) + cliente
  api-spec/        # openapi.yaml (fonte da verdade do contrato)
  api-zod/         # Schemas Zod gerados
  api-client-react/# Hooks React Query gerados
```

## Rodar localmente

Os apps rodam via *workflows* do Replit (não use `pnpm dev` na raiz):

- `artifacts/api-server: API Server` — backend
- `artifacts/sri: web` — frontend

Comandos úteis:

- `pnpm run typecheck` — checagem de tipos de todos os pacotes
- `pnpm --filter @workspace/db run push` — aplica o schema no banco (dev)
- `pnpm --filter @workspace/api-spec run codegen` — regenera hooks/schemas do OpenAPI

## Variáveis de ambiente

- `DATABASE_URL` — string de conexão Postgres (provisionada pelo Replit)
- `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` — credenciais Clerk (servidor)
- `VITE_CLERK_PUBLISHABLE_KEY` — chave pública Clerk (cliente)
- `SESSION_SECRET` — segredo de sessão

## Configuração do Google OAuth (Clerk)

1. No painel de **Auth** do Replit (instância Clerk gerenciada), habilite o
   provedor **Google** (em instâncias gerenciadas normalmente já vem ativo).
2. Para personalizar a tela ("Continuar com SRI") e domínios de produção,
   ajuste a aplicação Clerk correspondente.
3. O admin inicial é definido em código
   (`artifacts/api-server/src/middlewares/auth.ts`, constante `ADMIN_EMAIL`).
   Após o primeiro login dele, novos administradores podem ser promovidos pela
   tela **Usuários**.

## Carga inicial de dados (seed)

As listas de domínio (Cadastros) e os cenários de teste são carregados a partir
da planilha `.xlsx` fornecida pela área (≈546 cenários + domínios). Enquanto a
planilha não é importada, o app funciona normalmente, porém com listas vazias.

## Publicação

O projeto é publicável pelo Replit (Deploy). Após publicar, o app fica disponível
nos domínios HTTPS listados em `$REPLIT_DOMAINS` e pode ser embutido via iframe.
Garanta que as variáveis Clerk e o `DATABASE_URL` estejam configurados no
ambiente de produção e que o schema do banco de produção esteja aplicado.
