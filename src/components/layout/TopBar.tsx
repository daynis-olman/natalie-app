import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Sun, Plus, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "@/context/AppState";
import { AddEditInitiativeDialog } from "@/components/initiatives/AddEditInitiativeDialog";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/heatmap": "Heatmap",
  "/timeline": "Timeline",
  "/initiatives": "Initiatives",
  "/criteria": "Impact Criteria",
};

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggleTheme, areaFilter, setAreaFilter, areas } = useAppState();
  const [addOpen, setAddOpen] = useState(false);

  const title = TITLES[pathname] ?? "Change Compass";

  return (
    <>
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-border">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <button onClick={onMenu} className="lg:hidden text-foreground/70 hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base sm:text-lg font-semibold tracking-tight">{title}</h1>
              {areaFilter !== "all" && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-xs font-medium">
                  <Filter className="h-3 w-3" />
                  {areaFilter}
                  <button onClick={() => setAreaFilter("all")} className="hover:opacity-70">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block w-48">
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All areas</SelectItem>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.name}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button onClick={() => setAddOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Initiative</span>
            </Button>
          </div>
        </div>
      </header>

      <AddEditInitiativeDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
