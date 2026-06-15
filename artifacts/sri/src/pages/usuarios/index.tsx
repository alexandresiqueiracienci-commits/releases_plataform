import { useState } from "react";
import { useListUsers, useUpdateUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Check, X, ShieldAlert } from "lucide-react";

export default function UsuariosPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();
  const qc = useQueryClient();

  const queryParams = filterStatus !== "all" ? { status: filterStatus } : {};
  const { data: users, isLoading } = useListUsers(queryParams);
  const updateUser = useUpdateUser();

  const handleUpdate = async (id: number, updates: { status?: string, profile?: string }) => {
    try {
      await updateUser.mutateAsync({ id, data: updates });
      qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast({ title: "Sucesso", description: "Usuário atualizado." });
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao atualizar usuário.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "PENDENTE") return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pendente</Badge>;
    if (status === "APROVADO") return <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Aprovado</Badge>;
    if (status === "REJEITADO") return <Badge variant="destructive">Rejeitado</Badge>;
    return <Badge>{status}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Usuários</h1>
          <p className="text-muted-foreground">Aprovação de acessos e definição de perfis</p>
        </div>
        <div className="w-full sm:w-48">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="PENDENTE">Pendentes</SelectItem>
              <SelectItem value="APROVADO">Aprovados</SelectItem>
              <SelectItem value="REJEITADO">Rejeitados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className={u.status === "PENDENTE" ? "bg-amber-50/50" : ""}>
                    <TableCell className="font-medium">{u.name || "N/A"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{getStatusBadge(u.status)}</TableCell>
                    <TableCell>
                      <Select 
                        value={u.profile} 
                        onValueChange={(val) => handleUpdate(u.id, { profile: val })}
                      >
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USUARIO">USUÁRIO (Consulta)</SelectItem>
                          <SelectItem value="ADMINISTRADOR">ADMINISTRADOR</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      {u.status === "PENDENTE" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200" onClick={() => handleUpdate(u.id, { status: "APROVADO" })}>
                            <Check className="mr-1 h-3 w-3" /> Aprovar
                          </Button>
                          <Button size="sm" variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200" onClick={() => handleUpdate(u.id, { status: "REJEITADO" })}>
                            <X className="mr-1 h-3 w-3" /> Rejeitar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                           <Button size="sm" variant="ghost" disabled>
                             Nenhuma ação
                           </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 flex flex-col items-center justify-center text-muted-foreground">
              <ShieldAlert className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p>Nenhum usuário encontrado com os filtros selecionados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
