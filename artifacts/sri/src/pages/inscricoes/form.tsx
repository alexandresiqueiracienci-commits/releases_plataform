import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  useListReleases,
  useListAreas,
  useGetDemanda,
  useCreateDemanda,
  useUpdateDemanda,
  getListDemandasQueryKey,
  getGetDemandaQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TAMANHOS = ["PP", "P", "M", "G", "GG"];

interface FormState {
  releaseId: string;
  nome: string;
  codigoServiceNow: string;
  wps: string;
  liderDemanda: string;
  pep: string;
  projetoSspId: string;
  origem: string;
  resumoExecutivo: string;
  liderGerenteProjetos: string;
  liderancaArea: string;
  tamanho: string;
  urlKickoff: string;
  urlBusinessCase: string;
  urlCronograma: string;
  processosNegocio: string;
  sistemasDePara: string;
  dataAprovacaoL2: string;
  cienteModeloCustos: boolean;
  pepOpexDetalhes: string;
}

const EMPTY: FormState = {
  releaseId: "",
  nome: "",
  codigoServiceNow: "",
  wps: "",
  liderDemanda: "",
  pep: "",
  projetoSspId: "",
  origem: "",
  resumoExecutivo: "",
  liderGerenteProjetos: "",
  liderancaArea: "",
  tamanho: "",
  urlKickoff: "",
  urlBusinessCase: "",
  urlCronograma: "",
  processosNegocio: "",
  sistemasDePara: "",
  dataAprovacaoL2: "",
  cienteModeloCustos: false,
  pepOpexDetalhes: "",
};

function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}

