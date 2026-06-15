import { useUser } from "@clerk/react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, LayoutDashboard, ListTodo, Users, Contact } from "lucide-react";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const pdfUrl = `${import.meta.env.BASE_URL}plano-macro-cutover.pdf`;

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Release Go Live Control</h1>
          <p className="text-muted-foreground mt-1">Acompanhamento e controle da implantação SAP S/4 e ECC</p>
        </div>
        {!isSignedIn && (
          <div className="flex gap-4">
            <Link href="/sign-in" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              Entrar
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
      </div>

      <Card className="flex flex-col h-[600px] shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Jun_26 Plano Macro Cutover
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 relative border-t">
          {/* Fallback for when iframe fails or document doesn't exist */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-muted/20 z-0">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Plano Macro Cutover</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              O PDF do Plano Macro Cutover será disponibilizado em breve. Quando estiver disponível, ele será exibido automaticamente aqui.
            </p>
          </div>
          {/* Iframe sits on top, if it loads a 404 it might show browser error, but typically we'd detect. For now simple overlay */}
          <iframe 
            src={pdfUrl} 
            className="w-full h-full relative z-10 bg-transparent"
            title="Plano Macro Cutover"
            onError={(e) => {
              (e.target as HTMLIFrameElement).style.display = 'none';
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
