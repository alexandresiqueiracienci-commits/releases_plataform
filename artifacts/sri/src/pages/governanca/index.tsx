import { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

type Tone = "blue" | "amber" | "green" | "red" | "purple" | "gray";

const toneStyles: Record<Tone, { background: string; color: string }> = {
  blue: { background: "#E7F1FB", color: "#185FA5" },
  amber: { background: "#FAEEDA", color: "#633806" },
  green: { background: "#EAF3DE", color: "#27500A" },
  red: { background: "#FCEBEB", color: "#791F1F" },
  purple: { background: "#EEEDFE", color: "#3C3489" },
  gray: { background: "#F1F2F4", color: "#5B6470" },
};

function Tag({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md"
      style={toneStyles[tone]}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-5 mb-2">
      {children}
    </div>
  );
}

function InfoCard({
  title,
  titleColor,
  children,
  pills,
}: {
  title?: ReactNode;
  titleColor?: string;
  children: ReactNode;
  pills?: ReactNode;
}) {
  return (
    <Card className="mb-2.5 shadow-none">
      <CardContent className="p-4">
        {title && (
          <div
            className="text-[13px] font-medium mb-1.5"
            style={titleColor ? { color: titleColor } : undefined}
          >
            {title}
          </div>
        )}
        <div className="text-xs text-muted-foreground leading-relaxed">{children}</div>
        {pills && <div className="flex flex-wrap gap-1.5 mt-2">{pills}</div>}
      </CardContent>
    </Card>
  );
}

function FlowStep({
  num,
  title,
  children,
  numStyle,
}: {
  num: number;
  title: string;
  children: ReactNode;
  numStyle?: React.CSSProperties;
}) {
  return (
    <div className="flex items-start gap-2.5 mb-3">
      <div
        className="w-6 h-6 rounded-full bg-muted border flex items-center justify-center text-[11px] font-medium shrink-0 text-muted-foreground"
        style={numStyle}
      >
        {num}
      </div>
      <div className="flex-1">
        <p className="text-[13px] font-medium text-foreground mb-0.5">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed m-0">{children}</p>
      </div>
    </div>
  );
}

function RiskRow({
  level,
  title,
  children,
}: {
  level: "alto" | "med" | "low";
  title: string;
  children: ReactNode;
}) {
  const map = {
    alto: { background: "#FCEBEB", color: "#791F1F", icon: "!" },
    med: { background: "#FAEEDA", color: "#633806", icon: "~" },
    low: { background: "#EAF3DE", color: "#27500A", icon: "✓" },
  } as const;
  const s = map[level];
  return (
    <div className="flex items-start gap-2 mb-2">
      <div
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 text-[11px] font-medium"
        style={{ background: s.background, color: s.color }}
      >
        {s.icon}
      </div>
      <div>
        <div className="text-[13px] font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{children}</div>
      </div>
    </div>
  );
}

const RELEASE_ACTIVITIES: { num: number; fase: string; atividade: string; tone: Tone }[] = [
  { num: 1, fase: "Inscrição da demanda", atividade: "Inscrever demanda", tone: "blue" },
  { num: 2, fase: "Inscrição da demanda", atividade: "Aprovar custos", tone: "blue" },
  { num: 3, fase: "Planejamento", atividade: "Planejar release", tone: "purple" },
  { num: 4, fase: "Planejamento", atividade: "Detalhar escopo: processos, deltas e impactos", tone: "purple" },
  { num: 5, fase: "Planejamento", atividade: "Definir cenários de testes: integração, regressão, UAT e validação", tone: "purple" },
  { num: 6, fase: "Testes (Pré-QA)", atividade: "Liberar solicitações de transporte em DEV", tone: "amber" },
  { num: 7, fase: "Testes (Entrada QA)", atividade: "Importar OTs no ambiente de QA", tone: "amber" },
  { num: 8, fase: "Testes", atividade: "Realizar teste integrado", tone: "amber" },
  { num: 9, fase: "Testes", atividade: "Realizar teste UAT (usuários)", tone: "amber" },
  { num: 10, fase: "Testes", atividade: "Realizar teste de regressão (automatizado ou manual)", tone: "amber" },
  { num: 11, fase: "Planejamento Cutover", atividade: "Construir e alinhar o Plano de Cutover (com base nos testes)", tone: "green" },
  { num: 12, fase: "Planejamento Cutover", atividade: "Validar cenários de testes de liberação", tone: "green" },
  { num: 13, fase: "Go / No Go", atividade: "Aprovar plano de Cutover e realizar reunião de Go / No Go", tone: "red" },
  { num: 14, fase: "Cutover (Preparação)", atividade: "Enviar comunicação de release (aviso aos usuários)", tone: "green" },
  { num: 15, fase: "Cutover (Preparação)", atividade: "Preparar infraestrutura física e sistêmica (backup, travar jobs/usuários)", tone: "green" },
  { num: 16, fase: "Cutover (Execução)", atividade: "Importar solicitações de transporte para PROD", tone: "green" },
  { num: 17, fase: "Cutover (Execução)", atividade: "Executar atividades manuais e abrir/acompanhar SMs pais e filhas", tone: "green" },
  { num: 18, fase: "Cutover (Validação)", atividade: "Realizar testes de liberação / validar cenários em PROD (sanity check)", tone: "green" },
  { num: 19, fase: "Cutover (Encerramento)", atividade: "Atualização final da documentação nas ferramentas (LeanIX, G-Drive, Signavio, Jira)", tone: "green" },
  { num: 20, fase: "SPGL / Hypercare", atividade: "Acompanhar a implantação da demanda e reportar o status", tone: "gray" },
  { num: 21, fase: "Hypercare", atividade: "Reportar incidentes críticos para serem registrados no diário de bordo", tone: "gray" },
  { num: 22, fase: "Encerramento", atividade: "Complementar as informações de lições aprendidas na release", tone: "gray" },
];

const tabs = [
  { value: "processos", label: "Processos" },
  { value: "ambientes", label: "Ambientes" },
  { value: "testes", label: "Estratégia de testes" },
  { value: "ferramentas", label: "Ferramentas" },
  { value: "rituais", label: "Rituais" },
  { value: "entregas", label: "Entregas" },
  { value: "riscos", label: "Riscos" },
  { value: "proximos", label: "Próximos passos" },
];

export default function GovernancaPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Governança de Releases SAP</h1>
        <p className="text-muted-foreground mt-1">
          Mapa Estratégico - SAP S4 + SAP ECC
        </p>
      </div>

      <Tabs defaultValue="processos" className="w-full">
        <TabsList className="flex flex-wrap h-auto justify-start gap-1.5 bg-transparent p-0">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="text-xs data-[state=active]:bg-muted data-[state=active]:shadow-none border data-[state=active]:border-border border-transparent"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* PROCESSOS */}
        <TabsContent value="processos" className="mt-4">
          <SectionLabel>Ciclo de vida de uma release maior</SectionLabel>
          <FlowStep num={1} title="Abertura de demanda">
            Registro no ServiceNow (CERF) a partir de 1º/jul. Obrigatório informar: deltas a alterar,
            processos impactados, NBCs envolvidas, Work Processes (WPs) equivalentes. Identificação de
            líderes: P2M, Tags, R2R, P2P, Masterdata.
          </FlowStep>
          <FlowStep num={2} title="Análise de impacto e mapeamento de deltas">
            Uso do Signavio e LinhaX para visualizar cadeia de valor e relações entre processos, deltas,
            extensões, jobs e integrações. Cada WP representa um delta no S/4. Documentação dos deltas
            alterados é entregável obrigatório de cada release.
          </FlowStep>
          <FlowStep num={3} title="Desenvolvimento concorrente (janelas de trabalho)">
            Processo com Auro para coordenar janelas sobre deltas específicos — evita conflito/lock entre
            projetos paralelos (Indústria, Cosméticos, futuro Spana). Alinhamento com Alan, Auro e André.
          </FlowStep>
          <FlowStep num={4} title="Testes de liberação (TDR)">
            Baseline de testes por camada: ECC, Convivência ECC/S4 (33 cenários fixos), S/4 + satélites
            (seleção orientada por deltas alterados). Evidências manuais obrigatórias. IA (Joule) para
            TSDD/FSDD futuramente.
          </FlowStep>
          <FlowStep num={5} title="Checklist de conformidade documental">
            Checklist obrigatório com documentação atualizada no Google Drive + registros no Signavio/LinhaX.
            Release bloqueada se documentação dos deltas não estiver atualizada. AMS (Accenture) demanda
            conformidade.
          </FlowStep>
          <FlowStep num={6} title="Go live / implantação e suporte pós go-live">
            Chamados via ServiceNow → filas T2R dos líderes. Diário de Bordo SPGL. Gestão da Release apoia
            tratativa entre equipes de Projetos e Sustentação.
          </FlowStep>

          <Separator className="my-3" />
          <SectionLabel>Detalhamento operacional — atividades por fase</SectionLabel>
          <Card className="shadow-none">
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead className="w-56">Fase</TableHead>
                    <TableHead>Atividade sugerida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RELEASE_ACTIVITIES.map((a, i) => {
                    const firstOfPhase = i === 0 || RELEASE_ACTIVITIES[i - 1].fase !== a.fase;
                    return (
                      <TableRow key={a.num}>
                        <TableCell className="text-muted-foreground tabular-nums">{a.num}</TableCell>
                        <TableCell className="align-top">
                          {firstOfPhase ? (
                            <Tag tone={a.tone}>{a.fase}</Tag>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 pl-1">↳</span>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground">{a.atividade}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Separator className="my-3" />
          <InfoCard
            title="Cadência de releases SAP"
            pills={
              <>
                <Tag tone="blue">Jan</Tag>
                <Tag tone="blue">Mar</Tag>
                <Tag tone="amber">Jun (atual)</Tag>
                <Tag tone="blue">Set</Tag>
              </>
            }
          >
            Releases quase mensais · 4 releases maiores por ano: jan / mar / jun / set · Manutenção
            programada intercalada (ex.: set/26 duas semanas após release ago/26)
          </InfoCard>
        </TabsContent>

        {/* AMBIENTES */}
        <TabsContent value="ambientes" className="mt-4">
          <SectionLabel>ECC — trilhas de ambiente não-produtivo</SectionLabel>
          <div className="grid gap-2.5 md:grid-cols-2">
            <InfoCard
              title="Trilha Z1"
              pills={
                <>
                  <Tag tone="blue">T4ALL</Tag>
                  <Tag tone="gray">Refresh ago/26</Tag>
                </>
              }
            >
              DZ1 · QZ1 · RZ1
              <br />
              Usada para projeto T4 (refresh início de agosto para preparar próximos projetos de jan/27).
            </InfoCard>
            <InfoCard
              title="Trilha Z2"
              pills={
                <>
                  <Tag tone="amber">Reforma Tributária</Tag>
                  <Tag tone="amber">CBPJ</Tag>
                </>
              }
            >
              DZ2 · QZ2 · RZ2
              <br />
              Projetos de agosto: Reforma Tributária Onda 2, CBPJ, CNPJ Alfanumérico. Confirmar refresh RZ2
              fim de junho.
            </InfoCard>
          </div>

          <SectionLabel>S/4HANA — ambientes cloud SAP</SectionLabel>
          <InfoCard
            title="NC2 · NC30 — ambientes de projeto S/4"
            pills={
              <>
                <Tag tone="red">Lock de objetos</Tag>
                <Tag tone="amber">Compartilhado Globant</Tag>
                <Tag tone="blue">28 satélites integrados</Tag>
              </>
            }
          >
            Ambientes cloud SAP (não podem ser desligados, mas integrações e jobs ficam indisponíveis em
            janelas de manutenção).
            <br />
            Compartilhados com Globant/Cosméticos — risco de conflito e lock de objetos.
            <br />
            Ambientes mais limitados que ECC: requer organização rigorosa de janelas de trabalho.
          </InfoCard>

          <SectionLabel>Responsabilidades</SectionLabel>
          <Card className="shadow-none">
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Frente</TableHead>
                    <TableHead>Apoio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-foreground">Alê (Alexandre Costal)</TableCell>
                    <TableCell>Releases SAP (ECC + S/4)</TableCell>
                    <TableCell>Giovanni, Speaker 3</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-foreground">Giovanni</TableCell>
                    <TableCell>Manutenções programadas</TableCell>
                    <TableCell>Alê, Speaker 3</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-foreground">Alan (engenharia)</TableCell>
                    <TableCell>Desenvolvimento S/4HANA</TableCell>
                    <TableCell>Auro, André</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-foreground">Felipe / Fabi (time)</TableCell>
                    <TableCell>Gestão ambientes não-produtivos ECC</TableCell>
                    <TableCell>—</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TESTES */}
        <TabsContent value="testes" className="mt-4">
          <SectionLabel>Estrutura de cenários (547 total — base T4ALL go live)</SectionLabel>
          <div className="grid gap-2.5 md:grid-cols-3">
            <InfoCard
              title="Convivência ECC/S4"
              titleColor="#185FA5"
              pills={
                <>
                  <Tag tone="blue">Fixo</Tag>
                  <Tag tone="blue">CS4</Tag>
                </>
              }
            >
              33 cenários · Sempre testados em todas as releases maiores · Validam comunicação e integração
              entre os dois sistemas.
            </InfoCard>
            <InfoCard
              title="S/4 + Satélites"
              titleColor="#0F6E56"
              pills={
                <>
                  <Tag tone="green">Por delta</Tag>
                  <Tag tone="green">~300 total</Tag>
                </>
              }
            >
              ~300 cenários · Seleção orientada pelos deltas alterados na release · Foco na cadeia impactada
              (O9, PLM, OTM, etc).
            </InfoCard>
            <InfoCard
              title="ECC baseline"
              titleColor="#634AB7"
              pills={
                <>
                  <Tag tone="purple">Em revisão</Tag>
                  <Tag tone="purple">Bruno/Dai/Alê</Tag>
                </>
              }
            >
              Cenários legados ECC · Tudo que era indústria ECC sai da baseline · Recomposição com cenários
              de indústria S/4.
            </InfoCard>
          </div>

          <SectionLabel>Estratégia de seleção</SectionLabel>
          <InfoCard title="Abordagem orientada por delta">
            1. Identificar quais deltas serão alterados na release
            <br />
            2. Usar Signavio/LinhaX para mapear cadeia de valor afetada
            <br />
            3. Selecionar cenários que cobrem essa cadeia (não testar os 300 sempre)
            <br />
            4. Manter os 33 de convivência como cota fixa
            <br />
            5. Primeira release S/4: escopo maior → refinar progressivamente
          </InfoCard>

          <SectionLabel>Nova baseline a construir (Aug/26)</SectionLabel>
          <InfoCard
            title="Reunião de baseline — DAE + Moioli"
            pills={
              <>
                <Tag tone="amber">Reforma Tributária Onda 2</Tag>
                <Tag tone="amber">CBPJ</Tag>
                <Tag tone="amber">CNPJ alfanumérico</Tag>
              </>
            }
          >
            Objetivo: definir nova baseline de testes considerando indústria S/4 e convivência.
            Responsáveis: Bruno Moioli, Dai, Alê e donos de satélites (O9, PLM, OTM). Aplicar metodologia já
            na janela de agosto.
          </InfoCard>

          <SectionLabel>IA para testes</SectionLabel>
          <InfoCard
            title="Joule (SAP) para TSDD/FSDD"
            pills={
              <>
                <Tag tone="purple">Joule / Globant / Numen</Tag>
                <Tag tone="gray">Evidências manuais</Tag>
              </>
            }
          >
            Michael, Brás e Sena Júlia trabalhando no desenvolvimento. Visão agregada de processos/deltas e
            sugestão de impactos e cenários. Evidências de testes continuam manuais. Calm (Cosméticos) para
            mapear deltas a processos e prontidão de testes integrados — avaliar expansão.
          </InfoCard>
        </TabsContent>

        {/* FERRAMENTAS */}
        <TabsContent value="ferramentas" className="mt-4">
          <SectionLabel>Ferramentas por função</SectionLabel>
          <Card className="shadow-none">
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ferramenta</TableHead>
                    <TableHead>Sistema</TableHead>
                    <TableHead>Uso principal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Solman (SOMEN)", "ECC", "Gestão de transporte, documentação de processos legada"],
                    ["Google Drive", "S/4HANA", "Documentação de processos e deltas S/4 (substitui Solman)"],
                    ["Signavio", "S/4 + ECC", "Visualização de cadeia de valor, mapeamento de impactos, extensões, países"],
                    ["LinhaX", "S/4 + ECC", "Visibilidade de interfaces e extensões, análise de deltas"],
                    ["ServiceNow (CERF)", "Ambos", "Abertura de demandas, chamados, projetos. Operação a partir de 1º/jul"],
                    ["Calm", "S/4 (Cosméticos)", "Mapeamento de deltas a processos, prontidão de testes integrados"],
                    ["Cloud ALM", "S/4", "ALM (Application Lifecycle Management) S/4"],
                    ["Joule (SAP AI)", "S/4", "Consulta de deltas, TSDD/FSDD, sugestão de cenários de teste"],
                    ["Charm / ALM", "ECC + S/4", "Gestão de mudanças, vínculo WP ↔ delta"],
                  ].map(([ferramenta, sistema, uso]) => (
                    <TableRow key={ferramenta}>
                      <TableCell className="font-medium text-foreground">{ferramenta}</TableCell>
                      <TableCell>{sistema}</TableCell>
                      <TableCell>{uso}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <SectionLabel>Acesso e capacitação</SectionLabel>
          <InfoCard title="Portal Hub (Lean AX) — central de conhecimento">
            Links para Signavio, Cloud ALM, materiais de treinamento (Charm, BTP, etc.) e gravações. Acesso
            ao LM/ALM via Speaker 2. Correção de problema de direcionamento no Google Drive. Equipe deve
            revisar materiais disponíveis.
          </InfoCard>
        </TabsContent>

        {/* RITUAIS */}
        <TabsContent value="rituais" className="mt-4">
          <SectionLabel>Rituais recorrentes identificados</SectionLabel>
          <InfoCard
            title="Reunião semanal de governança"
            pills={
              <>
                <Tag tone="blue">Semanal</Tag>
                <Tag tone="gray">Todos os Lunes?</Tag>
              </>
            }
          >
            Governança de ambientes S/4HANA + releases SAP + temas de reform tributária. Participantes: Alê,
            Giovanni, Alan, Speaker 3, Speaker 4 (Gil). Próxima agenda: 17/06/2026.
          </InfoCard>
          <InfoCard
            title="Reunião de baseline (pré-release maior)"
            pills={<Tag tone="amber">Por release</Tag>}
          >
            Definição e validação da baseline de testes S/4 + convivência. Participantes: DAE, Bruno Moioli,
            Alê. Donos de satélites por demanda. Frequência: antes de cada release maior.
          </InfoCard>
          <InfoCard
            title="Alinhamento de desenvolvimento concorrente"
            pills={<Tag tone="green">Ad hoc / por release</Tag>}
          >
            Definição de janelas de trabalho por delta específico. Participantes: Alan, Auro, André. Processo
            desenhado pelo Auro. Evita conflito/lock entre Indústria, Cosméticos e Spana.
          </InfoCard>
          <InfoCard
            title="Checklist de conformidade documental"
            pills={<Tag tone="red">Gate obrigatório</Tag>}
          >
            Verificação de documentação de deltas no Google Drive e Signavio/LinhaX antes da janela de
            implantação. Bloqueador de release. AMS (Accenture) verifica conformidade.
          </InfoCard>
          <InfoCard
            title="Revisão de portal e processos (10/06)"
            pills={<Tag tone="purple">Pontual — 10/06/26</Tag>}
          >
            Reunião entre Speaker 1 (Alê) e Speaker 2 para detalhar processos S/4, itens de release, portal
            Hub e acessos LM/ALM. Correção do direcionamento Google Drive.
          </InfoCard>
        </TabsContent>

        {/* ENTREGAS */}
        <TabsContent value="entregas" className="mt-4">
          <SectionLabel>Entregas obrigatórias por release</SectionLabel>
          <div className="grid gap-2.5 md:grid-cols-2">
            <InfoCard title="Documentação de deltas" pills={<Tag tone="red">Bloqueador</Tag>}>
              Documentação atualizada de cada delta modificado na release. Repositório: Google Drive (S/4) /
              Solman (ECC). Reflexo obrigatório no Signavio e LinhaX.
            </InfoCard>
            <InfoCard title="Evidências de testes" pills={<Tag tone="amber">Obrigatório</Tag>}>
              Evidências manuais por cenário executado. Envio ao e-mail releasestd@natura.net. Gestão via
              planilha de testes + diretórios organizados por área.
            </InfoCard>
            <InfoCard title="Registro de demanda (ServiceNow)" pills={<Tag tone="blue">A partir jul/26</Tag>}>
              Demanda com: deltas a alterar, processos impactados, NBCs, WPs, responsável NBC. Válido a
              partir de 1º/jul com CERF em operação.
            </InfoCard>
            <InfoCard title="Baseline de testes atualizada" pills={<Tag tone="green">Para ago/26</Tag>}>
              Nova baseline S/4 + ECC (retirando cenários indústria legados e adicionando cenários de
              indústria S/4). Construção colaborativa com Bruno Moioli, Dai, donos de satélites.
            </InfoCard>
          </div>

          <SectionLabel>Projetos em escopo — Release Agosto 2026</SectionLabel>
          <InfoCard
            pills={
              <>
                <Tag tone="amber">Reforma Tributária Onda 2</Tag>
                <Tag tone="amber">Portal PJ (CBPJ)</Tag>
                <Tag tone="amber">CNPJ Alfanumérico</Tag>
              </>
            }
          >
            Janela: <strong>15-16 de agosto (sáb/dom)</strong> · Manutenção programada em setembro (±2
            semanas depois)
          </InfoCard>

          <SectionLabel>Impactos da Reforma Tributária a mapear</SectionLabel>
          <InfoCard>
            Contas a Pagar · Área Fiscal · Indústria · Convivência ECC/S4/SCC · Dados e integrações
            (Databricks/analytics) · Ajustes imediatos na indústria · Parte dos itens em Cosméticos 2027
          </InfoCard>
        </TabsContent>

        {/* RISCOS */}
        <TabsContent value="riscos" className="mt-4">
          <SectionLabel>Riscos identificados na reunião</SectionLabel>
          <RiskRow level="alto" title="Lock de objetos — ambientes compartilhados S/4">
            NC2/NC30 compartilhados com Globant (Cosméticos). Desenvolvimento concorrente sem janelas
            acordadas causa lock e conflito de objetos. Procedimento temporário enquanto Cosméticos existir —
            pode durar anos (Spana como próximo).
          </RiskRow>
          <Separator className="my-3" />
          <RiskRow level="alto" title="Baseline de testes S/4 indefinida">
            547 cenários do go live não são adequados para releases recorrentes. Sem nova baseline, risco de
            testar desnecessariamente ou deixar gaps críticos. Ponto crítico para primeira release maior com
            S/4.
          </RiskRow>
          <Separator className="my-3" />
          <RiskRow level="alto" title="Identificação de NBCs pelos times">
            Times com dificuldade esperada em identificar processos/NBCs impactados. Risco de demandas
            abertas sem vínculo com deltas, dificultando análise de impacto. ServiceNow ainda em ajuste para
            exigir esse campo.
          </RiskRow>
          <Separator className="my-3" />
          <RiskRow level="med" title="Documentação de deltas incompleta">
            Transição Solman → Google Drive em andamento. Sem checklist implantado, releases podem passar sem
            documentação atualizada. AMS demanda esse padrão.
          </RiskRow>
          <Separator className="my-3" />
          <RiskRow level="med" title="Impacto da Reforma Tributária em Databricks/analytics">
            Escopo "dados e integrações" genérico no atual plano. Impacto real em Databricks e analytics não
            avaliado. Pode gerar surpresas na janela de agosto.
          </RiskRow>
          <Separator className="my-3" />
          <RiskRow level="low" title="Refresh RZ2 fim de junho">
            Confirmação pendente da data de refresh do ambiente RZ2. Pode impactar disponibilidade para
            desenvolvimento do CBPJ/Reforma Tributária.
          </RiskRow>
        </TabsContent>

        {/* PRÓXIMOS PASSOS */}
        <TabsContent value="proximos" className="mt-4">
          <SectionLabel>Ações imediatas — Junho 2026</SectionLabel>
          <FlowStep
            num={1}
            title="Confirmar refresh RZ2 — fim de junho"
            numStyle={{ background: "#FAEEDA", color: "#633806", borderColor: "#FAC775" }}
          >
            Validar data com time Felipe/Fabi para garantir disponibilidade do ambiente Z2 para Reforma
            Tributária e CBPJ.
          </FlowStep>
          <FlowStep
            num={2}
            title="Reunião de detalhes de processos — 10/06 (hoje)"
            numStyle={{ background: "#FAEEDA", color: "#633806", borderColor: "#FAC775" }}
          >
            Alê + Speaker 2: detalhar processos S/4, itens release agosto, revisão portal Hub, corrigir
            direcionamento Google Drive, liberar acessos LM/ALM.
          </FlowStep>
          <FlowStep num={3} title="Mapear impactos da Reforma Tributária por módulo">
            Fiscal, Contas a Pagar, Indústria, Convivência, Databricks/analytics. Identificar deltas com
            apoio dos times.
          </FlowStep>
          <FlowStep num={4} title="Estruturar baseline de testes agosto (reunião DAE + Moioli)">
            Selecionar cenários essenciais dentre ~300 S/4 + satélites. Validar 33 convivência. Aplicar
            metodologia orientada por delta.
          </FlowStep>
          <FlowStep num={5} title="Alinhar Alan, Auro e André — desenvolvimento concorrente">
            Organizar janelas de trabalho para releases com Cosméticos coexistindo. Processo com Auro já
            desenhado como base.
          </FlowStep>
          <FlowStep num={6} title="Formalizar abertura de demanda com processos/deltas/NBCs">
            Formulário, validação e responsáveis. Treinamento em Signavio/LinhaX para os times. Alinhamento
            com Accenture AMS.
          </FlowStep>
          <FlowStep num={7} title="Criar checklist de conformidade documental (bloqueador release)">
            Google Drive + Signavio/LinhaX. Definir convenções de nomenclatura e versionamento entre
            repositórios.
          </FlowStep>

          <SectionLabel>Próxima reunião semanal</SectionLabel>
          <InfoCard>
            <span className="text-[13px]">
              <strong>17/06/2026</strong> — Reunião de Release SAP e Gestão de Ambientes não-produtivos
              <br />
              Responsáveis: Fabíola Toledo · Alexandre Siqueira (releases) · Viviane Moreto · Rodolfo Carmona
              (testes/regressão)
            </span>
          </InfoCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
