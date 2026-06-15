import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/react";
import { LogOut } from "lucide-react";

export default function DeniedPage() {
  const { signOut } = useClerk();
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">Acesso Negado</CardTitle>
          <CardDescription>Sua solicitação foi rejeitada</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-sm text-muted-foreground">
            Infelizmente, seu acesso ao sistema SRI - Release Go Live Control não foi autorizado pelos administradores.
          </p>
          <Button variant="outline" className="w-full" onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL || "/" })}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair e tentar outra conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
