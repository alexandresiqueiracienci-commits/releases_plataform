# 06-16 Reunião Semanal: Governança de Release SAP, Testes, Cutover e Comunicação

Data: 16 de junho de 2026
Local: [Inserir Local]
Participantes: [Speaker 1] [Speaker 2]
Notas da Reunião
Gestão de Release: Processo, Escopo e Cronograma
- Processos atuais de release são robustos; objetivo é validar entendimento das atividades e ajustar onde necessário.
- Macro-cronograma anual com milestones e janelas obrigatórias é disponibilizado em agosto para o ano seguinte; projetos devem conciliar seus planos ao macro-cronograma (antecipações aceitas; atrasos após janela impedem entrega).
- Cronogramas dos projetos (Project, PPT, timeline) serão oficializados no ServiceNow/Servicenal e comparados com o macro-cronograma; negociação ocorre quando houver grandes desvios.
- Planilha de detalhes e impactos por demanda (colunas): incluir campos Value Stream (O2C, P2P etc.) e Iniciativa (projeto).
- Líder da demanda identifica processos impactados (diretos/indiretos, NBSI) e deltas de TI (integrações, extensões, automações, relatórios, similar ao RISCFW).
- Ferramentas de apoio ao mapeamento: Signavio e LeanIX; entrada do processo requer projeto aprovado no ServiceNow com PEP; etapas iniciais: inscrição da demanda e aprovação de custos.
- Aprovação de custos: hoje o solicitante “aceita” o custo via formulário com tamanho (M, G etc.), com risco de subestimação; sugestão de validar horas aprovadas (SAP) com dados oficiais (ServiceNow/OS). Foco do custo nas horas de desenvolvimento no SAP.
Testes, Qualidade e Reporting
- A equipe de release acompanha testes integrados; definição de cenários é do projeto. Exigência de registro e acompanhamento de testes (unitário, integrado, regressão, UAT, liberação/Go Live) no Jira para reporting por demanda, release e ano (horas, quantidade de testes, problemas e impacto operacional).
- Problemas recorrentes: atrasos na subida de informações e status inconsistentes; necessidade de SLA para atualização de status no Jira.
- Regressão: mandatória na janela do macro-cronograma, com baseline fixo (“51 mil” citado); execução pela equipe de Qualidade (Vivi, equipe do Rodolfo Carmona); acompanhamento de métricas (planejado vs. executado, erros críticos, ações como horas extras/ciclo 2) com reporting em slides (ex.: quartas-feiras).
- UAT: conduzido pelas áreas de negócio (ex.: fiscal, equipe da Viviane Evangelista quando há impacto fiscal); demais áreas definem/pagam.
- Validação de cenários: pontos focais/key users (CDs, Hub, Fábrica) validam; baseline pode ser ampliado por cenários customizados dos líderes de demanda.
Cutover, Go/No-Go e Evidências
- Estrutura de três go-no-go durante o cutover: 1) técnico para retomada do SAP (por volta das 6:00, valida transporte e configurações), 2) início dos testes de liberação após o SAP no ar e acessos liberados, 3) final da release após conclusão dos testes. Além disso, há a sessão de go/no-go uma semana antes (na GEMUD) para decidir demandas a implantar.
- Localização do “Cutover, go-no-go técnico” na planilha (coluna B, antes dos testes de liberação); descrição: “ok” das equipes técnicas e fornecedores confirmando requests, validações e configurações.
- Evidências coletadas em tempo real durante o cutover (prints/logs), organizadas em diretórios separados (testes e execução) e anexadas nas changes no ServiceNow/Servicenal; remover itens redundantes de “coletar evidências” pós-fato.
- Atualização de ferramentas e documentação deve ocorrer imediatamente após testes; parte permanece vinculada à change para aprovação da gestão de mudanças.
- Suporte pós-go-live (Hypercare) por 2 semanas para releases maiores: daily às 17:00 com líderes e operação (OMS), diário de bordo com incidentes; incidentes não bloqueantes seguem no ServiceNow durante e após implantação.
- Gestão de risco no go-no-go final: classificação “verde/amarelo/vermelho”; “amarelo” mobiliza áreas críticas (ex.: fiscal em fechamento); contingências podem demandar trabalho madrugada; rollback não observado até hoje.
Gestão de Mudanças (GMood) e Changes
- GMUD (Gestão de Mudanças) acompanha plano geral de cutover e changes por fornecedor (Accenture, ZEC, Advisor); existe “Change Jumbo” guarda-chuva para a release, com changes filhas por demanda.
- Durante a janela da release, “changes informativas” podem ser aplicadas para correções urgentes conforme template acordado; encerramento das changes filhas com evidências antes do fechamento da Jumbo.
- Responsabilidades: Change Jumbo sob GMood; changes filhas sob líderes de demanda (garantir atividades e evidências completas).
- Alinhar com a governança (Ju Barbão) o processo de changes para S4 e unificar procedimentos entre ECC, S4 e Duo; equipe de release participa dos CABs defendendo changes e janelas.
Transporte e Ambientes
- Processo DEV → QA e QA → Produção com BASIS/CCM; pacotes em DEV devem ser fechados e aceitos; Auro é ponto de contato em BASIS.
- Proposta de padronizar o empacotamento: fechar e encapsular o pacote após testes em QA (sem alterações manuais), aprovar e executar em produção na sequência testada, evitando falhas (ex.: triggers do Arcosoft).
Comunicação e Logística
- Comunicação da release: dois e-mails principais — comunicado geral com todas as demandas (duas semanas antes) e Welcome Kit (sexta ao meio-dia antes da implantação); outros canais: espaços do Google (geral e específico), intranet (uso reduzido), mensagens no SAP (quarta anterior). Necessidade de revisar a estratégia para maior eficácia.
- Status e canais: migrar de “Zap” para canais internos do Google (geral de releases SAP e específico técnico por release); comitê recebe resumos diários com pontos de atenção e incidentes.
- Estrutura física para implantações presenciais: anteriormente sob gestão da release; hoje compartilhada. Se presencial for exigido, a própria demanda arca custos e organiza. Necessário definir formalmente o responsável pela logística.
- Lições aprendidas: coleta por release e compilado anual; proposta de site permanente para S/4, ECC e manutenções programadas com seções de pré/pós-implantação, boletins e lições aprendidas.
Plataforma de Governança de Release
- Proposta de plataforma além de um site, com governança para controlar processos, ambientes não produtivos e apontamentos; seções para estratégias de teste, ferramental (SOMEM, SIGNAV), rituais, entregáveis e riscos.
- Dashboards para status de testes (ex.: total, finalizados, cancelados, em andamento); cadastro de cenários de baseline integrados ao Jira; autenticação via Google (Natura/Gmail) com controle de perfis.
- Upload de evidências diretamente na plataforma, com carregamento automático no Jira, potencialmente reduzindo necessidade de múltiplas licenças via uma licença central.
- Automação: script (Apps Script) que lê e-mails (releases.td e Alexandre) e organiza evidências (prints, notas fiscais) por cenário (ex.: FBLK21) em diretórios; próxima etapa é subir evidências organizadas para os cenários no Jira.
- Visão de longo prazo: plataforma única para administrar a release de ponta a ponta; ideia bem recebida, a ser avaliada quanto à viabilidade e passos futuros.
Próximos Passos
- [ ] [Speaker 2] continuar o mapeamento passo a passo do processo, com entradas/saídas de cada etapa.
- [ ] Obter acesso à ferramenta Calm para [Speaker 1] e [Speaker 2].
- [ ] Disponibilizar em agosto o calendário e macro-cronograma de releases do próximo ano.
- [ ] Consolidar cronogramas dos projetos no ServiceNow/Servicenal como referência oficial.
- [ ] Garantir registro de todos os cenários e resultados de testes no Jira; formalizar SLA de atualização.
- [ ] Reportar semanalmente métricas de regressão nos slides de status.
- [ ] Alinhar com BASIS (Auro) o processo de transporte DEV → QA e QA → Produção, definindo critérios de aceite e empacotamento.
- [ ] Definir e comunicar baseline de regressão vigente e janela obrigatória por release; documentar origem e atualização do baseline “51 mil”.
- [ ] Confirmar responsáveis e recursos para UAT nas frentes fiscais e demais áreas.
- [ ] Unificar o planejamento do cutover detalhado no ServiceNow; criar baseline e controlar alterações com aprovação formal.
- [ ] Agendar reunião com Ju Barbão para definir o processo de changes para S4 e unificar procedimentos (ECC, S4, Duo).
- [ ] Incluir [Speaker 2] nas reuniões de status de quarta e no espaço de gestão de mudança.
- [ ] Formalizar três calls de go-no-go (técnico ~06:00, início dos testes, final da release) no calendário.
- [ ] Organizar diretórios de evidências (testes e execução) e instruir equipes a salvar em tempo real; anexar nas changes.
- [ ] Definir e ativar canais internos (geral e específico da release) para comunicação de status; revisar a estratégia de comunicação (conteúdo, público, cadência).
- [ ] Estabelecer rotina de Hypercare (daily 17:00 por 2 semanas) e envio de status ao comitê; plano de contingência para status “amarelo”.
- [ ] Definir formalmente o responsável pela logística de releases presenciais.
- [ ] Detalhar e padronizar o processo de empacotamento e transporte de pacotes para produção; discutir com Auro.
- [ ] Planejar coleta e publicação de lições aprendidas por release e compilação anual em site permanente; definir governança do site.
- [ ] Subir evidências organizadas pelo script para cenários no Jira; avaliar viabilidade e roadmap da plataforma de governança.
- [ ] [Inserir mais]
Sugestões da IA
- Formalizar o processo de aprovação de custos e método de validação de horas SAP com dados oficiais (ServiceNow/OS) para evitar subestimação.
- Finalizar, compartilhar e validar o novo fluxo de processo com todas as partes interessadas.
- Instituir SLA para atualização de status de testes no Jira e padronizar reporting.
- Documentar critérios de aderência entre cronograma do projeto e macro-cronograma (tolerâncias/exceções).
- Especificar e governar o baseline de regressão (“51 mil”): escopo, origem, periodicidade de atualização.
- Padronizar o fluxo de transporte com BASIS/CCM (gatilhos de aceite, checklists, validações pós-transporte).
- Definir governança entre fábrica de testes, qualidade e times de projeto (quem reporta o quê) com responsabilidades claras.
- Definir processo de changes para S4 com governança (Ju Barbão) e unificar procedimentos entre ECC/S4/Duo.
- Formalizar responsabilidades pela logística de implantações presenciais.
- Detalhar o processo e a responsabilidade de empacotamento de pacotes para produção.
- Estruturar plano de ação para revisar a comunicação das releases (canais, cronograma, conteúdo).
- Padronizar horários/convites das três reuniões de go-no-go (principalmente o técnico às 06:00).
- Definir processo para consolidação automática de evidências (evitar colagem manual), integrando plataforma/Apps Script/Jira.
- Documentar decisão sobre canais internos que substituirão o “Zap” (estrutura, público, governança).
- Estabelecer critérios objetivos para status “verde/amarelo/vermelho” no go-no-go final.
- Definir proprietários, cronograma e próximos passos para avaliação/desenvolvimento da plataforma de governança.