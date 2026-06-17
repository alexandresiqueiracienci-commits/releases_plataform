// Definições canônicas do controle de acesso por perfis (RBAC).

export const RBAC_ACOES = [
  "consultar",
  "criar",
  "atualizar",
  "excluir",
  "enviar_evidencia",
  "alterar_status",
] as const;

export type RbacAcao = (typeof RBAC_ACOES)[number];

export const ACAO_LABELS: Record<RbacAcao, string> = {
  consultar: "Consultar",
  criar: "Criar",
  atualizar: "Atualizar",
  excluir: "Excluir",
  enviar_evidencia: "Enviar evidência",
  alterar_status: "Alterar status do cenário",
};

export const ADMIN_PROFILE_CHAVE = "ADMINISTRADOR";
export const DEFAULT_PROFILE_CHAVE = "USUARIO";

export const DEFAULT_PERFIS: {
  chave: string;
  nome: string;
  descricao: string;
}[] = [
  {
    chave: ADMIN_PROFILE_CHAVE,
    nome: "Administrador",
    descricao: "Acesso total ao sistema, incluindo todas as funções administrativas.",
  },
  {
    chave: DEFAULT_PROFILE_CHAVE,
    nome: "Usuário (Consulta)",
    descricao: "Acesso de consulta às áreas operacionais do sistema.",
  },
];

export const DEFAULT_OBJETOS: {
  chave: string;
  nome: string;
  descricao: string;
  acoes: RbacAcao[];
}[] = [
  {
    chave: "dashboards",
    nome: "Dashboards",
    descricao: "Painéis e gráficos de progresso.",
    acoes: ["consultar"],
  },
  {
    chave: "cenarios",
    nome: "Cenários",
    descricao: "Cenários de teste de liberação.",
    acoes: ["consultar", "criar", "atualizar", "excluir", "alterar_status"],
  },
  {
    chave: "escala",
    nome: "Escala",
    descricao: "Escala de plantão.",
    acoes: ["consultar", "criar", "atualizar", "excluir"],
  },
  {
    chave: "contatos",
    nome: "Contatos",
    descricao: "Lista de contatos.",
    acoes: ["consultar", "criar", "atualizar", "excluir"],
  },
  {
    chave: "evidencias",
    nome: "Evidências",
    descricao: "Evidências dos testes de liberação.",
    acoes: ["consultar", "enviar_evidencia", "excluir"],
  },
  {
    chave: "cadastros",
    nome: "Cadastros",
    descricao: "Listas de domínio.",
    acoes: ["consultar", "criar", "atualizar", "excluir"],
  },
  {
    chave: "usuarios",
    nome: "Usuários",
    descricao: "Aprovação e administração de usuários.",
    acoes: ["consultar", "criar", "atualizar", "excluir"],
  },
  {
    chave: "perfis",
    nome: "Perfis",
    descricao: "Perfis de acesso e permissões.",
    acoes: ["consultar", "criar", "atualizar", "excluir"],
  },
  {
    chave: "objetos",
    nome: "Objetos",
    descricao: "Objetos/telas do sistema.",
    acoes: ["consultar", "criar", "atualizar", "excluir"],
  },
];

// Permissões padrão do perfil Usuário: consulta às áreas operacionais.
// (O envio de evidências é preservado para contas @natura.net e terceiros
// autorizados pela regra legada, independente do perfil.)
export const USUARIO_DEFAULT_PERMS: { objeto: string; acao: RbacAcao }[] = [
  { objeto: "dashboards", acao: "consultar" },
  { objeto: "cenarios", acao: "consultar" },
  { objeto: "escala", acao: "consultar" },
  { objeto: "contatos", acao: "consultar" },
  { objeto: "evidencias", acao: "consultar" },
];
