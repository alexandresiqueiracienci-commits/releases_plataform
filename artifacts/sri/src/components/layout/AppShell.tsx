import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { useGetMe } from "@workspace/api-client-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Home, 
  BarChart2, 
  ListTodo, 
  Database, 
  CalendarClock, 
  Contact, 
  Users, 
  FileText,
  LogOut 
} from "lucide-react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [location, setLocation] = useLocation();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const { data: dbUser, isLoading: isLoadingUser } = useGetMe();

  const handleLogout = () => {
    signOut({ redirectUrl: import.meta.env.BASE_URL || "/" });
  };

  const isAdmin = dbUser?.profile === "ADMINISTRADOR";
  const isApproved = dbUser?.status === "APROVADO";

  if (isLoadingUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  // Se o usuário não estiver aprovado, não renderizamos a sidebar completa,
  // mas o layout root ainda pode envolver as páginas Pending/Denied.
  if (!isApproved) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Natura SRI" className="h-8" />
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          {children}
        </main>
      </div>
    );
  }

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: BarChart2, label: "Dashboards", href: "/dashboards" },
    { icon: ListTodo, label: "Cenários", href: "/cenarios" },
    { icon: CalendarClock, label: "Escala", href: "/escala" },
    { icon: Contact, label: "Contatos", href: "/contatos" },
  ];

  if (isAdmin) {
    navItems.push({ icon: Database, label: "Cadastros", href: "/cadastros" });
    navItems.push({ icon: Users, label: "Usuários", href: "/usuarios" });
  }

  const docItems = [
    { icon: FileText, label: "Governança Releases", href: "/governanca" },
  ];

  const isItemActive = (href: string) =>
    location === href || (href !== "/" && location.startsWith(href));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="p-4 border-b border-sidebar-border/50">
            <Link href="/" className="flex items-center gap-3">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Natura" className="h-8" />
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    isActive={isItemActive(item.href)}
                    onClick={() => setLocation(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <SidebarGroup>
              <SidebarGroupLabel>Documentações</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {docItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isItemActive(item.href)}
                        onClick={() => setLocation(item.href)}
                        tooltip={item.label}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold shrink-0">
                  {clerkUser?.firstName?.[0] || "U"}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium text-sidebar-foreground truncate">
                    {clerkUser?.fullName || clerkUser?.primaryEmailAddress?.emailAddress}
                  </span>
                  <span className="text-xs text-sidebar-foreground/60 truncate">
                    {dbUser?.profile}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-auto p-4 md:p-8">
            <div className="mx-auto max-w-7xl w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
