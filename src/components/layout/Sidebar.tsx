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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/heatmap", label: "Heatmap", icon: Flame },
  { to: "/timeline", label: "Timeline", icon: CalendarRange },
  { to: "/initiatives", label: "Initiatives", icon: ListChecks },
  { to: "/resources", label: "Resources", icon: Users },
  { to: "/criteria", label: "Impact Criteria", icon: BookOpen },
] as const;

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
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
      />
      <aside
        data-collapsed={collapsed}
        className={cn(
          "group/sidebar fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width,transform] duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto",
          collapsed ? "w-[68px]" : "w-60",
          mobileOpen ? "translate-x-0 w-60" : "-translate-x-full",
        )}
      >
        {/* Header / Brand */}
        <div className={cn("flex h-14 items-center px-3", collapsed ? "justify-center" : "justify-between pl-4 pr-2")}>
          <Link to="/" className="flex items-center gap-2.5 min-w-0" onClick={onCloseMobile}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/60 shadow-[0_4px_12px_-2px_color-mix(in_oklab,var(--accent)_45%,transparent)]">
              <Flame className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <span className="truncate font-semibold tracking-tight text-[15px]">Natalie's Compass</span>
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

        {/* Nav */}
        <nav className={cn("flex-1 py-3 space-y-0.5", collapsed ? "px-2" : "px-3")}>
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            const link = (
              <Link
                key={to}
                to={to}
                onClick={onCloseMobile}
                className={cn(
                  "group relative flex items-center rounded-lg text-sm transition-all",
                  collapsed ? "h-10 w-10 justify-center mx-auto" : "gap-3 px-3 py-2",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                {active && (
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-accent",
                      collapsed && "h-6",
                    )}
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" />
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

        {/* Footer / Collapse toggle */}
        <div
          className={cn(
            "border-t border-sidebar-border px-2 py-2.5 hidden lg:flex",
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
        {/* Mobile footer */}
        <div className="lg:hidden px-5 py-4 border-t border-sidebar-border">
          <p className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">v1.0 · POC</p>
        </div>
      </aside>
    </TooltipProvider>
  );
}
