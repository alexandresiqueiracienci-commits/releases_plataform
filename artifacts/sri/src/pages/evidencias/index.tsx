import { useEffect, useRef, useState } from "react";
import {
  useListScenarios,
  useGetMe,
  useListEvidencias,
  useCreateEvidencia,
  useDeleteEvidencia,
  useConcluirEvidencias,
  useListLookups,
  useUpdateScenarioStatus,
  getListEvidenciasQueryKey,
  getListScenariosQueryKey,
  type Scenario,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  ClipboardCheck,
  Upload,
  Download,
  Trash2,
  FileText,
  Lock,
  CheckCircle2,
  Send,
} from "lucide-react";
import { STATUS_EVIDENCIAS_ENVIADAS } from "@/lib/constants";

type ScenarioRow = Scenario;

const FIELD_GROUPS: { title: string; fields: [keyof ScenarioRow, string][] }[] =
  [
    {
      title: "Identificação",
      fields: [
        ["idTeste", "ID Teste"],
        ["chaveamento", "Chaveamento"],
        ["sequencia", "Sequência"],
        ["sistema", "Sistema"],
        ["site", "Site"],
        ["statusCenario", "Status do Cenário"],
      ],
    },
    {
      title: "Detalhes da Execução",
      fields: [
        ["blocoExecucao", "Bloco Execução"],
        ["fisicoSistemico", "Físico ou Sistêmico"],
        ["prioridade", "Prioridade"],
        ["quemExecuta", "Quem Executa"],
        ["baselineCustomizado", "BASELINE/CUSTOMIZADO"],
        ["macroProcesso", "Macro Processo"],
        ["tipoCenario", "Tipo Cenário"],
        ["celula", "Célula"],
        ["agrupamento", "Agrupamento"],
      ],
    },
    {
      title: "Responsáveis",
      fields: [
        ["facilitador", "Facilitador"],
        ["keyUser", "KEY USER"],
        ["superUser", "SUPER USER"],
        ["endUser", "END USER"],
      ],
    },
    {
      title: "Integrações e Defeitos",
      fields: [
        ["dependenciaCenarioExterno", "Dependência Cenário Externo"],
        ["idDefeitoJira", "ID Defeito (JIRA)"],
        ["idCenarioJira", "ID Cenário (JIRA)"],
        ["statusCheckPoint", "Status Check Point"],
        ["liberacao", "Liberação"],
        ["diretorio", "DIRETÓRIO"],
      ],
    },
    {
      title: "Descritivos",
      fields: [
        ["cenario", "Título do Cenário"],
        ["quemDefineMassa", "Quem define a massa"],
        ["massaDados", "Massa de Dados"],
        ["sequenciaPassoAPasso", "Sequência passo-a-passo"],
        ["evidenciasObrigatorias", "Evidências Obrigatórias"],
        ["observacoes", "Observações"],
      ],
    },
  ];

function evidenceDownloadUrl(objectPath: string): string {
  return `/api/storage/objects/${objectPath.replace(/^\/objects\//, "")}`;
}

