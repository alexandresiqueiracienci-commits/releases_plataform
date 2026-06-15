import { useState } from "react";
import { useGetDashboardSummary, useGetDashboardMatrix } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function DashboardsPage() {
  const [prioridade, setPrioridade] = useState<string>("all");
  
  const queryParams = prioridade !== "all" ? { prioridade } : {};
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary(queryParams);
  const { data: matrix, isLoading: isLoadingMatrix } = useGetDashboardMatrix(queryParams);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboards</h1>
          <p className="text-muted-foreground">Visão consolidada do progresso dos testes</p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={prioridade} onValueChange={setPrioridade}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Prioridades</SelectItem>
              <SelectItem value="P0">P0</SelectItem>
              <SelectItem value="P1">P1</SelectItem>
              <SelectItem value="P2">P2</SelectItem>
              <SelectItem value="P3">P3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoadingSummary || isLoadingMatrix ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Cenários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.total || 0}</div>
              </CardContent>
            </Card>
            {summary?.byStatus.slice(0, 3).map((s, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium truncate" title={s.label}>{s.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{s.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {summary.total > 0 ? Math.round((s.count / summary.total) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cenários por Status</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {summary?.byStatus && summary.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.byStatus}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {summary.byStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">Nenhum dado disponível</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cenários por Site</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {summary?.bySite && summary.bySite.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.bySite}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{fontSize: 12}} />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">Nenhum dado disponível</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Matriz: Site × Status do Cenário</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
              {matrix?.statuses && matrix.statuses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Site</TableHead>
                      {matrix.statuses.map((status, i) => (
                        <TableHead key={i} className="text-right">{status}</TableHead>
                      ))}
                      <TableHead className="text-right font-bold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matrix.rows.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.site}</TableCell>
                        {row.cells.map((cell, j) => (
                          <TableCell key={j} className="text-right">{cell}</TableCell>
                        ))}
                        <TableCell className="text-right font-bold">{row.total}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Total</TableCell>
                      {matrix.columnTotals.map((total, i) => (
                        <TableCell key={i} className="text-right font-bold">{total}</TableCell>
                      ))}
                      <TableCell className="text-right font-bold text-primary">{matrix.grandTotal}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/20">
                      <TableCell className="font-bold">% por Status</TableCell>
                      {matrix.statusPercentages.map((perc, i) => (
                        <TableCell key={i} className="text-right text-xs">{perc.toFixed(1)}%</TableCell>
                      ))}
                      <TableCell className="text-right font-bold">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-muted-foreground">Nenhuma matriz disponível para os filtros selecionados.</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
