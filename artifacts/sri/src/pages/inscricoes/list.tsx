import { useState } from "react";
import { useLocation } from "wouter";
import {
  useListDemandas,
  useListReleases,
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
import { Search, Plus, Trash2, Edit, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ALL = "all";

export default function InscricoesListPage() {
  const [search, setSearch] = useState("");
  const [releaseFilter, setReleaseFilter] = useState<string>(ALL);
  const [, setLocation] = useLocation();
  const { has } = usePermissions();
  const canCreate = has("demandas", "criar");
  const canUpdate = has("demandas", "atualizar");
  const canDelete = has("demandas", "excluir");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: releases } = useListReleases();
  const { data: demandas, isLoading } = useListDemandas({
    search: search || undefined,
    releaseId: releaseFilter !== ALL ? Number(releaseFilter) : undefined,
  });

  const deleteDemanda = useDeleteDemanda();

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta inscrição?")) return;
    try {
      await deleteDemanda.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListDemandasQueryKey() });
      toast({ title: "Sucesso", description: "Inscrição excluída." });
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
            Inscrição nas Releases
          </h1>
          <p className="text-muted-foreground">
            Demandas inscritas nas releases com o intake completo
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setLocation("/inscricoes/novo")}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Inscrição
          </Button>
        )}
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
                    <TableHead>Áreas</TableHead>
                    {(canUpdate || canDelete) && (
                      <TableHead className="text-right">Ações</TableHead>
                    )}
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
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(item.areas ?? []).map((a) => (
                            <Badge key={a.id} variant="secondary">
                              {a.nome}
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
                                onClick={() =>
                                  setLocation(`/inscricoes/${item.id}/editar`)
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
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Nenhuma inscrição encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
