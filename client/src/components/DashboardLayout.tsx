import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/useMobile";
import { BriefcaseBusiness, Moon, PanelLeft, Sun, UserRound } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const menuItems = [
  { icon: BriefcaseBusiness, label: "Applications", path: "/" },
  { icon: UserRound, label: "Master profile", path: "/profile" },
];
const SIDEBAR_WIDTH_KEY = "job-studio-sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 210;
const MAX_WIDTH = 380;

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const nextLabel = theme === "light" ? "Switch to dark mode" : "Switch to light mode";
  return <button onClick={toggleTheme} aria-label={nextLabel} title={nextLabel} className={`group flex items-center gap-2 rounded-xl border border-border bg-card/70 p-2 text-muted-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:text-foreground ${compact ? "h-9 w-9 justify-center" : "w-full"}`}><span className="relative flex h-5 w-5 items-center justify-center"><Sun className={`absolute h-4 w-4 transition-all ${theme === "light" ? "scale-100 opacity-100" : "scale-75 opacity-0"}`} /><Moon className={`absolute h-4 w-4 transition-all ${theme === "dark" ? "scale-100 opacity-100" : "scale-75 opacity-0"}`} /></span>{!compact && <span className="text-sm font-medium">{theme === "light" ? "Daylight desk" : "After-hours desk"}</span>}</button>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || DEFAULT_WIDTH);
  useEffect(() => localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth)), [sidebarWidth]);
  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent></SidebarProvider>;
}

function DashboardLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (width: number) => void }) {
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const activeItem = menuItems.find(item => item.path === location) ?? (location.startsWith("/jobs/") ? menuItems[0] : undefined);

  useEffect(() => {
    const move = (event: MouseEvent) => { if (!isResizing) return; const next = event.clientX - (sidebarRef.current?.getBoundingClientRect().left ?? 0); if (next >= MIN_WIDTH && next <= MAX_WIDTH) setSidebarWidth(next); };
    const up = () => setIsResizing(false);
    if (isResizing) { document.addEventListener("mousemove", move); document.addEventListener("mouseup", up); document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; }
    return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); document.body.style.cursor = ""; document.body.style.userSelect = ""; };
  }, [isResizing, setSidebarWidth]);

  return <><div className="relative" ref={sidebarRef}><Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar/95"><SidebarHeader className="h-24 px-3 py-4"><div className="flex items-center gap-2"><button onClick={toggleSidebar} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-sidebar-accent focus-visible:ring-2"><PanelLeft className="h-4 w-4" /></button>{!isCollapsed && <><div className="studio-mark" aria-hidden="true">JA</div><div className="min-w-0"><p className="data-label text-primary">Job automation</p><p className="editorial-title truncate text-lg leading-5">Studio</p></div></>}</div></SidebarHeader><SidebarContent className="px-2"><SidebarMenu className="gap-1">{menuItems.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={activeItem?.path === item.path} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-11 rounded-xl px-3 font-medium"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter className="space-y-3 p-3"><ThemeToggle compact={isCollapsed} />{!isCollapsed && <p className="px-1 text-xs leading-5 text-muted-foreground">A private desk for considered applications.</p>}</SidebarFooter></Sidebar><div className={`absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/20 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => setIsResizing(true)} /></div><SidebarInset className="bg-background"><>{isMobile && <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur"><div className="flex items-center gap-3"><SidebarTrigger className="rounded-xl" /><div><p className="data-label text-primary">Job Automation</p><p className="text-sm font-semibold">{activeItem?.label ?? "Workspace"}</p></div></div><ThemeToggle compact /></header>}<main className="min-h-screen p-4 sm:p-7 lg:p-9">{children}</main></></SidebarInset></>;
}
