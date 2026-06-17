import { useEffect, useMemo, useState } from "react";
import {
  useListPerfis,
  useCreatePerfil,
  useUpdatePerfil,
  useDeletePerfil,
  useListObjetos,
  useGetPerfilPermissoes,
  useSetPerfilPermissoes,
  getListPerfisQueryKey,
  getGetPerfilPermissoesQueryKey,
  type Perfil,
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
import { acaoLabel, ADMIN_PROFILE_CHAVE } from "@/lib/rbac";
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  ShieldCheck,
  UserCog,
  Save,
} from "lucide-react";

type PermKey = string; // `${objetoId}:${acao}`

const permKey = (objetoId: number, acao: string): PermKey =>
  `${objetoId}:${acao}`;

export default function PerfisPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: perfis, isLoading: loadingPerfis } = useListPerfis();
  const { data: objetos, isLoading: loadingObjetos } = useListObjetos();
  const createPerfil = useCreatePerfil();
  const updatePerfil = useUpdatePerfil();
  const deletePerfil = useDeletePerfil();
  const setPermissoes = useSetPerfilPermissoes();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Perfil | null>(null);
  const [form, setForm] = useState({ nome: "", descricao: "" });
  const [toDelete, setToDelete] = useState<Perfil | null>(null);

  const [selectedPerfilId, setSelectedPerfilId] = useState<number | null>(null);

  const selectedPerfil = useMemo(
    () => perfis?.find((p) => p.id === selectedPerfilId) ?? null,
    [perfis, selectedPerfilId],
  );
  const selectedIsAdmin = selectedPerfil?.chave === ADMIN_PROFILE_CHAVE;

  // Seleciona automaticamente o primeiro perfil quando a lista carrega.
  useEffect(() => {
    if (selectedPerfilId === null && perfis && perfis.length > 0) {
      setSelectedPerfilId(perfis[0].id);
    }
  }, [perfis, selectedPerfilId]);

  const { data: perfilPerms, isLoading: loadingPerms } = useGetPerfilPermissoes(
    selectedPerfilId ?? 0,
    {
      query: {
        enabled: selectedPerfilId !== null && !selectedIsAdmin,
        queryKey: getGetPerfilPermissoesQueryKey(selectedPerfilId ?? 0),
      },
    },
  );

  const [draft, setDraft] = useState<Set<PermKey>>(new Set());

  // Sincroniza o rascunho da matriz quando as permissões do perfil chegam.
  useEffect(() => {
    if (perfilPerms) {
      setDraft(new Set(perfilPerms.map((p) => permKey(p.objetoId, p.acao))));
    } else {
      setDraft(new Set());
    }
  }, [perfilPerms, selectedPerfilId]);

  const togglePerm = (objetoId: number, acao: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      const key = permKey(objetoId, acao);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nome: "", descricao: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: Perfil) => {
    setEditing(p);
    setForm({ nome: p.nome, descricao: p.descricao ?? "" });
    setDialogOpen(true);
  };

  const handleSavePerfil = async () => {
    const nome = form.nome.trim();
    const descricao = form.descricao.trim();
    if (!nome) return;
    try {
      if (editing) {
        await updatePerfil.mutateAsync({
          id: editing.id,
          data: { nome, descricao: descricao || undefined },
        });
      } else {
        await createPerfil.mutateAsync({
          data: { nome, descricao: descricao || undefined },
        });
      }
      qc.invalidateQueries({ queryKey: getListPerfisQueryKey() });
      setDialogOpen(false);
      toast({ title: "Sucesso", description: "Perfil salvo." });
    } catch (err: unknown) {
      const status =
        (err as { response?: { status?: number }; status?: number })?.response
          ?.status ?? (err as { status?: number })?.status;
      toast({
        title: "Erro",
        description:
          status === 409
            ? "Já existe um perfil com este nome."
            : "Falha ao salvar perfil.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePerfil.mutateAsync({ id: toDelete.id });
      qc.invalidateQueries({ queryKey: getListPerfisQueryKey() });
      if (selectedPerfilId === toDelete.id) setSelectedPerfilId(null);
      toast({
        title: "Sucesso",
        description:
          "Perfil excluído. Usuários foram reatribuídos ao perfil padrão.",
      });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao excluir perfil.",
        variant: "destructive",
      });
    } finally {
      setToDelete(null);
    }
  };

  const handleSavePerms = async () => {
    if (selectedPerfilId === null || selectedIsAdmin) return;
    const permissoes = Array.from(draft).map((k) => {
      const [objetoId, acao] = k.split(":");
      return { objetoId: Number(objetoId), acao };
    });
    try {
      await setPermissoes.mutateAsync({
        id: selectedPerfilId,
        data: { permissoes },
      });
      qc.invalidateQueries({
        queryKey: getGetPerfilPermissoesQueryKey(selectedPerfilId),
      });
      toast({ title: "Sucesso", description: "Permissões atualizadas." });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao salvar permissões.",
        variant: "destructive",
      });
    }
  };

  const isSavingPerfil = createPerfil.isPending || updatePerfil.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Perfis
          </h1>
          <p className="text-muted-foreground">
            Perfis de acesso e definição de permissões por objeto
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Novo perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de perfis */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              Perfis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingPerfis ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : perfis && perfis.length > 0 ? (
              <ul className="divide-y">
                {perfis.map((p) => {
                  const isAdminP = p.chave === ADMIN_PROFILE_CHAVE;
                  const active = p.id === selectedPerfilId;
                  return (
                    <li
                      key={p.id}
                      className={`flex items-center justify-between gap-2 p-3 cursor-pointer hover:bg-muted/50 ${
                        active ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedPerfilId(p.id)}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-medium">
                          {isAdminP ? (
                            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                          ) : null}
                          <span className="truncate">{p.nome}</span>
                          {p.sistema && (
                            <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                          )}
                        </div>
                        {p.descricao && (
                          <p className="text-xs text-muted-foreground truncate">
                            {p.descricao}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(p);
                          }}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          disabled={p.sistema}
                          onClick={(e) => {
                            e.stopPropagation();
                            setToDelete(p);
                          }}
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                Nenhum perfil cadastrado.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Matriz de permissões */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-lg">
              {selectedPerfil
                ? `Permissões — ${selectedPerfil.nome}`
                : "Permissões"}
            </CardTitle>
            {selectedPerfil && !selectedIsAdmin && (
              <Button
                size="sm"
                onClick={handleSavePerms}
                disabled={setPermissoes.isPending || loadingPerms}
              >
                <Save className="mr-2 h-4 w-4" />
                {setPermissoes.isPending ? "Salvando..." : "Salvar permissões"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!selectedPerfil ? (
              <p className="text-muted-foreground text-sm">
                Selecione um perfil para gerenciar as permissões.
              </p>
            ) : selectedIsAdmin ? (
              <div className="flex items-start gap-3 rounded-md border bg-muted/30 p-4">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Acesso total</p>
                  <p className="text-sm text-muted-foreground">
                    O perfil Administrador possui acesso irrestrito a todos os
                    objetos e ações. As permissões não podem ser editadas.
                  </p>
                </div>
              </div>
            ) : loadingObjetos || loadingPerms ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : objetos && objetos.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[160px]">Objeto</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {objetos.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium align-top">
                          {o.nome}
                          {o.descricao && (
                            <p className="text-xs text-muted-foreground font-normal">
                              {o.descricao}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {o.acoes.map((acao) => {
                              const key = permKey(o.id, acao);
                              return (
                                <label
                                  key={acao}
                                  className="flex items-center gap-2 text-sm cursor-pointer"
                                >
                                  <Checkbox
                                    checked={draft.has(key)}
                                    onCheckedChange={() =>
                                      togglePerm(o.id, acao)
                                    }
                                  />
                                  {acaoLabel(acao)}
                                </label>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhum objeto cadastrado. Cadastre objetos para definir
                permissões.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar perfil" : "Novo perfil"}</DialogTitle>
            <DialogDescription>
              Defina o nome e a descrição do perfil. As permissões são
              configuradas na matriz após salvar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="perfil-nome">Nome</Label>
              <Input
                id="perfil-nome"
                value={form.nome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nome: e.target.value }))
                }
                placeholder="Ex.: Facilitador"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perfil-desc">Descrição (opcional)</Label>
              <Textarea
                id="perfil-desc"
                value={form.descricao}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descricao: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSavePerfil}
              disabled={isSavingPerfil || !form.nome.trim()}
            >
              {isSavingPerfil ? "Salvando..." : "Salvar"}
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
            <AlertDialogTitle>Excluir perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o perfil "{toDelete?.nome}"? Os
              usuários com este perfil serão reatribuídos ao perfil padrão
              (Usuário).
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
