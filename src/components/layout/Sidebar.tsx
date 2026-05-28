import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Flame,
  CalendarRange,
  ListChecks,
  BookOpen,
  Users,
  X,
  ChevronsLeft,
  ChevronsRight,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/heatmap", label: "Heatmap", icon: Flame },
  { to: "/timeline", label: "Timeline", icon: CalendarRange },
  { to: "/initiatives", label: "Initiatives", icon: ListChecks },
  { to: "/resources", label: "Resources", icon: Users },
  { to: "/criteria", label: "Impact Criteria", icon: BookOpen },
] as const;

const USER = { name: "Daynis Olman", email: "daynis.olman@company.com", initials: "DO" };

type Props = {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function Sidebar({ mobileOpen, onCloseMobile, collapsed, onToggleCollapsed }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <TooltipProvider delayDuration={120}>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
      />
      <aside
        data-collapsed={collapsed}
        style={{
          backgroundImage:
            "radial-gradient(120% 60% at 50% -10%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 60%), linear-gradient(180deg, color-mix(in oklab, var(--sidebar) 92%, white 4%) 0%, var(--sidebar) 45%, color-mix(in oklab, var(--sidebar) 88%, black 8%) 100%)",
          boxShadow:
            "inset -1px 0 0 0 color-mix(in oklab, white 6%, transparent), 8px 0 24px -12px rgba(0,0,0,0.45), 2px 0 8px -4px rgba(0,0,0,0.25)",
        }}
        className={cn(
          "group/sidebar fixed inset-y-0 left-0 z-50 flex flex-col text-sidebar-foreground border-r border-sidebar-border/70 transition-[width,transform] duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto",
          collapsed ? "w-[68px]" : "w-60",
          mobileOpen ? "translate-x-0 w-60" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className={cn("flex h-14 shrink-0 items-center border-b border-white/[0.06] px-3", collapsed ? "justify-center" : "justify-between pl-4 pr-2")}>
          <Link to="/" className="flex items-center gap-2.5 min-w-0" onClick={onCloseMobile}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/60 shadow-[0_6px_16px_-4px_color-mix(in_oklab,var(--accent)_55%,transparent),inset_0_1px_0_0_color-mix(in_oklab,white_30%,transparent)] ring-1 ring-white/10">
              <Flame className="h-4 w-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]" />
            </div>
            {!collapsed && (
              <span className="truncate font-semibold tracking-tight text-[15px] [text-shadow:0_1px_0_rgba(0,0,0,0.25)]">Natalie's Compass</span>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden rounded-md p-1.5 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav (scrollable middle) */}
        <nav className={cn("flex-1 overflow-y-auto py-3 space-y-0.5", collapsed ? "px-2" : "px-3")}>
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            const link = (
              <Link
                key={to}
                to={to}
                onClick={onCloseMobile}
                className={cn(
                  "group relative flex items-center rounded-lg text-sm transition-all duration-200",
                  collapsed ? "h-10 w-10 justify-center mx-auto" : "gap-3 px-3 py-2",
                  active
                    ? "bg-gradient-to-b from-white/[0.10] to-white/[0.04] text-sidebar-accent-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_12px_-4px_rgba(0,0,0,0.4)] ring-1 ring-white/10"
                    : "text-sidebar-foreground/70 hover:bg-white/[0.05] hover:text-sidebar-foreground hover:ring-1 hover:ring-white/[0.06]",
                )}
              >
                {active && (
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 rounded-r bg-accent shadow-[0_0_12px_2px_color-mix(in_oklab,var(--accent)_60%,transparent)]",
                      collapsed ? "h-6 w-[3px]" : "h-5 w-[3px]",
                    )}
                  />
                )}
                <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active && "text-accent")} />
                {!collapsed && <span className="font-medium truncate">{label}</span>}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={to}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {label}
                </TooltipContent>
              </Tooltip>
            ) : (
              link
            );
          })}
        </nav>

        {/* Bottom pinned: account + collapse toggle */}
        <div className="mt-auto shrink-0 border-t border-white/[0.06] bg-gradient-to-b from-black/10 to-black/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className={cn("p-2", collapsed && "flex justify-center")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center rounded-lg text-left transition-all hover:bg-white/[0.06] hover:ring-1 hover:ring-white/[0.08] focus:outline-none focus:ring-2 focus:ring-accent/40",
                    collapsed ? "h-10 w-10 justify-center" : "w-full gap-2.5 px-2 py-2",
                  )}
                  aria-label="Account menu"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/60 text-white text-xs font-semibold shadow-[0_4px_10px_-2px_color-mix(in_oklab,var(--accent)_55%,transparent),inset_0_1px_0_0_rgba(255,255,255,0.25)] ring-1 ring-white/10">
                    {USER.initials}
                  </div>
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-sidebar-foreground">{USER.name}</p>
                      <p className="truncate text-[11px] text-sidebar-foreground/60">{USER.email}</p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium">{USER.name}</div>
                  <div className="text-xs text-muted-foreground font-normal">{USER.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account" onClick={onCloseMobile} className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    View profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div
            className={cn(
              "hidden lg:flex border-t border-white/[0.05] px-2 py-2",
              collapsed ? "justify-center" : "justify-between items-center px-3",
            )}
          >
            {!collapsed && (
              <p className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">v1.0 · POC</p>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleCollapsed}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className="rounded-md p-1.5 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
                >
                  {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{collapsed ? "Expand" : "Collapse"}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