function formatBytes(bytes?: number | null): string {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function EvidenciasSection({
  scenarioId,
  canUpload,
  currentEmail,
  isAdmin,
  alreadyDelivered,
  onConcluido,
}: {
  scenarioId: number;
  canUpload: boolean;
  currentEmail?: string;
  isAdmin: boolean;
  alreadyDelivered: boolean;
  onConcluido: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: evidencias, isLoading } = useListEvidencias(scenarioId);
  const createEvidencia = useCreateEvidencia();
  const deleteEvidencia = useDeleteEvidencia();
  const concluirEvidencias = useConcluirEvidencias();

  const handleConcluir = async () => {
    try {
      await concluirEvidencias.mutateAsync({ id: scenarioId });
      qc.invalidateQueries({ queryKey: getListScenariosQueryKey() });
      onConcluido();
      toast({
        title: "Sucesso",
        description: "Status atualizado para Evidências Enviadas.",
      });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao concluir os uploads das evidências.",
        variant: "destructive",
      });
    }
  };

  const refresh = () =>
    qc.invalidateQueries({
      queryKey: getListEvidenciasQueryKey(scenarioId),
    });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const metaRes = await fetch("/api/storage/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            contentType: file.type || "application/octet-stream",
          }),
        });
        if (!metaRes.ok) {
          const err = await metaRes.json().catch(() => ({}));
          throw new Error(err.error || "Falha ao preparar upload");
        }
        const { uploadURL, objectPath } = await metaRes.json();

        const putRes = await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        });
        if (!putRes.ok) throw new Error("Falha ao enviar arquivo");

        await createEvidencia.mutateAsync({
          id: scenarioId,
          data: {
            objectPath,
            fileName: file.name,
            contentType: file.type || undefined,
            size: file.size,
          },
        });
      }
      refresh();
      toast({ title: "Sucesso", description: "Evidência(s) enviada(s)." });
    } catch (err) {
      toast({
        title: "Erro",
        description:
          err instanceof Error ? err.message : "Falha no envio da evidência.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta evidência?")) return;
    try {
      await deleteEvidencia.mutateAsync({ id });
      refresh();
      toast({ title: "Sucesso", description: "Evidência excluída." });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao excluir evidência.",
        variant: "destructive",
      });
    }
  };

  const canDelete = (uploadedByEmail?: string | null) =>
    isAdmin ||
    (!!currentEmail &&
      !!uploadedByEmail &&
      currentEmail.toLowerCase() === uploadedByEmail.toLowerCase());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Evidências enviadas
        </h3>
        {canUpload ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Enviando..." : "Enviar evidência"}
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Envio restrito a @natura.net e terceiros autorizados
          </span>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : evidencias && evidencias.length > 0 ? (
        <div className="rounded-md border divide-y">
          {evidencias.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between gap-3 p-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{ev.fileName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {ev.uploadedByEmail || "—"}
                  {ev.size ? ` · ${formatBytes(ev.size)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={evidenceDownloadUrl(ev.objectPath)}
                    target="_blank"
                    rel="noreferrer"
                    download={ev.fileName}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                {canDelete(ev.uploadedByEmail) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(ev.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
          Nenhuma evidência enviada para este cenário.
        </p>
      )}

      {canUpload && evidencias && evidencias.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
          {alreadyDelivered ? (
            <span className="text-xs text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Evidências marcadas como enviadas.
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Após anexar todas as evidências, conclua para marcar o cenário como
              "Evidências Enviadas".
            </span>
          )}
          <Button
            size="sm"
            variant={alreadyDelivered ? "outline" : "default"}
            onClick={handleConcluir}
            disabled={concluirEvidencias.isPending}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {concluirEvidencias.isPending
              ? "Concluindo..."
              : "Concluídos Todos Uploads das Evidências"}
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusControl({ scenario }: { scenario: ScenarioRow }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: statusOptions } = useListLookups({ category: "status_cenario" });
  const updateStatus = useUpdateScenarioStatus();

  const handleChange = async (value: string) => {
    try {
      await updateStatus.mutateAsync({
        id: scenario.id,
        data: { statusCenario: value },
      });
      qc.invalidateQueries({ queryKey: getListScenariosQueryKey() });
      toast({ title: "Sucesso", description: "Status do cenário atualizado." });
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao atualizar o status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-md border bg-muted/30 p-4 space-y-2">
      <Label htmlFor="status-cenario">Alterar status do cenário</Label>
      <Select
        value={scenario.statusCenario ?? undefined}
        onValueChange={handleChange}
      >
        <SelectTrigger id="status-cenario" className="w-full sm:w-[280px]">
          <SelectValue placeholder="Selecione um status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions?.map((opt) => (
            <SelectItem key={opt.id} value={opt.value}>
              {opt.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function EvidenciasPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ScenarioRow | null>(null);
  const [scrollToUpload, setScrollToUpload] = useState(false);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const openScenario = (cenario: ScenarioRow, focusUpload: boolean) => {
    setScrollToUpload(focusUpload);
    setSelected(cenario);
  };

  useEffect(() => {
    if (selected && scrollToUpload) {
      const t = setTimeout(() => {
        uploadSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        setScrollToUpload(false);
      }, 150);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [selected, scrollToUpload]);

  const { data: user } = useGetMe();
  const { has } = usePermissions();
  const canChangeStatus = has("cenarios", "alterar_status");
  const { data: cenarios, isLoading } = useListScenarios({
    search: search || undefined,
  });

  const email = user?.email ?? "";
  const isAdmin = user?.profile === "ADMINISTRADOR";
  // Espelha a regra do backend (requireUploader): regra legada
  // (@natura.net / terceiro / admin) OU permissão RBAC explícita.
  const canUpload =
    user?.status === "APROVADO" &&
    (email.toLowerCase().endsWith("@natura.net") ||
      user?.terceiro === true ||
      isAdmin ||
      has("evidencias", "enviar_evidencia"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Evidências Testes de Liberação
        </h1>
        <p className="text-muted-foreground">
          Consulta dos cenários cadastrados para a release e envio das
          evidências de execução dos testes
        </p>
      </div>

      {!canUpload && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <Lock className="h-4 w-4 shrink-0" />
          O envio de evidências é permitido apenas para contas @natura.net ou
          terceiros autorizados. Você pode consultar todos os cenários e baixar
          as evidências.
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cenários..."
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
              <Skeleton className="h-10 w-full" />
            </div>
          ) : cenarios && cenarios.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Teste</TableHead>
                    <TableHead>Cenário</TableHead>
                    <TableHead>Sistema</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Evidências</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cenarios.map((cenario) => (
                    <TableRow
                      key={cenario.id}
                      className="cursor-pointer"
                      onClick={() => openScenario(cenario, false)}
                    >
                      <TableCell className="font-medium">
                        {cenario.idTeste}
                      </TableCell>
                      <TableCell
                        className="max-w-[300px] truncate"
                        title={cenario.cenario || ""}
                      >
                        {cenario.cenario}
                      </TableCell>
                      <TableCell>{cenario.sistema}</TableCell>
                      <TableCell>{cenario.site}</TableCell>
                      <TableCell>{cenario.statusCenario}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openScenario(cenario, false);
                            }}
                          >
                            <ClipboardCheck className="mr-2 h-4 w-4" />
                            Abrir
                          </Button>
                          {canUpload && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openScenario(cenario, true);
                              }}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Enviar Evidência
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
              Nenhum cenário encontrado.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>{selected.idTeste}</span>
                  {selected.prioridade && (
                    <Badge variant="secondary">{selected.prioridade}</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>{selected.cenario}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {FIELD_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <h3 className="text-sm font-semibold border-b pb-1 text-primary">
                      {group.title}
                    </h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                      {group.fields.map(([key, label]) => {
                        const value = selected[key];
                        return (
                          <div key={String(key)} className="min-w-0">
                            <dt className="text-xs font-medium text-muted-foreground">
                              {label}
                            </dt>
                            <dd className="text-sm break-words whitespace-pre-wrap">
                              {value === null ||
                              value === undefined ||
                              value === ""
                                ? "—"
                                : String(value)}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                ))}

                {canChangeStatus && (
                  <div className="border-t pt-4">
                    <StatusControl scenario={selected} />
                  </div>
                )}

                <div className="border-t pt-4" ref={uploadSectionRef}>
                  <EvidenciasSection
                    scenarioId={selected.id}
                    canUpload={!!canUpload}
                    currentEmail={email}
                    isAdmin={isAdmin}
                    alreadyDelivered={
                      (selected.statusCenario ?? "").trim().toLowerCase() ===
                      STATUS_EVIDENCIAS_ENVIADAS.toLowerCase()
                    }
                    onConcluido={() =>
                      setSelected((prev) =>
                        prev
                          ? {
                              ...prev,
                              statusCenario: STATUS_EVIDENCIAS_ENVIADAS,
                            }
                          : prev,
                      )
                    }
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
