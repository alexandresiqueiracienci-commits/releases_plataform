import { useMemo, useState } from "react";
import { useListContatos, useCreateContato, useDeleteContato, getListContatosQueryKey } from "@workspace/api-client-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ALL = "all";

export default function ContatosPage() {
  const [search, setSearch] = useState("");
  const [empresa, setEmpresa] = useState<string>(ALL);
  const [papel, setPapel] = useState<string>(ALL);
  const { has } = usePermissions();
  const canCreate = has("contatos", "criar");
  const canDelete = has("contatos", "excluir");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: contatos, isLoading } = useListContatos({ search: search || undefined });

  const empresaOptions = useMemo(
    () =>
      Array.from(
        new Set((contatos ?? []).map((c) => c.empresa).filter((v): v is string => !!v)),
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [contatos],
  );

  const papelOptions = useMemo(
    () =>
      Array.from(
        new Set((contatos ?? []).map((c) => c.papel).filter((v): v is string => !!v)),
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [contatos],
  );

  const contatosFiltrados = useMemo(
    () =>
      (contatos ?? []).filter(
        (c) =>
          (empresa === ALL || c.empresa === empresa) &&
          (papel === ALL || c.papel === papel),
      ),
    [contatos, empresa, papel],
  );

  const hasFiltrosAtivos = empresa !== ALL || papel !== ALL;
  const createContato = useCreateContato();
  const deleteContato = useDeleteContato();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: "", empresa: "", contato1: "", contato2: "", localidade: "", papel: "", email: "", escalonamento: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContato.mutateAsync({ data: formData });
      setIsOpen(false);
      setFormData({ nome: "", empresa: "", contato1: "", contato2: "", localidade: "", papel: "", email: "", escalonamento: "" });
      qc.invalidateQueries({ queryKey: getListContatosQueryKey() });
      toast({ title: "Sucesso", description: "Contato adicionado." });
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao adicionar.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este contato?")) return;
    try {
      await deleteContato.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListContatosQueryKey() });
      toast({ title: "Sucesso", description: "Contato excluído." });
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao excluir.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Contatos</h1>
          <p className="text-muted-foreground">Diretório de contatos úteis e escalonamento</p>
        </div>
        {canCreate && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Contato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Contato</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input placeholder="Nome" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                <Input placeholder="Empresa" required value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Contato 1" value={formData.contato1} onChange={e => setFormData({...formData, contato1: e.target.value})} />
                  <Input placeholder="Contato 2" value={formData.contato2} onChange={e => setFormData({...formData, contato2: e.target.value})} />
                </div>
                <Input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <Input placeholder="Localidade" value={formData.localidade} onChange={e => setFormData({...formData, localidade: e.target.value})} />
                <Input placeholder="Papel" value={formData.papel} onChange={e => setFormData({...formData, papel: e.target.value})} />
                <Input placeholder="Escalonamento" value={formData.escalonamento} onChange={e => setFormData({...formData, escalonamento: e.target.value})} />
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3 space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contatos..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Empresa</Label>
              <Select value={empresa} onValueChange={setEmpresa}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {empresaOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Papel</Label>
              <Select value={papel} onValueChange={setPapel}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {papelOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {hasFiltrosAtivos && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEmpresa(ALL);
                  setPapel(ALL);
                }}
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
          ) : contatosFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Telefones</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Escalonamento</TableHead>
                    {canDelete && <TableHead className="text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contatosFiltrados.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>{item.empresa}</TableCell>
                      <TableCell>{item.papel}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>{item.contato1}</span>
                          {item.contato2 && <span className="text-muted-foreground">{item.contato2}</span>}
                        </div>
                      </TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{item.escalonamento}</TableCell>
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
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">Nenhum contato encontrado.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
