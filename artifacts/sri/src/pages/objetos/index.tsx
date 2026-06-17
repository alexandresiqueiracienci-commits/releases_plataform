import { useState } from "react";
import {
  useListObjetos,
  useCreateObjeto,
  useUpdateObjeto,
  useDeleteObjeto,
  getListObjetosQueryKey,
  type Objeto,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ACAO_ORDER, acaoLabel } from "@/lib/rbac";
import { Plus, Pencil, Trash2, Lock, Boxes } from "lucide-react";

interface FormState {
  chave: string;
  nome: string;
  descricao: string;
  acoes: string[];
}

const EMPTY_FORM: FormState = {
  chave: "",
  nome: "",
  descricao: "",
  acoes: ["consultar"],
};

export default function ObjetosPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: objetos, isLoading } = useListObjetos();
  const createObjeto = useCreateObjeto();
  const updateObjeto = useUpdateObjeto();
  const deleteObjeto = useDeleteObjeto();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Objeto | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [toDelete, setToDelete] = useState<Objeto | null>(null);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getListObjetosQueryKey() });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (o: Objeto) => {
    setEditing(o);
    setForm({
      chave: o.chave,
      nome: o.nome,
      descricao: o.descricao ?? "",
      acoes: [...o.acoes],
    });
    setDialogOpen(true);
  };

  const toggleAcao = (acao: string) => {
    setForm((f) => ({
      ...f,
      acoes: f.acoes.includes(acao)
        ? f.acoes.filter((a) => a !== acao)
        : [...f.acoes, acao],
    }));
  };

  const handleSave = async () => {
    const nome = form.nome.trim();
    const chave = form.chave.trim();
    const descricao = form.descricao.trim();
    if (!nome) return;
    try {
      if (editing) {
        await updateObjeto.mutateAsync({
          id: editing.id,
          data: { nome, descricao: descricao || undefined, acoes: form.acoes },
        });
      } else {
        if (!chave) return;
        await createObjeto.mutateAsync({
          data: { chave, nome, descricao: descricao || undefined, acoes: form.acoes },
        });
      }
      invalidate();
      setDialogOpen(false);
      toast({ title: "Sucesso", description: "Objeto salvo." });
    } catch (err: unknown) {
      const status =
        (err as { response?: { status?: number }; status?: number })?.response
          ?.status ?? (err as { status?: number })?.status;
      toast({
        title: "Erro",
        description:
          status === 409
            ? "Já existe um objeto com esta chave."
            : "Falha ao salvar objeto.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteObjeto.mutateAsync({ id: toDelete.id });
      invalidate();
      toast({ title: "Sucesso", description: "Objeto excluído." });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao excluir objeto.",
        variant: "destructive",
      });
    } finally {
      setToDelete(null);
    }
  };

  const isSaving = createObjeto.isPending || updateObjeto.isPending;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Objetos
          </h1>
          <p className="text-muted-foreground">
            Telas e recursos do sistema e as ações disponíveis em cada um
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Novo objeto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Boxes className="h-5 w-5 text-primary" />
            Objetos do sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : objetos && objetos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Chave</TableHead>
                  <TableHead>Ações</TableHead>
                  <TableHead className="text-right">Gerenciar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {objetos.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {o.nome}
                        {o.sistema && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      {o.descricao && (
                        <p className="text-xs text-muted-foreground font-normal">
                          {o.descricao}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{o.chave}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {o.acoes.map((a) => (
                          <Badge key={a} variant="secondary" className="text-xs">
                            {acaoLabel(a)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(o)}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={o.sistema}
                          onClick={() => setToDelete(o)}
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum objeto cadastrado.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar objeto" : "Novo objeto"}</DialogTitle>
            <DialogDescription>
              Defina o objeto (tela/recurso) e as ações que podem ser concedidas
              aos perfis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="obj-nome">Nome</Label>
              <Input
                id="obj-nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex.: Relatórios"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obj-chave">Chave</Label>
              <Input
                id="obj-chave"
                value={form.chave}
                disabled={!!editing}
                onChange={(e) =>
                  setForm((f) => ({ ...f, chave: e.target.value }))
                }
                placeholder="Ex.: relatorios"
              />
              {editing && (
                <p className="text-xs text-muted-foreground">
                  A chave não pode ser alterada após a criação.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="obj-desc">Descrição (opcional)</Label>
              <Textarea
                id="obj-desc"
                value={form.descricao}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descricao: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Ações disponíveis</Label>
              <div className="grid grid-cols-2 gap-2">
                {ACAO_ORDER.map((acao) => (
                  <label
                    key={acao}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={form.acoes.includes(acao)}
                      onCheckedChange={() => toggleAcao(acao)}
                    />
                    {acaoLabel(acao)}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving ||
                !form.nome.trim() ||
                (!editing && !form.chave.trim()) ||
                form.acoes.length === 0
              }
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir objeto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o objeto "{toDelete?.nome}"? As
              permissões associadas a ele serão removidas dos perfis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
