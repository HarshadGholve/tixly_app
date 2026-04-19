import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface AppShellProps {
  variant: "user" | "admin";
  user: { name: string; subtitle: string };
  children: ReactNode;
}

export function AppShell({ variant, user, children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-gradient-soft">
        <AppSidebar variant={variant} user={user} />
        <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
          <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-border/60 bg-background/70 px-3 backdrop-blur md:hidden">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
