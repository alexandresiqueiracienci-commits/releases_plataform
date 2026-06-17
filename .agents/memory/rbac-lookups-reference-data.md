---
name: RBAC e dados de referência (lookups)
description: Como o gating por objeto/ação se relaciona com a tabela genérica de lookups, e a regra legada de upload de evidências.
---

# RBAC: gating por objeto/ação e dados de referência

O RBAC é custom: perfis → permissões (objeto:acao), validado no backend
(`requirePermission`, `requireAnyPermission`, `hasPermission`); admin passa
sempre. A UI (`usePermissions().has`) apenas espelha o backend.

## Lookups são dados de referência compartilhados
**Regra:** `GET /lookups` NÃO pode ser gated só por `cadastros:consultar`.
As listas de domínio (`lookups`, tabela genérica por `category`) são consumidas
por várias telas: filtro de Prioridade dos Dashboards, SELECTs do formulário de
Cenários e a tela de Cadastros. Gating exclusivo por `cadastros:consultar`
quebra Dashboards/Cenários para usuários comuns (o perfil USUARIO padrão não tem
`cadastros:consultar`).
**Como aplicar:** proteja leitura de referência com `requireAnyPermission`
listando todas as áreas consumidoras (cadastros/cenarios/dashboards `consultar`).
Escritas de lookup continuam gated por `cadastros:criar|atualizar|excluir`.

## Evidências: regra legada de upload é intencional
`requireUploader` permite upload se (legado: `@natura.net` / `terceiro` / admin)
OU permissão RBAC `evidencias:enviar_evidencia`. O ramo legado é **proposital e
documentado** em `lib/db/src/rbac.ts` — não é bug; não remova.
**Exclusão** de evidência usa `requireApproved` + (`evidencias:excluir` OU dono).
A UI de upload deve espelhar o backend: legado OU `has("evidencias","enviar_evidencia")`.
