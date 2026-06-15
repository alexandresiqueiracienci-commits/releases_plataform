import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  useGetScenario, 
  useCreateScenario, 
  useUpdateScenario, 
  useListLookups,
  getGetScenarioQueryKey,
  getListScenariosQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const scenarioSchema = z.object({
  idTeste: z.string().min(1, "ID Teste é obrigatório"),
  chaveamento: z.string().optional(),
  sequencia: z.string().optional(),
  blocoExecucao: z.string().optional(),
  fisicoSistemico: z.string().optional(),
  prioridade: z.string().optional(),
  cenario: z.string().optional(),
  dependenciaCenarioExterno: z.string().optional(),
  quemExecuta: z.string().optional(),
  baselineCustomizado: z.string().optional(),
  facilitador: z.string().optional(),
  keyUser: z.string().optional(),
  superUser: z.string().optional(),
  endUser: z.string().optional(),
  macroProcesso: z.string().optional(),
  sequenciaPassoAPasso: z.string().optional(),
  evidenciasObrigatorias: z.string().optional(),
  quemDefineMassa: z.string().optional(),
  massaDados: z.string().optional(),
  celula: z.string().optional(),
  agrupamento: z.string().optional(),
  tipoCenario: z.string().optional(),
  liberacao: z.string().optional(),
  observacoes: z.string().optional(),
  sistema: z.string().optional(),
  site: z.string().optional(),
  statusCenario: z.string().optional(),
  idDefeitoJira: z.string().optional(),
  idCenarioJira: z.string().optional(),
  statusCheckPoint: z.string().optional(),
  diretorio: z.string().optional(),
});

type ScenarioFormValues = z.infer<typeof scenarioSchema>;

export default function CenariosFormPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id, 10) : null;
  const isEditing = !!id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: scenario, isLoading: isLoadingScenario } = useGetScenario(id!, {
    query: { enabled: !!id, queryKey: getGetScenarioQueryKey(id!) }
  });

  const createScenario = useCreateScenario();
  const updateScenario = useUpdateScenario();

  const form = useForm<ScenarioFormValues>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
      idTeste: "",
      chaveamento: "",
      sequencia: "",
      blocoExecucao: "",
      fisicoSistemico: "",
      prioridade: "",
      cenario: "",
      dependenciaCenarioExterno: "",
      quemExecuta: "",
      baselineCustomizado: "",
      facilitador: "",
      keyUser: "",
      superUser: "",
      endUser: "",
      macroProcesso: "",
      sequenciaPassoAPasso: "",
      evidenciasObrigatorias: "",
      quemDefineMassa: "",
      massaDados: "",
      celula: "",
      agrupamento: "",
      tipoCenario: "",
      liberacao: "",
      observacoes: "",
      sistema: "",
      site: "",
      statusCenario: "",
      idDefeitoJira: "",
      idCenarioJira: "",
      statusCheckPoint: "",
      diretorio: "",
    }
  });

  useEffect(() => {
    if (scenario && isEditing) {
      // Replace nulls with empty strings for form compatibility
      const resetData = Object.entries(scenario).reduce((acc, [key, value]) => {
        acc[key as keyof ScenarioFormValues] = value === null ? "" : value;
        return acc;
      }, {} as any);
      form.reset(resetData);
    }
  }, [scenario, isEditing, form]);

  const onSubmit = async (data: ScenarioFormValues) => {
    try {
      if (isEditing) {
        await updateScenario.mutateAsync({ id: id!, data });
        toast({ title: "Sucesso", description: "Cenário atualizado com sucesso." });
      } else {
        await createScenario.mutateAsync({ data });
        toast({ title: "Sucesso", description: "Cenário criado com sucesso." });
      }
      qc.invalidateQueries({ queryKey: getListScenariosQueryKey() });
      setLocation("/cenarios");
    } catch (err) {
      toast({ title: "Erro", description: "Ocorreu um erro ao salvar o cenário.", variant: "destructive" });
    }
  };

  const { data: lookups } = useListLookups();
  const getOptions = (category: string) => 
    lookups?.filter(l => l.category === category).map(l => ({ label: l.value, value: l.value })) || [];

  if (isEditing && isLoadingScenario) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  const renderSelect = (name: keyof ScenarioFormValues, label: string, category: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value || undefined} value={field.value || undefined}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Selecione ${label}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {getOptions(category).map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderInput = (name: keyof ScenarioFormValues, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} value={field.value || ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderTextarea = (name: keyof ScenarioFormValues, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="col-span-full">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea {...field} value={field.value || ""} className="min-h-[100px]" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {isEditing ? "Editar Cenário" : "Novo Cenário"}
        </h1>
        <p className="text-muted-foreground">Preencha as informações do cenário de teste</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Identificação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderInput("idTeste", "ID Teste")}
                  {renderInput("chaveamento", "Chaveamento")}
                  {renderInput("sequencia", "Sequência")}
                  {renderSelect("sistema", "Sistema", "sistema")}
                  {renderSelect("site", "Site", "site")}
                  {renderSelect("statusCenario", "Status do Cenário", "status_cenario")}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Detalhes da Execução</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderSelect("blocoExecucao", "Bloco Execução", "bloco_execucao")}
                  {renderInput("fisicoSistemico", "Físico ou Sistêmico")}
                  {renderSelect("prioridade", "Prioridade", "prioridade")}
                  {renderSelect("quemExecuta", "Quem Executa", "quem_executa")}
                  {renderSelect("baselineCustomizado", "BASELINE/CUSTOMIZADO", "entregas")}
                  {renderSelect("macroProcesso", "Macro Processo", "macro_processo")}
                  {renderInput("tipoCenario", "Tipo Cenário")}
                  {renderInput("celula", "Célula")}
                  {renderInput("agrupamento", "Agrupamento")}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Responsáveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {renderSelect("facilitador", "Facilitador", "facilitador")}
                  {renderInput("keyUser", "KEY USER")}
                  {renderInput("superUser", "SUPER USER")}
                  {renderInput("endUser", "END USER")}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Integrações e Defeitos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderInput("dependenciaCenarioExterno", "Dependência Cenário Externo")}
                  {renderInput("idDefeitoJira", "ID Defeito (JIRA)")}
                  {renderInput("idCenarioJira", "ID Cenário (JIRA)")}
                  {renderInput("statusCheckPoint", "Status Check Point")}
                  {renderInput("liberacao", "Liberação")}
                  {renderInput("diretorio", "DIRETÓRIO")}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Descritivos</h3>
                <div className="grid grid-cols-1 gap-4">
                  {renderInput("cenario", "Título do Cenário")}
                  {renderInput("quemDefineMassa", "Quem define a massa")}
                  {renderTextarea("massaDados", "Massa de Dados")}
                  {renderTextarea("sequenciaPassoAPasso", "Sequência passo-a-passo")}
                  {renderTextarea("evidenciasObrigatorias", "Evidências Obrigatórias")}
                  {renderTextarea("observacoes", "Observações")}
                </div>
              </div>

              <div className="flex justify-end gap-4 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setLocation("/cenarios")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Salvando..." : "Salvar Cenário"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
