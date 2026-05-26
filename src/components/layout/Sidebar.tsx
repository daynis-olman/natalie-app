import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Flame, CalendarRange, ListChecks, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/heatmap", label: "Heatmap", icon: Flame },
  { to: "/timeline", label: "Timeline", icon: CalendarRange },
  { to: "/initiatives", label: "Initiatives", icon: ListChecks },
  { to: "/criteria", label: "Impact Criteria", icon: BookOpen },
] as const;

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accent to-accent/60 shadow-sm">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-[15px]">Natalie's Compass</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-accent" />
                )}
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">v1.0 · POC</p>
        </div>
      </aside>
    </>
  );
}
