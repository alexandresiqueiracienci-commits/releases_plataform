import { useState } from "react";
import {
  useGetEvidenciasMonitor,
  type EvidenciaGroupDelivery,
} from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EvidenciasFilters,
  type EvidenciasFilterValues,
} from "@/components/evidencias/EvidenciasFilters";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function GroupChart({
  title,
  data,
}: {
  title: string;
  data: EvidenciaGroupDelivery[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
              <Legend />
              <Bar
                dataKey="entregues"
                name="Entregues"
                stackId="a"
                fill="hsl(var(--chart-2))"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="pendentes"
                name="Pendentes"
                stackId="a"
                fill="hsl(var(--chart-4))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EvidenciasMonitorPage() {
  const [filters, setFilters] = useState<EvidenciasFilterValues>({});

  const { data, isLoading, isError } = useGetEvidenciasMonitor(filters);

  const summary = data?.summary;
  const pctEntregues =
    summary && summary.total > 0
      ? Math.round((summary.entregues / summary.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Monitor de Evidências
        </h1>
        <p className="text-muted-foreground">
          Acompanhamento consolidado da entrega das evidências dos testes
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EvidenciasFilters value={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-sm text-destructive">
          Não foi possível carregar o monitor de evidências. Tente novamente.
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Cenários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Evidências Enviadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.entregues || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pctEntregues}% do total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.pendentes || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Arquivos Anexados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.totalArquivos || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.comArquivos || 0} cenários com arquivos
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <GroupChart
              title="Entrega por Macro Processo"
              data={data?.byMacroProcesso ?? []}
            />
            <GroupChart title="Entrega por Site" data={data?.bySite ?? []} />
            <GroupChart
              title="Entrega por Sistema"
              data={data?.bySistema ?? []}
            />
            <GroupChart
              title="Entrega por Prioridade"
              data={data?.byPrioridade ?? []}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cenários e status de entrega</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
              {data?.rows && data.rows.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Teste</TableHead>
                      <TableHead>Cenário</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Sistema</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead className="text-right">Arquivos</TableHead>
                      <TableHead className="text-right">Entrega</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rows.map((row) => (
                      <TableRow key={row.scenarioId}>
                        <TableCell className="font-medium">
                          {row.idTeste || "—"}
                        </TableCell>
                        <TableCell
                          className="max-w-[300px] truncate"
                          title={row.cenario || ""}
                        >
                          {row.cenario || "—"}
                        </TableCell>
                        <TableCell>{row.site || "—"}</TableCell>
                        <TableCell>{row.sistema || "—"}</TableCell>
                        <TableCell>{row.prioridade || "—"}</TableCell>
                        <TableCell className="text-right">
                          {row.totalEvidencias}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.entregue ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-600">
                              Entregue
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pendente</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  Nenhum cenário disponível para os filtros selecionados.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
