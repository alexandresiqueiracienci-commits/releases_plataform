import { useListLookups } from "@workspace/api-client-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface EvidenciasFilterValues {
  site?: string;
  sistema?: string;
  macroProcesso?: string;
  prioridade?: string;
  quemExecuta?: string;
  facilitador?: string;
  keyUser?: string;
  superUser?: string;
  statusCenario?: string;
}

const ALL = "all";

function LookupSelect({
  label,
  category,
  value,
  onChange,
}: {
  label: string;
  category: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const { data: options } = useListLookups({ category });
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select
        value={value ?? ALL}
        onValueChange={(v) => onChange(v === ALL ? undefined : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Todos`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos</SelectItem>
          {options?.map((opt) => (
            <SelectItem key={opt.id} value={opt.value}>
              {opt.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TextFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value ?? ""}
        placeholder={`Filtrar por ${label.toLowerCase()}`}
        onChange={(e) => onChange(e.target.value || undefined)}
      />
    </div>
  );
}

export function EvidenciasFilters({
  value,
  onChange,
}: {
  value: EvidenciasFilterValues;
  onChange: (value: EvidenciasFilterValues) => void;
}) {
  const set = (patch: Partial<EvidenciasFilterValues>) =>
    onChange({ ...value, ...patch });

  const hasActive = Object.values(value).some(
    (v) => v !== undefined && v !== "",
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <LookupSelect
          label="Site"
          category="site"
          value={value.site}
          onChange={(v) => set({ site: v })}
        />
        <LookupSelect
          label="Sistema"
          category="sistema"
          value={value.sistema}
          onChange={(v) => set({ sistema: v })}
        />
        <LookupSelect
          label="Macro Processo"
          category="macro_processo"
          value={value.macroProcesso}
          onChange={(v) => set({ macroProcesso: v })}
        />
        <LookupSelect
          label="Prioridade"
          category="prioridade"
          value={value.prioridade}
          onChange={(v) => set({ prioridade: v })}
        />
        <LookupSelect
          label="Quem Executa"
          category="quem_executa"
          value={value.quemExecuta}
          onChange={(v) => set({ quemExecuta: v })}
        />
        <LookupSelect
          label="Facilitador"
          category="facilitador"
          value={value.facilitador}
          onChange={(v) => set({ facilitador: v })}
        />
        <LookupSelect
          label="Status do Cenário"
          category="status_cenario"
          value={value.statusCenario}
          onChange={(v) => set({ statusCenario: v })}
        />
        <TextFilter
          label="Key User"
          value={value.keyUser}
          onChange={(v) => set({ keyUser: v })}
        />
        <TextFilter
          label="Super User"
          value={value.superUser}
          onChange={(v) => set({ superUser: v })}
        />
      </div>
      {hasActive && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onChange({})}>
            <X className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
