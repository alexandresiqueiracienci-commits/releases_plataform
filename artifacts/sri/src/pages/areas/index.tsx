import { useState } from "react";
import {
  useListAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
  getListAreasQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AreasPage() {
  const [search, setSearch] = useState("");
  const { has } = usePermissions();
  const canCreate = has("areas", "criar");
  const canUpdate = has("areas", "atualizar");
  const canDelete = has("areas", "excluir");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: areas, isLoading } = useListAreas({
    search: search || undefined,
  });

  const createArea = useCreateArea();
  const updateArea = useUpdateArea();
  const deleteArea = useDeleteArea();

  const [isOpen, setIsOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNome, setEditingNome] = useState("");

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getListAreasQueryKey() });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createArea.mutateAsync({ data: { nome } });
      setIsOpen(false);
      setNome("");
      invalidate();
      toast({ title: "Sucesso", description: "Área adicionada." });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao adicionar (verifique duplicidade).",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await updateArea.mutateAsync({ id, data: { nome: editingNome } });
      setEditingId(null);
      invalidate();
      toast({ title: "Sucesso", description: "Área atualizada." });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao atualizar.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta área?")) return;
    try {
      await deleteArea.mutateAsync({ id });
      invalidate();
      toast({ title: "Sucesso", description: "Área excluída." });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao excluir.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Áreas Impactadas
          </h1>
          <p className="text-muted-foreground">
            Catálogo de áreas impactadas pelas demandas
          </p>
        </div>
        {canCreate && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Área
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Área</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  placeholder="Nome da área"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Salvar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar áreas..."
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
            </div>
          ) : (areas ?? []).length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  {(canUpdate || canDelete) && (
                    <TableHead className="text-right">Ações</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(areas ?? []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {editingId === item.id ? (
                        <Input
                          value={editingNome}
                          onChange={(e) => setEditingNome(e.target.value)}
                        />
                      ) : (
                        item.nome
                      )}
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="text-right">
                        {editingId === item.id ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSaveEdit(item.id)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            {canUpdate && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditingNome(item.nome);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Nenhuma área encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
