import { useState } from "react";
import { useParams, Link } from "wouter";
import { useListLookups, useCreateLookup, useUpdateLookup, useDeleteLookup, getListLookupsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LABELS: Record<string, string> = {
  status_cenario: "Status do Cenário",
  status_erro: "Status Erro",
  bloco_execucao: "Bloco Execução",
  cds_hub: "CDs/Hub",
  centros: "Centros",
  entregas: "Entregas (BASELINE/CUSTOMIZADO)",
  site: "Site",
  macro_processo: "Macro Processo",
  facilitador: "Facilitador",
  quem_executa: "Quem Executa (Localidades)",
  sistema: "Sistema",
  prioridade: "Prioridade",
};

export default function CadastrosCrudPage() {
  const { category } = useParams<{ category: string }>();
  const label = LABELS[category || ""] || category;
  
  const { data: lookups, isLoading } = useListLookups({ category });
  const qc = useQueryClient();
  const { toast } = useToast();
  const { has } = usePermissions();
  const canCreate = has("cadastros", "criar");
  const canEdit = has("cadastros", "atualizar");
  const canDelete = has("cadastros", "excluir");
  const showAcoes = canEdit || canDelete;

  const createLookup = useCreateLookup();
  const updateLookup = useUpdateLookup();
  const deleteLookup = useDeleteLookup();

  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleCreate = async () => {
    if (!newValue.trim() || !category) return;
    try {
      await createLookup.mutateAsync({ data: { category, value: newValue.trim() } });
      setNewValue("");
      qc.invalidateQueries({ queryKey: getListLookupsQueryKey() });
      toast({ title: "Sucesso", description: "Item adicionado." });
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao adicionar.", variant: "destructive" });
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editValue.trim() || !category) return;
    try {
      await updateLookup.mutateAsync({ id, data: { category, value: editValue.trim() } });
      setEditingId(null);
      qc.invalidateQueries({ queryKey: getListLookupsQueryKey() });
      toast({ title: "Sucesso", description: "Item atualizado." });
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao atualizar.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    try {
      await deleteLookup.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListLookupsQueryKey() });
      toast({ title: "Sucesso", description: "Item excluído." });
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao excluir.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cadastros">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{label}</h1>
          <p className="text-muted-foreground">Gerenciar opções desta lista</p>
        </div>
      </div>

      {canCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Novo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input 
                placeholder="Digite o novo valor..." 
                value={newValue} 
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button onClick={handleCreate} disabled={!newValue.trim() || createLookup.isPending}>
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : lookups && lookups.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valor</TableHead>
                  {showAcoes && <TableHead className="text-right w-[150px]">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lookups.map((lookup) => (
                  <TableRow key={lookup.id}>
                    <TableCell>
                      {editingId === lookup.id ? (
                        <Input 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleUpdate(lookup.id)}
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium">{lookup.value}</span>
                      )}
                    </TableCell>
                    {showAcoes && (
                      <TableCell className="text-right">
                        {editingId === lookup.id ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleUpdate(lookup.id)} className="text-primary">
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <Button variant="ghost" size="icon" onClick={() => {
                                setEditingId(lookup.id);
                                setEditValue(lookup.value);
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(lookup.id)} className="text-destructive">
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
            <div className="text-center p-8 text-muted-foreground">
              Nenhuma opção cadastrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
