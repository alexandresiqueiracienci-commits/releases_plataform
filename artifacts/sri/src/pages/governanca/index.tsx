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

const PHASE_TONE: Record<string, Tone> = {
  "Inscrição da demanda": "blue",
  Planejamento: "purple",
  "Testes (Pré-QA)": "amber",
  "Testes (Entrada QA)": "amber",
  Testes: "amber",
  "Planejamento Cutover": "green",
  "Cutover (Preparação)": "green",
  "Cutover (Execução)": "green",
  "Cutover (Validação)": "green",
  "Go / No Go Técnico": "red",
  "Go / No Go (Testes de Liberação)": "red",
  "Go / No Go Final Release": "red",
  "SPGL / Hypercare": "gray",
  Hypercare: "gray",
  Encerramento: "gray",
};

type ProcessStep = {
  fase: string;
  atividade: string;
  ferramenta?: string;
  responsavel: string;
  obs?: string;
};

const PROCESS_STEPS: ProcessStep[] = [
  { fase: "Inscrição da demanda", atividade: "Inscrever demanda", ferramenta: "Formulário Sharepoint", responsavel: "Líder Demanda" },
  { fase: "Inscrição da demanda", atividade: "Aprovar custos", ferramenta: "Formulário Sharepoint + SNOW", responsavel: "Líder Demanda" },
  { fase: "Planejamento", atividade: "Planejar release — alinhar o cronograma do projeto ao cronograma macro de releases", ferramenta: "Cronograma SNOW + Cronograma Release", responsavel: "Líder Demanda + GR" },
  { fase: "Planejamento", atividade: "Detalhar escopo: processos, deltas e impactos", ferramenta: "Signavio + LeanIX", responsavel: "Líder Demanda" },
  { fase: "Planejamento", atividade: "Definir cenários de testes: integração, regressão, UAT e validação", ferramenta: "JIRA + SNOW", responsavel: "Equipe Projeto + Qualidade" },
  { fase: "Testes (Pré-QA)", atividade: "Liberar solicitações de transporte em DEV", ferramenta: "Solman", responsavel: "BASIS" },
  { fase: "Testes (Entrada QA)", atividade: "Importar OTs no ambiente de QA", ferramenta: "Verificar", responsavel: "BASIS" },
  { fase: "Testes", atividade: "Realizar teste integrado", ferramenta: "JIRA + SNOW", responsavel: "Equipe Projeto" },
  { fase: "Testes", atividade: "Realizar teste UAT (usuários)", ferramenta: "JIRA + SNOW", responsavel: "Equipe Projeto" },
  { fase: "Testes", atividade: "Realizar teste de regressão (automatizado ou manual)", ferramenta: "JIRA + SNOW", responsavel: "Qualidade / Carmona" },
  { fase: "Testes", atividade: "Atualização final da documentação nas ferramentas", ferramenta: "LeanIX, G-Drive, Signavio, Jira", responsavel: "Líder Demanda" },
  { fase: "Planejamento Cutover", atividade: "Construir e alinhar o Plano de Cutover (com base nos testes)", ferramenta: "SNOW", responsavel: "Líder Demanda + GR + GPs Fornecedores + Equipes Executoras" },
  { fase: "Planejamento Cutover", atividade: "Validar cenários de testes de liberação", ferramenta: "JIRA + SNOW", responsavel: "Líder Demanda" },
  { fase: "Planejamento Cutover", atividade: "Aprovar plano de Cutover", ferramenta: "SNOW", responsavel: "GMUD + Líderes" },
  { fase: "Cutover (Preparação)", atividade: "Enviar comunicação de release (aviso aos usuários)", ferramenta: "E-mail, Espaços Google, Intranet, SAP + ppt", responsavel: "1 comunicado 2 sem. antes + sexta anterior (Welcome Kit)", obs: "Avaliar comunicação" },
  { fase: "Cutover (Preparação)", atividade: "Preparar infraestrutura física", ferramenta: "—", responsavel: "BASIS", obs: "Definir responsável" },
  { fase: "Cutover (Execução)", atividade: "Importar solicitações de transporte para PROD", ferramenta: "Pacote de QA", responsavel: "BASIS", obs: "Alinhar com Auro" },
  { fase: "Cutover (Execução)", atividade: "Executar atividades manuais e abrir/acompanhar SMs pais e filhas", ferramenta: "Solman", responsavel: "Pais (GR) + Filhas (Líder da Demanda)" },
  { fase: "Cutover (Execução)", atividade: "Coletar evidências das atividades do cutover", ferramenta: "Solman", responsavel: "—" },
  { fase: "Go / No Go Técnico", atividade: "De acordo da equipe técnica para a retomada do SAP", ferramenta: "Call + Ata", responsavel: "Times Técnicos" },
  { fase: "Go / No Go (Testes de Liberação)", atividade: "Validar ambiente para iniciar os testes", ferramenta: "Call + Ata", responsavel: "Facilitadores" },
  { fase: "Cutover (Validação)", atividade: "Realizar testes de liberação / validar cenários em PROD (Sanity Check)", ferramenta: "SAP", responsavel: "Facilitadores" },
  { fase: "Go / No Go Final Release", atividade: "Realizar reunião de Go / No Go", ferramenta: "Call individual por demanda", responsavel: "GR + Líder + Envolvidos Projeto", obs: "1 sem. antes" },
  { fase: "SPGL / Hypercare", atividade: "Acompanhar a implantação da demanda e reportar o status", ferramenta: "SNOW, E-mail, Espaços Google", responsavel: "GR — 2 semanas Jumbo HC (dailys Times Hypercare + AMS)" },
  { fase: "Hypercare", atividade: "Reportar incidentes críticos para serem registrados no diário de bordo", ferramenta: "SNOW, E-mail, Espaços Google", responsavel: "GR — 2 semanas Jumbo HC (dailys Times Hypercare + AMS)" },
  { fase: "Encerramento", atividade: "Complementar as informações de lições aprendidas na release", ferramenta: "Sharepoint de Gestão de Releases", responsavel: "GR + Líder + Envolvidos Projeto" },
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
          <SectionLabel>Processo de gestão de releases</SectionLabel>
          <p className="text-xs text-muted-foreground mb-3">
            Processo robusto e contínuo, validado na reunião de 16/06. Um macro-cronograma anual com
            milestones e janelas obrigatórias é publicado em agosto para o ano seguinte; cada projeto
            concilia o seu cronograma ao macro-cronograma (antecipações são aceitas, mas atrasos após a
            janela impedem a entrega). Os cronogramas dos projetos são oficializados no ServiceNow.
          </p>

          <div className="rounded-lg border border-dashed bg-muted/30 p-3 mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Entrada do processo</div>
              <p className="text-[13px] font-medium text-foreground m-0">
                Projeto aprovado no ServiceNow (SNOW) com elemento PEP
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 mb-0">
                Etapas iniciais: inscrição da demanda e aprovação de custos.
              </p>
            </div>
            <Tag tone="blue">Líder Demanda</Tag>
          </div>

          <SectionLabel>Atividades por fase</SectionLabel>
          <Card className="shadow-none">
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-44">Fase</TableHead>
                    <TableHead className="min-w-[240px]">Atividade</TableHead>
                    <TableHead className="w-40">Ferramenta</TableHead>
                    <TableHead className="w-52">Responsável / Time</TableHead>
                    <TableHead className="w-36">Obs.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PROCESS_STEPS.map((s, i) => {
                    const firstOfPhase = i === 0 || PROCESS_STEPS[i - 1].fase !== s.fase;
                    return (
                      <TableRow key={i}>
                        <TableCell className="align-top">
                          {firstOfPhase ? (
                            <Tag tone={PHASE_TONE[s.fase] ?? "gray"}>{s.fase}</Tag>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 pl-1">↳</span>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground align-top">{s.atividade}</TableCell>
                        <TableCell className="text-muted-foreground align-top">{s.ferramenta ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground align-top">{s.responsavel}</TableCell>
                        <TableCell className="align-top">
                          {s.obs ? (
                            <Tag tone="amber">{s.obs}</Tag>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Separator className="my-4" />
          <SectionLabel>Pontos-chave do processo (reunião 16/06)</SectionLabel>
          <div className="grid gap-2.5 md:grid-cols-2">
            <InfoCard title="Três reuniões de Go / No Go no cutover">
              <strong>1. Técnico (~06:00):</strong> equipes técnicas e fornecedores confirmam requests,
              validações e configurações para a retomada do SAP. <strong>2. Início dos testes de
              liberação:</strong> após o SAP no ar e os acessos liberados. <strong>3. Final da
              release:</strong> após a conclusão dos testes. Há ainda um Go / No Go ~1 semana antes
              (GEMUD) para decidir as demandas a implantar. Risco classificado em verde / amarelo / vermelho.
            </InfoCard>
            <InfoCard title="Testes e baseline de regressão">
              Registro e acompanhamento de todos os testes (unitário, integrado, regressão, UAT e
              liberação) no Jira, com SLA de atualização de status. Regressão mandatória na janela do
              macro-cronograma, com baseline fixo (~51 mil) executado pela Qualidade (equipe Carmona).
              UAT conduzido pelas áreas de negócio (ex.: fiscal).
            </InfoCard>
            <InfoCard title="Aprovação de custos">
              Foco nas horas de desenvolvimento no SAP. Validar as horas aprovadas com dados oficiais
              (ServiceNow / OS) para evitar subestimação no aceite do formulário.
            </InfoCard>
            <InfoCard title="Gestão de mudanças (GMUD)">
              Change Jumbo (guarda-chuva da release) sob a GMUD; changes filhas por demanda sob os
              líderes, encerradas com evidências antes do fechamento da Jumbo. Alinhar o processo de
              changes para o S/4 e unificar procedimentos entre ECC, S/4 e Duo.
            </InfoCard>
            <InfoCard title="Transporte e ambientes">
              Fluxo DEV → QA → PROD com BASIS / CCM (contato: Auro). Empacotar e encapsular o pacote
              após os testes em QA, sem alterações manuais; aprovar e executar em produção na mesma
              sequência testada.
            </InfoCard>
            <InfoCard title="Comunicação da release">
              Comunicado geral com todas as demandas duas semanas antes + Welcome Kit na sexta ao
              meio-dia anterior. Canais: e-mail, Espaços Google (geral e específico), intranet e
              mensagem no SAP (quarta anterior). Migração do "Zap" para canais internos do Google.
            </InfoCard>
            <InfoCard title="Hypercare (pós-go-live)">
              Suporte de 2 semanas para releases maiores, com daily às 17:00 entre líderes e operação
              (OMS) e diário de bordo de incidentes. Incidentes não bloqueantes seguem no ServiceNow.
            </InfoCard>
            <InfoCard title="Evidências">
              Coleta em tempo real durante o cutover (prints / logs), organizadas em diretórios
              separados (testes e execução) e anexadas às changes no ServiceNow — evitando coleta
              redundante pós-fato.
            </InfoCard>
          </div>

          <Separator className="my-4" />
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
