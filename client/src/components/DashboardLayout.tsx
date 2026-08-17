import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { BriefcaseBusiness, LogOut, PanelLeft, UserRound } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const menuItems = [
  { icon: BriefcaseBusiness, label: "Applications", path: "/" },
  { icon: UserRound, label: "Master profile", path: "/profile" },
];
const SIDEBAR_WIDTH_KEY = "job-studio-sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 210;
const MAX_WIDTH = 380;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || DEFAULT_WIDTH);
  const { loading, user } = useAuth();
  useEffect(() => localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth)), [sidebarWidth]);
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) {
    return <div className="soft-grid flex min-h-screen items-center justify-center p-5"><div className="paper-panel w-full max-w-md rounded-[1.5rem] border p-9 text-center"><p className="data-label text-primary">Private workspace</p><h1 className="editorial-title mt-3 text-4xl">Application work, considered.</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">Sign in to access your private resume, drafts, and application pipeline.</p><Button onClick={() => startLogin()} size="lg" className="mt-8 w-full">Sign in</Button></div></div>;
  }
  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent></SidebarProvider>;
}

function DashboardLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (width: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const activeItem = menuItems.find(item => item.path === location) ?? (location.startsWith("/jobs/") ? menuItems[0] : undefined);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!isResizing) return;
      const next = event.clientX - (sidebarRef.current?.getBoundingClientRect().left ?? 0);
      if (next >= MIN_WIDTH && next <= MAX_WIDTH) setSidebarWidth(next);
    };
    const up = () => setIsResizing(false);
    if (isResizing) { document.addEventListener("mousemove", move); document.addEventListener("mouseup", up); document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; }
    return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); document.body.style.cursor = ""; document.body.style.userSelect = ""; };
  }, [isResizing, setSidebarWidth]);

  return <><div className="relative" ref={sidebarRef}><Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar/95"><SidebarHeader className="h-20 px-3 py-4"><div className="flex items-center gap-3"><button onClick={toggleSidebar} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-sidebar-accent focus-visible:ring-2"><PanelLeft className="h-4 w-4" /></button>{!isCollapsed && <div className="min-w-0"><p className="data-label text-primary">Job Automation</p><p className="truncate text-sm font-semibold tracking-tight">Studio</p></div>}</div></SidebarHeader><SidebarContent className="px-2"><SidebarMenu className="gap-1">{menuItems.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={activeItem?.path === item.path} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-11 rounded-xl px-3 font-medium"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter className="p-3"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:ring-2"><Avatar className="h-8 w-8 border border-sidebar-border"><AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback></Avatar>{!isCollapsed && <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user?.name || "Private account"}</p><p className="truncate text-xs text-muted-foreground">{user?.email || ""}</p></div>}</button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter></Sidebar><div className={`absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/20 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => setIsResizing(true)} /></div><SidebarInset className="bg-background"><>{isMobile && <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur"><SidebarTrigger className="rounded-xl" /><div><p className="data-label text-primary">Job Automation</p><p className="text-sm font-semibold">{activeItem?.label ?? "Workspace"}</p></div></header>}<main className="min-h-screen p-4 sm:p-7 lg:p-9">{children}</main></></SidebarInset></>;
}
