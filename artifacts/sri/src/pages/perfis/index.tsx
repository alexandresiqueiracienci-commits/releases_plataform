import {
  useListUsers,
  useUpdateUser,
  getListUsersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { Eye, ShieldCheck } from "lucide-react";

const PROFILES = [
  {
    id: "USUARIO",
    name: "Padrão (Consulta)",
    icon: Eye,
    description:
      "Acesso de consulta a todas as áreas: dashboards, cenários, evidências, escala e contatos. Pode baixar evidências. O envio de evidências depende de ser conta @natura.net ou terceiro autorizado.",
    permissions: [
      "Consultar dashboards e cenários",
      "Consultar evidências e baixar arquivos",
      "Consultar escala e contatos",
      "Sem acesso a cadastros e administração",
    ],
  },
  {
    id: "ADMINISTRADOR",
    name: "Administrador",
    icon: ShieldCheck,
    description:
      "Acesso total ao sistema, incluindo todas as funções de consulta e todas as funções administrativas.",
    permissions: [
      "Todos os acessos do perfil Padrão",
      "Criar, editar e excluir cenários",
      "Gerenciar cadastros (listas de domínio)",
      "Aprovar usuários e cadastrar terceiros",
      "Definir perfis de acesso",
    ],
  },
];

export default function PerfisPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: users, isLoading } = useListUsers({});
  const updateUser = useUpdateUser();

  const handleProfileChange = async (id: number, profile: string) => {
    try {
      await updateUser.mutateAsync({ id, data: { profile } });
      qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast({ title: "Sucesso", description: "Perfil atualizado." });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao atualizar perfil.",
        variant: "destructive",
      });
    }
  };

  const countByProfile = (profile: string) =>
    users?.filter((u) => u.profile === profile).length ?? 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Perfis
        </h1>
        <p className="text-muted-foreground">
          Perfis de acesso e definição de permissões dos usuários
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROFILES.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <p.icon className="h-5 w-5 text-primary" />
                  {p.name}
                </span>
                <Badge variant="secondary">
                  {countByProfile(p.id)} usuário(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <ul className="space-y-1 text-sm">
                {p.permissions.map((perm) => (
                  <li key={perm} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perfis por usuário</CardTitle>
        </CardHeader>
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
                  <TableHead className="text-right">Perfil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
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
                    <TableCell className="text-right">
                      <Select
                        value={u.profile}
                        onValueChange={(val) => handleProfileChange(u.id, val)}
                      >
                        <SelectTrigger className="w-[180px] h-8 text-xs ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USUARIO">
                            Padrão (Consulta)
                          </SelectItem>
                          <SelectItem value="ADMINISTRADOR">
                            Administrador
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum usuário encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
