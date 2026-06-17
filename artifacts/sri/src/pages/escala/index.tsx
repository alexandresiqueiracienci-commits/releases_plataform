import { useState } from "react";
import { useListEscala, useCreateEscala, useUpdateEscala, useDeleteEscala, getListEscalaQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function EscalaPage() {
  const [search, setSearch] = useState("");
  const { has } = usePermissions();
  const canCreate = has("escala", "criar");
  const canDelete = has("escala", "excluir");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: escalas, isLoading } = useListEscala({ search: search || undefined });
  const createEscala = useCreateEscala();
  const deleteEscala = useDeleteEscala();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ pessoa: "", empresa: "", papel: "", dia: "", horaInicio: "", horaFim: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEscala.mutateAsync({ data: formData });
      setIsOpen(false);
      setFormData({ pessoa: "", empresa: "", papel: "", dia: "", horaInicio: "", horaFim: "" });
      qc.invalidateQueries({ queryKey: getListEscalaQueryKey() });
      toast({ title: "Sucesso", description: "Escala adicionada." });
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao adicionar.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta escala?")) return;
    try {
      await deleteEscala.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListEscalaQueryKey() });
      toast({ title: "Sucesso", description: "Escala excluída." });
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao excluir.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Escala</h1>
          <p className="text-muted-foreground">Plantões e alocação da equipe</p>
        </div>
        {canCreate && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Escala
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar à Escala</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input placeholder="Pessoa" required value={formData.pessoa} onChange={e => setFormData({...formData, pessoa: e.target.value})} />
                <Input placeholder="Empresa" value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} />
                <Input placeholder="Papel" value={formData.papel} onChange={e => setFormData({...formData, papel: e.target.value})} />
                <Input placeholder="Dia" value={formData.dia} onChange={e => setFormData({...formData, dia: e.target.value})} />
                <div className="flex gap-2">
                  <Input placeholder="Início (ex: 08:00)" value={formData.horaInicio} onChange={e => setFormData({...formData, horaInicio: e.target.value})} />
                  <Input placeholder="Fim (ex: 18:00)" value={formData.horaFim} onChange={e => setFormData({...formData, horaFim: e.target.value})} />
                </div>
                <Button type="submit" className="w-full">Salvar</Button>
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
              placeholder="Buscar pessoa ou empresa..."
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
          ) : escalas && escalas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pessoa</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Dia</TableHead>
                  <TableHead>Horário</TableHead>
                  {canDelete && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {escalas.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.pessoa}</TableCell>
                    <TableCell>{item.empresa}</TableCell>
                    <TableCell>{item.papel}</TableCell>
                    <TableCell>{item.dia}</TableCell>
                    <TableCell>{item.horaInicio} - {item.horaFim}</TableCell>
                    {canDelete && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">Nenhuma escala encontrada.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
