import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useGetMe } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";

import HomePage from "@/pages/home";
import DashboardsPage from "@/pages/dashboards";
import PendingPage from "@/pages/auth/pending";
import DeniedPage from "@/pages/auth/denied";
import CenariosListPage from "@/pages/cenarios/list";
import CenariosFormPage from "@/pages/cenarios/form";
import CadastrosIndexPage from "@/pages/cadastros/index";
import CadastrosCrudPage from "@/pages/cadastros/crud";
import EscalaPage from "@/pages/escala/index";
import ContatosPage from "@/pages/contatos/index";
import UsuariosPage from "@/pages/usuarios/index";
import NotFound from "@/pages/not-found";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(145 65% 25%)",
    colorForeground: "hsl(160 30% 15%)",
    colorMutedForeground: "hsl(160 15% 45%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(120 15% 85%)",
    colorInputForeground: "hsl(160 30% 15%)",
    colorNeutral: "hsl(120 15% 85%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

const queryClient = new QueryClient();

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) return null; // AppShell handles global loading
  
  if (user?.status === "PENDENTE") return <PendingPage />;
  if (user?.status === "REJEITADO") return <DeniedPage />;
  
  if (adminOnly && user?.profile !== "ADMINISTRADOR") {
    return <Redirect to="/dashboards" />;
  }
  
  return <Component />;
}

function AuthenticatedApp() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/dashboards">
          <ProtectedRoute component={DashboardsPage} />
        </Route>
        <Route path="/cenarios">
          <ProtectedRoute component={CenariosListPage} />
        </Route>
        <Route path="/cenarios/novo">
          <ProtectedRoute component={CenariosFormPage} adminOnly />
        </Route>
        <Route path="/cenarios/:id/editar">
          <ProtectedRoute component={CenariosFormPage} adminOnly />
        </Route>
        <Route path="/cadastros">
          <ProtectedRoute component={CadastrosIndexPage} adminOnly />
        </Route>
        <Route path="/cadastros/:category">
          <ProtectedRoute component={CadastrosCrudPage} adminOnly />
        </Route>
        <Route path="/escala">
          <ProtectedRoute component={EscalaPage} />
        </Route>
        <Route path="/contatos">
          <ProtectedRoute component={ContatosPage} />
        </Route>
        <Route path="/usuarios">
          <ProtectedRoute component={UsuariosPage} adminOnly />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function AppRoutes() {
  return (
    <>
      <Show when="signed-in">
        <AuthenticatedApp />
      </Show>
      <Show when="signed-out">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route component={() => <Redirect to="/sign-in" />} />
        </Switch>
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      localization={{
        signIn: {
          start: {
            title: "Bem-vindo(a) ao SRI",
            subtitle: "Acesse sua conta para continuar",
          },
        },
        signUp: {
          start: {
            title: "Criar uma conta",
            subtitle: "Solicite acesso ao SRI",
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route component={AppRoutes} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
