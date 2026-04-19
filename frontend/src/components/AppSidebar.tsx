import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  MessageSquare,
  Ticket,
  Settings,
  LayoutDashboard,
  ListChecks,
  ChevronUp,
} from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "./Logo";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const userNav = [
  { title: "User Dashboard", url: "/dashboard", icon: Home },
  { title: "Chatbot", url: "/chatbot", icon: MessageSquare },
  { title: "My Tickets", url: "/tickets", icon: Ticket },
  { title: "Profile & Settings", url: "/settings", icon: Settings },
];

const adminNav = [
  { title: "Admin Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "All Tickets", url: "/admin/tickets", icon: ListChecks },
  { title: "Profile & Settings", url: "/settings", icon: Settings },
];

interface AppSidebarProps {
  variant: "user" | "admin";
  user: { name: string; subtitle: string };
}

export function AppSidebar({ variant, user }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const path = location.pathname;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActive = (url: string) =>
    url === "/admin" ? path === "/admin" : path === url || path.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 py-5">
        {!collapsed ? (
          <Logo size="md" />
        ) : (
          <div className="flex justify-center">
            <Logo size="sm" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        {variant === "user" && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {userNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className="data-[active=true]:bg-brand-200/70 data-[active=true]:text-brand-700 data-[active=true]:font-semibold"
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {variant === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="data-[active=true]:bg-brand-200/70 data-[active=true]:text-brand-700 data-[active=true]:font-semibold"
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-xl p-2 hover:bg-muted outline-none transition-colors",
                collapsed && "justify-center p-1",
              )}
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-brand text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate text-sm font-semibold">{user.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{user.subtitle}</div>
                  </div>
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuItem 
              onClick={() => { 
                localStorage.removeItem("token"); 
                localStorage.removeItem("userId");
                window.location.replace("/"); 
              }}
              className="text-status-critical focus:text-status-critical-foreground focus:bg-status-critical cursor-pointer"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
