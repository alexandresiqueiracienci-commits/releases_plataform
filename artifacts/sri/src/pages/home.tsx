import { useUser } from "@clerk/react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, ListTodo, Users, Contact, FileText, ChevronRight } from "lucide-react";

const heroUrl = `${import.meta.env.BASE_URL}hero-releases.png`;

export default function HomePage() {
  const { isSignedIn } = useUser();

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto p-4 md:p-8">
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
        <img
          src={heroUrl}
          alt="Gestão de releases SAP S/4HANA, SAP ECC e Manutenções Programadas"
          className="absolute inset-0 h-full w-full object-cover object-right opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="relative flex flex-col gap-4 p-6 md:p-10 max-w-2xl">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">Release Go Live Control</h1>
            <p className="text-muted-foreground mt-2 text-base">
              Central de gestão de releases SAP S/4HANA, SAP ECC e Manutenções Programadas
            </p>
          </div>
          {!isSignedIn && (
            <div>
              <Link href="/sign-in" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2">
                Entrar
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboards">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Dashboards</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Visão consolidada do progresso</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/cenarios">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Cenários</CardTitle>
              <ListTodo className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Listagem e execução de testes</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/escala">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Escala</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Plantões e alocação de equipe</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/contatos">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Contatos</CardTitle>
              <Contact className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Diretório de contatos úteis</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/governanca">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Governança Releases</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Mapa estratégico e documentações</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            Ciclo de vida de uma release maior
          </CardTitle>
          <p className="text-sm text-muted-foreground">Fluxo macro do processo de governança de releases SAP</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-2">
            {RELEASE_LIFECYCLE.map((step, i) => (
              <div key={step.num} className="flex flex-col lg:flex-row lg:items-stretch flex-1 min-w-0">
                <div className="flex flex-1 items-start gap-3 rounded-lg border bg-muted/30 p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {step.num}
                  </div>
                  <span className="text-sm font-medium leading-snug text-foreground">{step.title}</span>
                </div>
                {i < RELEASE_LIFECYCLE.length - 1 && (
                  <div className="flex items-center justify-center py-1 lg:px-1 lg:py-0">
                    <ChevronRight className="h-5 w-5 rotate-90 text-muted-foreground/50 lg:rotate-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const RELEASE_LIFECYCLE = [
  { num: 1, title: "Abertura de demanda" },
  { num: 2, title: "Análise de impacto e deltas" },
  { num: 3, title: "Desenvolvimento concorrente" },
  { num: 4, title: "Testes de liberação (TDR)" },
  { num: 5, title: "Conformidade documental" },
  { num: 6, title: "Go live e suporte" },
];
