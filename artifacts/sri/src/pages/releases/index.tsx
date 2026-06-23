import { useState } from "react";
import {
  useListReleases,
  useListUserOptions,
  useCreateRelease,
  useUpdateRelease,
  useDeleteRelease,
  getListReleasesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TIPOS = ["MAIOR", "MENOR"];

interface FormState {
  sigla: string;
  liderNome: string;
  login: string;
  tipo: string;
  goLiveInicio: string;
  goLiveTermino: string;
  sistemas: string;
}

const EMPTY: FormState = {
  sigla: "",
  liderNome: "",
  login: "",
  tipo: "MAIOR",
  goLiveInicio: "",
  goLiveTermino: "",
  sistemas: "",
};

function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}

interface ReleaseItem {
  id: number;
  sigla: string;
  liderNome: string;
  login: string;
  tipo: string;
  goLiveInicio?: string | null;
  goLiveTermino?: string | null;
  sistemas: string[];
}

export default function ReleasesPage() {
  const [search, setSearch] = useState("");
  const { has } = usePermissions();
  const canCreate = has("releases", "criar");
  const canUpdate = has("releases", "atualizar");
  const canDelete = has("releases", "excluir");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: releases, isLoading } = useListReleases({
    search: search || undefined,
  });
  const { data: userOptions } = useListUserOptions();

  const createRelease = useCreateRelease();
  const updateRelease = useUpdateRelease();
  const deleteRelease = useDeleteRelease();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getListReleasesQueryKey() });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setIsOpen(true);
  };

  const openEdit = (item: ReleaseItem) => {
    setEditingId(item.id);
    setForm({
      sigla: item.sigla,
      liderNome: item.liderNome,
      login: item.login,
      tipo: item.tipo,
      goLiveInicio: toDateInput(item.goLiveInicio),
      goLiveTermino: toDateInput(item.goLiveTermino),
      sistemas: (item.sistemas ?? []).join(", "),
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      sigla: form.sigla,
      liderNome: form.liderNome,
      login: form.login,
      tipo: form.tipo,
      goLiveInicio: form.goLiveInicio || null,
      goLiveTermino: form.goLiveTermino || null,
      sistemas: form.sistemas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      if (editingId !== null) {
        await updateRelease.mutateAsync({ id: editingId, data: payload });
      } else {
        await createRelease.mutateAsync({ data: payload });
      }
      setIsOpen(false);
      invalidate();
      toast({ title: "Sucesso", description: "Release salva." });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao salvar a release.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta release?")) return;
    try {
      await deleteRelease.mutateAsync({ id });
      invalidate();
      toast({ title: "Sucesso", description: "Release excluída." });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao excluir.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Releases
          </h1>
          <p className="text-muted-foreground">
            Cadastro de releases SAP (S/4 e ECC) e manutenções programadas
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Release
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar releases..."
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
          ) : (releases ?? []).length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sigla</TableHead>
                    <TableHead>Líder</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Go Live</TableHead>
                    <TableHead>Sistemas</TableHead>
                    {(canUpdate || canDelete) && (
                      <TableHead className="text-right">Ações</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(releases ?? []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.sigla}
                      </TableCell>
                      <TableCell>{item.liderNome}</TableCell>
                      <TableCell>{item.login}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.tipo === "MAIOR" ? "default" : "secondary"
                          }
                        >
                          {item.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.goLiveInicio || item.goLiveTermino ? (
                          <span>
                            {toDateInput(item.goLiveInicio) || "—"} a{" "}
                            {toDateInput(item.goLiveTermino) || "—"}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(item.sistemas ?? []).map((s) => (
                            <Badge key={s} variant="outline">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      {(canUpdate || canDelete) && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {canUpdate && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(item)}
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
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Nenhuma release encontrada.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Editar Release" : "Nova Release"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Sigla</Label>
              <Input
                required
                value={form.sigla}
                onChange={(e) => setForm({ ...form, sigla: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Nome do líder</Label>
              <Input
                required
                value={form.liderNome}
                onChange={(e) =>
                  setForm({ ...form, liderNome: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Login (usuário responsável)</Label>
              <Select
                value={form.login || undefined}
                onValueChange={(v) => setForm({ ...form, login: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {(userOptions ?? []).map((u) => (
                    <SelectItem key={u.id} value={u.email}>
                      {u.name ? `${u.name} (${u.email})` : u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm({ ...form, tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Sistemas (separados por vírgula)</Label>
                <Input
                  value={form.sistemas}
                  onChange={(e) =>
                    setForm({ ...form, sistemas: e.target.value })
                  }
                  placeholder="S/4, ECC"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Go Live - início</Label>
                <Input
                  type="date"
                  value={form.goLiveInicio}
                  onChange={(e) =>
                    setForm({ ...form, goLiveInicio: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Go Live - término</Label>
                <Input
                  type="date"
                  value={form.goLiveTermino}
                  onChange={(e) =>
                    setForm({ ...form, goLiveTermino: e.target.value })
                  }
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Salvar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
