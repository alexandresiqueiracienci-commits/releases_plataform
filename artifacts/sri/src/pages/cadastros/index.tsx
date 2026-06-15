import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

const LOOKUP_CATEGORIES = [
  { key: "status_cenario", label: "Status do Cenário" },
  { key: "status_erro", label: "Status Erro" },
  { key: "bloco_execucao", label: "Bloco Execução" },
  { key: "cds_hub", label: "CDs/Hub" },
  { key: "centros", label: "Centros" },
  { key: "entregas", label: "Entregas (BASELINE/CUSTOMIZADO)" },
  { key: "site", label: "Site" },
  { key: "macro_processo", label: "Macro Processo" },
  { key: "facilitador", label: "Facilitador" },
  { key: "quem_executa", label: "Quem Executa (Localidades)" },
  { key: "sistema", label: "Sistema" },
  { key: "prioridade", label: "Prioridade" },
];

export default function CadastrosIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Cadastros Básicos</h1>
        <p className="text-muted-foreground">Gerencie os valores das listas de seleção do sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LOOKUP_CATEGORIES.map((cat) => (
          <Link key={cat.key} href={`/cadastros/${cat.key}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{cat.label}</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Editar opções de {cat.label.toLowerCase()}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
