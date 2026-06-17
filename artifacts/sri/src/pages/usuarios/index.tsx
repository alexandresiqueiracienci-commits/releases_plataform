import { useState } from "react";
import {
  useListUsers,
  useUpdateUser,
  useCreateUser,
  getListUsersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Check, X, ShieldAlert, UserPlus, Copy } from "lucide-react";

export default function UsuariosPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const queryParams = filterStatus !== "all" ? { status: filterStatus } : {};
  const { data: users, isLoading } = useListUsers(queryParams);
  const updateUser = useUpdateUser();
  const createUser = useCreateUser();

  const handleUpdate = async (
    id: number,
    updates: { status?: string; profile?: string },
  ) => {
    try {
      await updateUser.mutateAsync({ id, data: updates });
      qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast({ title: "Sucesso", description: "Usuário atualizado." });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar usuário.",
        variant: "destructive",
      });
    }
  };

  const buildAuthMessage = (email: string) => {
    const appUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
    return (
      `Olá,\n\n` +
      `Você foi autorizado a acessar o SRI – Release Go Live Control.\n\n` +
      `Acesse: ${appUrl}\n` +
      `Entre com sua conta Google: ${email}\n\n` +
      `Com este acesso você poderá consultar os cenários e enviar as evidências dos testes de liberação.`
    );
  };

  const handleAddTerceiro = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    try {
      await createUser.mutateAsync({
        data: { email, name: newName.trim() || undefined },
      });
      qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
      setAuthMessage(buildAuthMessage(email));
      setNewEmail("");
      setNewName("");
      setAddOpen(false);
      toast({
        title: "Terceiro cadastrado",
        description: "Acesso liberado. Copie a mensagem de autorização.",
      });
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      toast({
        title: "Erro",
        description:
          status === 409
            ? "Este e-mail já está cadastrado."
            : "Falha ao cadastrar terceiro.",
        variant: "destructive",
      });
    }
  };

  const copyAuthMessage = async () => {
    if (!authMessage) return;
    await navigator.clipboard.writeText(authMessage);
    toast({ title: "Copiado", description: "Mensagem copiada." });
  };

  const getStatusBadge = (status: string) => {
    if (status === "PENDENTE")
      return (
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-800 hover:bg-amber-100"
        >
          Pendente
        </Badge>
      );
    if (status === "APROVADO")
      return (
        <Badge
          variant="default"
          className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
        >
          Aprovado
        </Badge>
      );
    if (status === "REJEITADO")
      return <Badge variant="destructive">Rejeitado</Badge>;
    return <Badge>{status}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Usuários
          </h1>
          <p className="text-muted-foreground">
            Aprovação de acessos, cadastro de terceiros e definição de perfis
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="w-full sm:w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="PENDENTE">Pendentes</SelectItem>
                <SelectItem value="APROVADO">Aprovados</SelectItem>
                <SelectItem value="REJEITADO">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setAddOpen(true)} className="shrink-0">
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar terceiro
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow
                    key={u.id}
                    className={u.status === "PENDENTE" ? "bg-amber-50/50" : ""}
                  >
                    <TableCell className="font-medium">
                      {u.name || "N/A"}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      {u.terceiro ? (
                        <Badge
                          variant="secondary"
                          className="bg-sky-100 text-sky-800 hover:bg-sky-100"
                        >
                          Terceiro
                        </Badge>
                      ) : (
                        <Badge variant="outline">Interno</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(u.status)}</TableCell>
                    <TableCell>
                      <Select
                        value={u.profile}
                        onValueChange={(val) =>
                          handleUpdate(u.id, { profile: val })
                        }
                      >
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USUARIO">
                            USUÁRIO (Consulta)
                          </SelectItem>
                          <SelectItem value="ADMINISTRADOR">
                            ADMINISTRADOR
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      {u.status === "PENDENTE" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                            onClick={() =>
                              handleUpdate(u.id, { status: "APROVADO" })
                            }
                          >
                            <Check className="mr-1 h-3 w-3" /> Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                            onClick={() =>
                              handleUpdate(u.id, { status: "REJEITADO" })
                            }
                          >
                            <X className="mr-1 h-3 w-3" /> Rejeitar
                          </Button>
                        </div>
                      ) : u.terceiro && u.status === "APROVADO" ? (
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setAuthMessage(buildAuthMessage(u.email))}
                          >
                            <Copy className="mr-1 h-3 w-3" /> Autorização
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" disabled>
                            Nenhuma ação
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 flex flex-col items-center justify-center text-muted-foreground">
              <ShieldAlert className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p>Nenhum usuário encontrado com os filtros selecionados.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar terceiro</DialogTitle>
            <DialogDescription>
              Informe o e-mail (conta Google) do terceiro. O acesso é liberado
              imediatamente e o terceiro poderá consultar os cenários e enviar
              evidências.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="terceiro-email">E-mail (conta Google)</Label>
              <Input
                id="terceiro-email"
                type="email"
                placeholder="nome@empresa.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terceiro-nome">Nome (opcional)</Label>
              <Input
                id="terceiro-nome"
                placeholder="Nome do terceiro"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddTerceiro}
              disabled={!newEmail.trim() || createUser.isPending}
            >
              {createUser.isPending ? "Cadastrando..." : "Cadastrar e liberar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!authMessage}
        onOpenChange={(open) => !open && setAuthMessage(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mensagem de autorização</DialogTitle>
            <DialogDescription>
              Copie e envie esta mensagem ao terceiro (por e-mail, WhatsApp,
              etc.) com o link de acesso.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            readOnly
            value={authMessage ?? ""}
            className="min-h-[180px] text-sm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAuthMessage(null)}>
              Fechar
            </Button>
            <Button onClick={copyAuthMessage}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar mensagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
