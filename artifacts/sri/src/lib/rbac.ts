// Rótulos das ações de permissão (espelha lib/db/src/rbac.ts para uso na UI).
export const ACAO_LABELS: Record<string, string> = {
  consultar: "Consultar",
  criar: "Criar",
  atualizar: "Atualizar",
  excluir: "Excluir",
  enviar_evidencia: "Enviar evidência",
  alterar_status: "Alterar status do cenário",
};

export const ACAO_ORDER = [
  "consultar",
  "criar",
  "atualizar",
  "excluir",
  "enviar_evidencia",
  "alterar_status",
];

export function acaoLabel(acao: string): string {
  return ACAO_LABELS[acao] ?? acao;
}

export const ADMIN_PROFILE_CHAVE = "ADMINISTRADOR";
