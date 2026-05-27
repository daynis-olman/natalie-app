import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAppState } from "@/context/AppState";
import type { Initiative, Person } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, initials } from "@/lib/heatmapUtils";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
  head: () => ({ meta: [{ title: "Resources · Natalie's Compass" }] }),
});

interface PersonLoad {
  person: Person;
  total: number;
  initiatives: { initiative: Initiative; allocation: number; role?: string }[];
}

function loadStatus(total: number): { label: string; tone: string } {
  if (total > 100) return { label: "Over-allocated", tone: "bg-red-500/15 text-red-700 dark:text-red-300" };
  if (total >= 80) return { label: "At capacity", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
  if (total >= 40) return { label: "Healthy", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" };
  if (total > 0) return { label: "Light", tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300" };
  return { label: "Unallocated", tone: "bg-muted text-muted-foreground" };
}

function ResourcesPage() {
  const { people, initiatives, units } = useAppState();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loads: PersonLoad[] = useMemo(() => {
    return people.map((person) => {
      const involvement = initiatives
        .filter((i) => i.contributors.some((c) => c.personId === person.id))
        .map((initiative) => {
          const c = initiative.contributors.find((x) => x.personId === person.id)!;
          return { initiative, allocation: c.allocation, role: c.role };
        });
      const total = involvement.reduce((s, x) => s + x.allocation, 0);
      return { person, total, initiatives: involvement };
    });
  }, [people, initiatives]);

  const filtered = useMemo(() => {
    return loads
      .filter((l) => {
        if (query && !l.person.name.toLowerCase().includes(query.toLowerCase()) && !l.person.role.toLowerCase().includes(query.toLowerCase())) return false;
        if (statusFilter === "over" && l.total <= 100) return false;
        if (statusFilter === "at" && (l.total < 80 || l.total > 100)) return false;
        if (statusFilter === "healthy" && (l.total < 40 || l.total >= 80)) return false;
        if (statusFilter === "free" && l.total !== 0) return false;
        return true;
      })
      .sort((a, b) => b.total - a.total);
  }, [loads, query, statusFilter]);

  const overCount = loads.filter((l) => l.total > 100).length;
  const atCapCount = loads.filter((l) => l.total >= 80 && l.total <= 100).length;
  const avgLoad = Math.round(loads.reduce((s, l) => s + l.total, 0) / Math.max(1, loads.length));

  const unitOf = (unitId: string) => units.find((u) => u.id === unitId)?.name ?? unitId;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Resource View</h2>
        <p className="text-sm text-muted-foreground">
          See who's contributing across initiatives and where capacity risk is building.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={Users} label="People tracked" value={String(loads.length)} tone="text-accent" bg="bg-accent/10" />
        <SummaryCard icon={AlertTriangle} label="Over-allocated" value={String(overCount)} tone="text-red-600 dark:text-red-400" bg="bg-red-500/10" />
        <SummaryCard icon={TrendingUp} label="At capacity" value={String(atCapCount)} tone="text-amber-600 dark:text-amber-400" bg="bg-amber-500/10" />
        <SummaryCard icon={Users} label="Avg allocation" value={`${avgLoad}%`} tone="text-purple-600 dark:text-purple-400" bg="bg-purple-500/10" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search people…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All people</SelectItem>
            <SelectItem value="over">Over-allocated (&gt;100%)</SelectItem>
            <SelectItem value="at">At capacity (80–100%)</SelectItem>
            <SelectItem value="healthy">Healthy (40–79%)</SelectItem>
            <SelectItem value="free">No initiatives</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* People grid */}
      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map(({ person, total, initiatives: invs }) => {
          const status = loadStatus(total);
          const barValue = Math.min(150, total) / 1.5; // scale 0–150% into 0–100
          const overBy = total > 100 ? total - 100 : 0;
          return (
            <div key={person.id} className="rounded-xl border border-border bg-card shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-semibold shrink-0">
                    {initials(person.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{person.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{person.role} · {unitOf(person.unitId)}</p>
                  </div>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", status.tone)}>
                  {status.label}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Allocation</span>
                  <span className={cn("text-sm font-semibold", total > 100 ? "text-red-600 dark:text-red-400" : total >= 80 ? "text-amber-600 dark:text-amber-400" : "")}>
                    {total}%{overBy > 0 && <span className="text-xs font-normal text-muted-foreground"> (+{overBy} over)</span>}
                  </span>
                </div>
                <Progress
                  value={barValue}
                  className={cn(
                    "h-2",
                    total > 100 && "[&>*]:bg-red-500",
                    total >= 80 && total <= 100 && "[&>*]:bg-amber-500",
                    total >= 40 && total < 80 && "[&>*]:bg-emerald-500",
                    total > 0 && total < 40 && "[&>*]:bg-sky-500",
                  )}
                />
                <div className="text-[10px] text-muted-foreground mt-1">Scale: 0–150%. Capacity line at 100%.</div>
              </div>

              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                  Initiatives ({invs.length})
                </p>
                {invs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Not currently on any initiative.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {invs.map(({ initiative, allocation, role }) => (
                      <li key={initiative.id} className="flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <span className="font-medium truncate">{initiative.name}</span>
                          <span className="text-xs text-muted-foreground"> · {formatDate(initiative.goLiveDate)}</span>
                          {role && <span className="text-xs text-muted-foreground"> · {role}</span>}
                        </div>
                        <span className="font-semibold tabular-nums">{allocation}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="lg:col-span-2 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">No people match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon, label, value, tone, bg,
}: { icon: typeof Users; label: string; value: string; tone: string; bg: string }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", bg)}>
          <Icon className={cn("h-4 w-4", tone)} />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
