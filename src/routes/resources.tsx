import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAppState } from "@/context/AppState";
import type { BusinessUnit, Initiative, Person } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Users, TrendingUp, Plus, Trash2, ChevronRight, ChevronDown, List, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, initials } from "@/lib/heatmapUtils";
import { toast } from "sonner";

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
  const { people, initiatives, units, leafUnits, addPerson, removePerson } = useAppState();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"list" | "org">("list");
  const [addOpen, setAddOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Person | null>(null);

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

  const loadByPerson = useMemo(() => {
    const m = new Map<string, PersonLoad>();
    loads.forEach((l) => m.set(l.person.id, l));
    return m;
  }, [loads]);

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

  const handleDelete = () => {
    if (!pendingDelete) return;
    const impactedCount = initiatives.filter((i) =>
      i.contributors.some((c) => c.personId === pendingDelete.id),
    ).length;
    removePerson(pendingDelete.id);
    toast.success(`Removed ${pendingDelete.name}`, {
      description: impactedCount > 0 ? `Unassigned from ${impactedCount} initiative${impactedCount === 1 ? "" : "s"}.` : undefined,
    });
    setPendingDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Resource View</h2>
          <p className="text-sm text-muted-foreground">
            See who's contributing across initiatives and where capacity risk is building.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border border-border p-0.5 bg-card">
            <button
              onClick={() => setView("list")}
              className={cn("flex items-center gap-1.5 px-2.5 h-8 text-xs rounded", view === "list" ? "bg-accent/15 text-accent font-medium" : "text-muted-foreground hover:text-foreground")}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setView("org")}
              className={cn("flex items-center gap-1.5 px-2.5 h-8 text-xs rounded", view === "org" ? "bg-accent/15 text-accent font-medium" : "text-muted-foreground hover:text-foreground")}
            >
              <Network className="h-3.5 w-3.5" /> Org Tree
            </button>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add employee
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={Users} label="People tracked" value={String(loads.length)} tone="text-accent" bg="bg-accent/10" />
        <SummaryCard icon={AlertTriangle} label="Over-allocated" value={String(overCount)} tone="text-red-600 dark:text-red-400" bg="bg-red-500/10" />
        <SummaryCard icon={TrendingUp} label="At capacity" value={String(atCapCount)} tone="text-amber-600 dark:text-amber-400" bg="bg-amber-500/10" />
        <SummaryCard icon={Users} label="Avg allocation" value={`${avgLoad}%`} tone="text-purple-600 dark:text-purple-400" bg="bg-purple-500/10" />
      </div>

      {view === "list" ? (
        <>
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
              const barValue = Math.min(150, total) / 1.5;
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
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", status.tone)}>
                        {status.label}
                      </span>
                      <button
                        onClick={() => setPendingDelete(person)}
                        className="text-muted-foreground hover:text-red-600 transition-colors p-1"
                        aria-label={`Remove ${person.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
        </>
      ) : (
        <OrgTreeView
          units={units}
          people={people}
          loadByPerson={loadByPerson}
          onDelete={(p) => setPendingDelete(p)}
        />
      )}

      <AddEmployeeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        leafUnits={leafUnits}
        units={units}
        onAdd={(p) => {
          addPerson(p);
          toast.success(`Added ${p.name}`);
        }}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Remove {pendingDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>This will permanently remove this employee from the directory.</p>
                {pendingDelete && (() => {
                  const impacted = initiatives.filter((i) =>
                    i.contributors.some((c) => c.personId === pendingDelete.id),
                  );
                  if (impacted.length === 0) return <p className="text-xs text-muted-foreground">They are not currently assigned to any initiative.</p>;
                  return (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                        They will be unassigned from {impacted.length} initiative{impacted.length === 1 ? "" : "s"}:
                      </p>
                      <ul className="text-xs text-amber-700/90 dark:text-amber-300/90 list-disc pl-5 space-y-0.5">
                        {impacted.map((i) => <li key={i.id}>{i.name}</li>)}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Remove employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Org Tree View ──────────────────────────────────────────────────────────
// Status → tonal classes for avatar + chip (matches "Nesting clarity" direction)
const STATUS_TONES: Record<string, { avatar: string; chip: string }> = {
  "Over-allocated": {
    avatar: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300",
    chip: "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  },
  "At capacity": {
    avatar: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",
    chip: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  },
  "Healthy": {
    avatar: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
    chip: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  "Light": {
    avatar: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300",
    chip: "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  },
  "Unallocated": {
    avatar: "bg-muted text-muted-foreground",
    chip: "bg-muted text-muted-foreground border-border",
  },
};

function OrgTreeView({
  units, people, loadByPerson, onDelete,
}: {
  units: BusinessUnit[];
  people: Person[];
  loadByPerson: Map<string, PersonLoad>;
  onDelete: (p: Person) => void;
}) {
  const roots = units.filter((u) => u.parentId === null);
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="divide-y divide-border/60">
        {roots.map((u) => (
          <OrgNode
            key={u.id}
            unit={u}
            units={units}
            people={people}
            loadByPerson={loadByPerson}
            depth={0}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function OrgNode({
  unit, units, people, loadByPerson, depth, onDelete,
}: {
  unit: BusinessUnit;
  units: BusinessUnit[];
  people: Person[];
  loadByPerson: Map<string, PersonLoad>;
  depth: number;
  onDelete: (p: Person) => void;
}) {
  const [open, setOpen] = useState(depth < 1);
  const children = units.filter((u) => u.parentId === unit.id);
  const directPeople = people.filter((p) => p.unitId === unit.id);
  const hasContent = children.length > 0 || directPeople.length > 0;

  const countLabel = [
    directPeople.length > 0 ? `${directPeople.length}` : null,
    children.length > 0 ? `${children.length} sub` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // Typography per level
  const headerText =
    depth === 0
      ? "font-semibold text-foreground"
      : depth === 1
        ? "font-medium text-foreground"
        : "font-medium text-foreground/90";
  const headerSize = depth === 0 ? "text-sm" : "text-sm";
  const chevronColor = hasContent ? "text-muted-foreground" : "text-muted-foreground/40";
  const chevronSize = depth === 0 ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className="group/unit">
      <button
        onClick={() => hasContent && setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left",
          !hasContent && "cursor-default",
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {hasContent ? (
            open ? (
              <ChevronDown className={cn(chevronSize, chevronColor, "shrink-0")} />
            ) : (
              <ChevronRight className={cn(chevronSize, chevronColor, "shrink-0")} />
            )
          ) : (
            <span className={cn(chevronSize, "shrink-0")} />
          )}
          <span className={cn(headerSize, headerText, "truncate")}>{unit.name}</span>
          {unit.lead && (
            <span className="text-xs text-muted-foreground truncate font-normal">· {unit.lead}</span>
          )}
        </div>
        {countLabel && (
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider shrink-0 ml-3">
            {countLabel}
          </div>
        )}
      </button>

      {open && hasContent && (
        <div className="ml-6 pl-4 border-l border-border/70 pb-1.5">
          {directPeople.map((person) => {
            const load = loadByPerson.get(person.id);
            const total = load?.total ?? 0;
            const status = loadStatus(total);
            const tone = STATUS_TONES[status.label] ?? STATUS_TONES["Unallocated"];
            return (
              <div
                key={person.id}
                className="group/row flex items-center justify-between px-3 py-2 mr-2 rounded-lg hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      tone.avatar,
                    )}
                  >
                    {initials(person.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{person.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{person.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap",
                      tone.chip,
                    )}
                  >
                    {total}% · {status.label}
                  </span>
                  <button
                    onClick={() => onDelete(person)}
                    className="opacity-0 group-hover/row:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-1"
                    aria-label={`Remove ${person.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {children.map((child) => (
            <OrgNode
              key={child.id}
              unit={child}
              units={units}
              people={people}
              loadByPerson={loadByPerson}
              depth={depth + 1}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}


// ─── Add Employee Dialog ────────────────────────────────────────────────────
function AddEmployeeDialog({
  open, onOpenChange, leafUnits, units, onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  leafUnits: BusinessUnit[];
  units: BusinessUnit[];
  onAdd: (p: Person) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [unitId, setUnitId] = useState<string>(leafUnits[0]?.id ?? "");
  const [capacity, setCapacity] = useState<number>(100);

  const unitLabel = (u: BusinessUnit) => {
    const parts: string[] = [u.name];
    let cur = u;
    while (cur.parentId) {
      const parent = units.find((x) => x.id === cur.parentId);
      if (!parent) break;
      parts.unshift(parent.name);
      cur = parent;
    }
    return parts.join(" › ");
  };

  const reset = () => {
    setName(""); setRole(""); setCapacity(100); setUnitId(leafUnits[0]?.id ?? "");
  };

  const submit = () => {
    if (!name.trim() || !role.trim() || !unitId) {
      toast.error("Please fill in name, role and unit");
      return;
    }
    onAdd({
      id: `p-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      unitId,
      capacity,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add employee</DialogTitle>
          <DialogDescription>Add a person to the directory. You can assign them to initiatives afterwards.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="emp-name">Full name</Label>
            <Input id="emp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jamie Carter" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emp-role">Role</Label>
            <Input id="emp-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior Engineer" />
          </div>
          <div className="space-y-1.5">
            <Label>Business unit</Label>
            <Select value={unitId} onValueChange={setUnitId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {leafUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{unitLabel(u)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emp-cap">Capacity (%)</Label>
            <Input
              id="emp-cap"
              type="number"
              min={1}
              max={100}
              value={capacity}
              onChange={(e) => setCapacity(Math.max(1, Math.min(100, Number(e.target.value) || 0)))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); reset(); }}>Cancel</Button>
          <Button onClick={submit}>Add employee</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
