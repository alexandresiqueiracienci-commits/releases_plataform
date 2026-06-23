import { useState } from "react";
import { useLocation } from "wouter";
import {
  useListDemandas,
  useListReleases,
  useUpdateDemanda,
  useDeleteDemanda,
  getListDemandasQueryKey,
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
import { Search, Trash2, Edit, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ALL = "all";
const TAMANHOS = ["PP", "P", "M", "G", "GG"];
const NONE = "none";

interface QuickEdit {
  id: number;
  nome: string;
  liderDemanda: string;
  codigoServiceNow: string;
  tamanho: string;
}

export default function DemandasPage() {
  const [search, setSearch] = useState("");
  const [releaseFilter, setReleaseFilter] = useState<string>(ALL);
  const [, setLocation] = useLocation();
  const { has } = usePermissions();
  const canUpdate = has("demandas", "atualizar");
  const canDelete = has("demandas", "excluir");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: releases } = useListReleases();
  const { data: demandas, isLoading } = useListDemandas({
    search: search || undefined,
    releaseId: releaseFilter !== ALL ? Number(releaseFilter) : undefined,
  });

  const updateDemanda = useUpdateDemanda();
  const deleteDemanda = useDeleteDemanda();

  const [editing, setEditing] = useState<QuickEdit | null>(null);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getListDemandasQueryKey() });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await updateDemanda.mutateAsync({
        id: editing.id,
        data: {
          nome: editing.nome,
          liderDemanda: editing.liderDemanda || undefined,
          codigoServiceNow: editing.codigoServiceNow || undefined,
          tamanho: editing.tamanho || undefined,
        },
      });
      setEditing(null);
      invalidate();
      toast({ title: "Sucesso", description: "Demanda atualizada." });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao atualizar.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta demanda?")) return;
    try {
      await deleteDemanda.mutateAsync({ id });
      invalidate();
      toast({ title: "Sucesso", description: "Demanda excluída." });
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Demandas
        </h1>
        <p className="text-muted-foreground">
          Gestão das demandas inscritas nas releases
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar demandas..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Release</Label>
              <Select value={releaseFilter} onValueChange={setReleaseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {(releases ?? []).map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.sigla}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {releaseFilter !== ALL && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReleaseFilter(ALL)}
              >
                <X className="mr-2 h-4 w-4" />
                Limpar filtros
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (demandas ?? []).length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Demanda</TableHead>
                    <TableHead>Release</TableHead>
                    <TableHead>ServiceNow</TableHead>
                    <TableHead>Líder</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(demandas ?? []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>
                        {item.releaseSigla && (
                          <Badge variant="outline">{item.releaseSigla}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{item.codigoServiceNow}</TableCell>
                      <TableCell>{item.liderDemanda}</TableCell>
                      <TableCell>{item.tamanho}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Abrir intake completo"
                              onClick={() =>
                                setLocation(`/inscricoes/${item.id}/editar`)
                              }
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edição rápida"
                              onClick={() =>
                                setEditing({
                                  id: item.id,
                                  nome: item.nome,
                                  liderDemanda: item.liderDemanda ?? "",
                                  codigoServiceNow:
                                    item.codigoServiceNow ?? "",
                                  tamanho: item.tamanho ?? "",
                                })
                              }
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Nenhuma demanda encontrada.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edição rápida</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input
                  required
                  value={editing.nome}
                  onChange={(e) =>
                    setEditing({ ...editing, nome: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Líder da demanda</Label>
                <Input
                  value={editing.liderDemanda}
                  onChange={(e) =>
                    setEditing({ ...editing, liderDemanda: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Código ServiceNow</Label>
                <Input
                  value={editing.codigoServiceNow}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      codigoServiceNow: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Tamanho</Label>
                <Select
                  value={editing.tamanho || NONE}
                  onValueChange={(v) =>
                    setEditing({ ...editing, tamanho: v === NONE ? "" : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>—</SelectItem>
                    {TAMANHOS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
