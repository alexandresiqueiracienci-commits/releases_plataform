import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/react";

export default function PendingPage() {
  const { user } = useUser();
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Aguardando Aprovação</CardTitle>
          <CardDescription>Seu acesso está em análise</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Olá, <strong>{user?.fullName || user?.primaryEmailAddress?.emailAddress}</strong>.
          </p>
          <p className="text-sm text-muted-foreground">
            Sua solicitação de acesso foi enviada aos administradores do sistema. Você receberá uma notificação quando seu perfil for aprovado.
          </p>
          <p className="text-sm text-muted-foreground">
            Por favor, aguarde ou entre em contato com a equipe de suporte se precisar de acesso imediato.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
