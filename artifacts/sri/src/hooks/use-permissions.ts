import { useGetMe } from "@workspace/api-client-react";
import { ADMIN_PROFILE_CHAVE } from "@/lib/rbac";

// Reflete no cliente o que o servidor já autoriza. A decisão final é sempre
// feita no backend; isto serve apenas para esconder/mostrar elementos da UI.
export function usePermissions() {
  const { data: me, isLoading } = useGetMe();

  const isApproved = me?.status === "APROVADO";
  const isAdmin = me?.profile === ADMIN_PROFILE_CHAVE && isApproved;
  const permissions = me?.permissions ?? [];

  const has = (objeto: string, acao: string): boolean => {
    if (!isApproved) return false;
    if (isAdmin) return true;
    return permissions.includes(`${objeto}:${acao}`);
  };

  return { isAdmin, isApproved, permissions, has, isLoading, me };
}
