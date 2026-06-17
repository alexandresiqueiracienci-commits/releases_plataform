import { useState } from "react";
import { Link } from "wouter";
import { useListScenarios, useDeleteScenario, getListScenariosQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CenariosListPage() {
  const [search, setSearch] = useState("");
  const { has } = usePermissions();
  const canCreate = has("cenarios", "criar");
  const canEdit = has("cenarios", "atualizar");
  const canDelete = has("cenarios", "excluir");
  const showAcoes = canEdit || canDelete;
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: cenarios, isLoading } = useListScenarios({ search: search || undefined });
  const deleteCenario = useDeleteScenario();

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este cenário?")) return;
    try {
      await deleteCenario.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListScenariosQueryKey() });
      toast({ title: "Sucesso", description: "Cenário excluído." });
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao excluir.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Cenários</h1>
          <p className="text-muted-foreground">Listagem e execução de testes</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/cenarios/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cenário
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cenários..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : cenarios && cenarios.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Teste</TableHead>
                    <TableHead>Cenário</TableHead>
                    <TableHead>Sistema</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    {showAcoes && <TableHead className="text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cenarios.map((cenario) => (
                    <TableRow key={cenario.id}>
                      <TableCell className="font-medium">{cenario.idTeste}</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={cenario.cenario || ""}>
                        {cenario.cenario}
                      </TableCell>
                      <TableCell>{cenario.sistema}</TableCell>
                      <TableCell>{cenario.site}</TableCell>
                      <TableCell>{cenario.prioridade}</TableCell>
                      <TableCell>{cenario.statusCenario}</TableCell>
                      {showAcoes && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/cenarios/${cenario.id}/editar`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {canDelete && (
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(cenario.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Nenhum cenário encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
