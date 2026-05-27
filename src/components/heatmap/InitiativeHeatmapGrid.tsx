import { useState, useMemo } from "react";
import { useAppState } from "@/context/AppState";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HeatmapCell } from "./HeatmapCell";
import { ImpactBadge } from "./ImpactBadge";
import { getImpactColour, formatDate, maxImpact, getCumulativeColour, ratingFromScore } from "@/lib/heatmapUtils";
import type { Initiative } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RTooltip } from "recharts";
import { cn } from "@/lib/utils";
import { Pencil, ArrowUpDown } from "lucide-react";
import { AddEditInitiativeDialog } from "@/components/initiatives/AddEditInitiativeDialog";

type SortKey = "date" | "name" | "impact";

function StatusBadge({ status }: { status: Initiative["status"] }) {
  const map = {
    "in-flight": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    planned: "bg-muted text-muted-foreground",
    completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  } as const;
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", map[status])}>
      {status.replace("-", " ")}
    </span>
  );
}

export function InitiativeHeatmapGrid() {
  const { initiatives, displayUnits, viewLevel, setViewLevel, scoreFor, people } = useAppState();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Initiative | null>(null);
  const [editing, setEditing] = useState<Initiative | null>(null);

  const filtered = useMemo(() => {
    let list = initiatives;
    if (statusFilter !== "all") list = list.filter((i) => i.status === statusFilter);
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.goLiveDate.localeCompare(b.goLiveDate);
      else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else cmp = maxImpact(a) - maxImpact(b);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [initiatives, statusFilter, sortKey, sortDir]);

  const totals = displayUnits.map((u) =>
    filtered.reduce((sum, i) => sum + scoreFor(i, u.id), 0),
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(viewLevel)} onValueChange={(v) => setViewLevel(Number(v) as 1 | 2 | 3)}>
          <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">View: Business Units</SelectItem>
            <SelectItem value="2">View: Functions</SelectItem>
            <SelectItem value="3">View: Sub-functions</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in-flight">In-Flight</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort: Go-Live Date</SelectItem>
            <SelectItem value="name">Sort: Initiative Name</SelectItem>
            <SelectItem value="impact">Sort: Impact Level</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="sticky left-0 z-10 bg-primary text-left px-4 py-3 font-medium w-[220px]">Initiative</th>
              <th className="text-left px-3 py-3 font-medium w-[110px]">Go-Live</th>
              <th className="text-left px-3 py-3 font-medium w-[100px]">Status</th>
              {displayUnits.map((u) => (
                <th key={u.id} className="px-2 py-3 font-medium text-center min-w-[96px]">
                  <div className="text-xs leading-tight">{u.name}</div>
                  <div className="text-[10px] opacity-70">L{u.level}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((init, idx) => (
              <tr
                key={init.id}
                onClick={() => setSelected(init)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-accent/5",
                  idx % 2 === 1 && "bg-muted/30",
                )}
              >
                <td className="sticky left-0 z-[1] bg-inherit px-4 py-3 border-t border-border">
                  <div className="font-medium text-foreground">{init.name}</div>
                  <div className="text-xs text-muted-foreground">{init.owner}</div>
                </td>
                <td className="px-3 py-3 border-t border-border whitespace-nowrap text-muted-foreground">{formatDate(init.goLiveDate)}</td>
                <td className="px-3 py-3 border-t border-border"><StatusBadge status={init.status} /></td>
                {displayUnits.map((u) => {
                  const score = scoreFor(init, u.id);
                  return (
                    <td key={u.id} className="px-2 py-3 border-t border-border text-center">
                      <HeatmapCell rating={ratingFromScore(score)} display={score || 0} area={u.name} />
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Footer cumulative */}
            <tr className="bg-muted/60">
              <td className="sticky left-0 z-[1] bg-muted/60 px-4 py-3 border-t border-border font-semibold text-xs uppercase tracking-wide text-muted-foreground">Cumulative</td>
              <td className="border-t border-border" />
              <td className="border-t border-border" />
              {displayUnits.map((u, i) => {
                const c = getCumulativeColour(totals[i]);
                return (
                  <td key={u.id} className="px-2 py-3 border-t border-border text-center">
                    <div className={cn("mx-auto inline-flex h-8 min-w-[36px] items-center justify-center rounded-md px-2 text-sm font-semibold", c.bg, c.text)}>
                      {totals[i]}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground uppercase tracking-wide text-[11px] mr-2">Legend</span>
        {[0, 1, 2, 3].map((r) => (
          <ImpactBadge key={r} rating={r as 0 | 1 | 2 | 3} />
        ))}
      </div>

      {/* Drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl">{selected.name}</SheetTitle>
                <SheetDescription className="flex flex-wrap items-center gap-2 pt-1">
                  <StatusBadge status={selected.status} />
                  <span>Go-live {formatDate(selected.goLiveDate)}</span>
                </SheetDescription>
              </SheetHeader>
              <div className="px-4 space-y-5">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Owner</p>
                  <p className="text-sm font-medium">{selected.owner}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{selected.description}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Impact Profile · {viewLevel === 1 ? "BU" : viewLevel === 2 ? "Function" : "Sub-function"}</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={displayUnits.map((u) => ({ name: u.name, value: scoreFor(selected, u.id) }))} margin={{ left: -20 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={70} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RTooltip cursor={{ fill: "var(--muted)" }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {displayUnits.map((u) => {
                            const r = ratingFromScore(scoreFor(selected, u.id));
                            const color = r === 3 ? "#ef4444" : r === 2 ? "#f59e0b" : r === 1 ? "#10b981" : "#cbd5e1";
                            return <Cell key={u.id} fill={color} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {selected.contributors.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Contributors</p>
                    <ul className="space-y-1.5">
                      {selected.contributors.map((c) => {
                        const person = people.find((p) => p.id === c.personId);
                        if (!person) return null;
                        return (
                          <li key={c.personId} className="flex items-center justify-between text-sm">
                            <span><span className="font-medium">{person.name}</span> <span className="text-muted-foreground">— {c.role ?? person.role}</span></span>
                            <span className="font-semibold">{c.allocation}%</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => { setEditing(selected); setSelected(null); }}>
                  <Pencil className="h-4 w-4" /> Edit Initiative
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {editing && (
        <AddEditInitiativeDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initiative={editing} />
      )}
    </div>
  );
}