export default function InscricaoFormPage() {
  const params = useParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : null;
  const isEdit = id !== null;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: releases } = useListReleases();
  const { data: areas } = useListAreas();
  const { data: demanda, isLoading: isLoadingDemanda } = useGetDemanda(
    id ?? 0,
    {
      query: {
        enabled: isEdit,
        queryKey: getGetDemandaQueryKey(id ?? 0),
      },
    },
  );

  const createDemanda = useCreateDemanda();
  const updateDemanda = useUpdateDemanda();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [areaIds, setAreaIds] = useState<number[]>([]);

  useEffect(() => {
    if (isEdit && demanda) {
      setForm({
        releaseId: String(demanda.releaseId),
        nome: demanda.nome,
        codigoServiceNow: demanda.codigoServiceNow ?? "",
        wps: demanda.wps != null ? String(demanda.wps) : "",
        liderDemanda: demanda.liderDemanda ?? "",
        pep: demanda.pep ?? "",
        projetoSspId: demanda.projetoSspId ?? "",
        origem: demanda.origem ?? "",
        resumoExecutivo: demanda.resumoExecutivo ?? "",
        liderGerenteProjetos: demanda.liderGerenteProjetos ?? "",
        liderancaArea: demanda.liderancaArea ?? "",
        tamanho: demanda.tamanho ?? "",
        urlKickoff: demanda.urlKickoff ?? "",
        urlBusinessCase: demanda.urlBusinessCase ?? "",
        urlCronograma: demanda.urlCronograma ?? "",
        processosNegocio: demanda.processosNegocio ?? "",
        sistemasDePara: demanda.sistemasDePara ?? "",
        dataAprovacaoL2: toDateInput(demanda.dataAprovacaoL2),
        cienteModeloCustos: demanda.cienteModeloCustos ?? false,
        pepOpexDetalhes: demanda.pepOpexDetalhes ?? "",
      });
      setAreaIds(demanda.areaIds ?? []);
    }
  }, [isEdit, demanda]);

  const sortedAreas = useMemo(
    () =>
      [...(areas ?? [])].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR"),
      ),
    [areas],
  );

  const toggleArea = (areaId: number) => {
    setAreaIds((prev) =>
      prev.includes(areaId)
        ? prev.filter((x) => x !== areaId)
        : [...prev, areaId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.releaseId) {
      toast({
        title: "Atenção",
        description: "Selecione a release.",
        variant: "destructive",
      });
      return;
    }
    const wpsNum = form.wps.trim() === "" ? undefined : Number(form.wps);
    if (wpsNum !== undefined && Number.isNaN(wpsNum)) {
      toast({
        title: "Atenção",
        description: "WPS deve ser um número.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      releaseId: Number(form.releaseId),
      nome: form.nome,
      codigoServiceNow: form.codigoServiceNow || undefined,
      wps: wpsNum,
      liderDemanda: form.liderDemanda || undefined,
      pep: form.pep || undefined,
      projetoSspId: form.projetoSspId || undefined,
      origem: form.origem || undefined,
      resumoExecutivo: form.resumoExecutivo || undefined,
      liderGerenteProjetos: form.liderGerenteProjetos || undefined,
      liderancaArea: form.liderancaArea || undefined,
      tamanho: form.tamanho || undefined,
      urlKickoff: form.urlKickoff || undefined,
      urlBusinessCase: form.urlBusinessCase || undefined,
      urlCronograma: form.urlCronograma || undefined,
      processosNegocio: form.processosNegocio || undefined,
      sistemasDePara: form.sistemasDePara || undefined,
      dataAprovacaoL2: form.dataAprovacaoL2 || null,
      cienteModeloCustos: form.cienteModeloCustos,
      pepOpexDetalhes: form.pepOpexDetalhes || undefined,
      areaIds,
    };

    try {
      if (isEdit && id !== null) {
        await updateDemanda.mutateAsync({ id, data: payload });
      } else {
        await createDemanda.mutateAsync({ data: payload });
      }
      qc.invalidateQueries({ queryKey: getListDemandasQueryKey() });
      toast({ title: "Sucesso", description: "Inscrição salva." });
      setLocation("/inscricoes");
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao salvar a inscrição.",
        variant: "destructive",
      });
    }
  };

  if (isEdit && isLoadingDemanda) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const set = (patch: Partial<FormState>) => setForm({ ...form, ...patch });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/inscricoes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            {isEdit ? "Editar Inscrição" : "Nova Inscrição na Release"}
          </h1>
          <p className="text-muted-foreground">
            Intake completo da demanda (formulário do PDF)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Release</Label>
              <Select
                value={form.releaseId || undefined}
                onValueChange={(v) => set({ releaseId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a release" />
                </SelectTrigger>
                <SelectContent>
                  {(releases ?? []).map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.sigla}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Nome da demanda</Label>
              <Input
                required
                value={form.nome}
                onChange={(e) => set({ nome: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Código ServiceNow</Label>
              <Input
                value={form.codigoServiceNow}
                onChange={(e) => set({ codigoServiceNow: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>WPS</Label>
              <Input
                value={form.wps}
                onChange={(e) => set({ wps: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Projeto SSP ID</Label>
              <Input
                value={form.projetoSspId}
                onChange={(e) => set({ projetoSspId: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Origem</Label>
              <Input
                value={form.origem}
                onChange={(e) => set({ origem: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Tamanho</Label>
              <Select
                value={form.tamanho || undefined}
                onValueChange={(v) => set({ tamanho: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TAMANHOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsáveis</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Líder da demanda</Label>
              <Input
                value={form.liderDemanda}
                onChange={(e) => set({ liderDemanda: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Líder / Gerente de projetos</Label>
              <Input
                value={form.liderGerenteProjetos}
                onChange={(e) =>
                  set({ liderGerenteProjetos: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Liderança da área</Label>
              <Input
                value={form.liderancaArea}
                onChange={(e) => set({ liderancaArea: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Escopo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Resumo executivo</Label>
              <Textarea
                rows={4}
                value={form.resumoExecutivo}
                onChange={(e) => set({ resumoExecutivo: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Processos de negócio</Label>
              <Textarea
                rows={3}
                value={form.processosNegocio}
                onChange={(e) => set({ processosNegocio: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Sistemas (De/Para)</Label>
              <Textarea
                rows={3}
                value={form.sistemasDePara}
                onChange={(e) => set({ sistemasDePara: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Áreas impactadas</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-md border p-3">
                {sortedAreas.length === 0 ? (
                  <span className="text-sm text-muted-foreground col-span-full">
                    Nenhuma área cadastrada.
                  </span>
                ) : (
                  sortedAreas.map((a) => (
                    <label
                      key={a.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={areaIds.includes(a.id)}
                        onCheckedChange={() => toggleArea(a.id)}
                      />
                      <span>{a.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anexos (URLs)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Kickoff</Label>
              <Input
                type="url"
                placeholder="https://"
                value={form.urlKickoff}
                onChange={(e) => set({ urlKickoff: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Business Case</Label>
              <Input
                type="url"
                placeholder="https://"
                value={form.urlBusinessCase}
                onChange={(e) => set({ urlBusinessCase: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Cronograma</Label>
              <Input
                type="url"
                placeholder="https://"
                value={form.urlCronograma}
                onChange={(e) => set({ urlCronograma: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custos e aprovação</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>PEP</Label>
              <Input
                value={form.pep}
                onChange={(e) => set({ pep: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Data de aprovação L2</Label>
              <Input
                type="date"
                value={form.dataAprovacaoL2}
                onChange={(e) => set({ dataAprovacaoL2: e.target.value })}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Detalhes PEP / OPEX</Label>
              <Textarea
                rows={3}
                value={form.pepOpexDetalhes}
                onChange={(e) => set({ pepOpexDetalhes: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer md:col-span-2">
              <Checkbox
                checked={form.cienteModeloCustos}
                onCheckedChange={(v) =>
                  set({ cienteModeloCustos: v === true })
                }
              />
              <span>Ciente do modelo de custos</span>
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/inscricoes")}
          >
            Cancelar
          </Button>
          <Button type="submit">Salvar inscrição</Button>
        </div>
      </form>
    </div>
  );
}
