import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "@/context/AppState";
import type { Initiative, ImpactRating, Contributor, BusinessUnit } from "@/data/mockData";
import { getImpactColour } from "@/lib/heatmapUtils";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

const empty = (leafUnits: BusinessUnit[]): Initiative => ({
  id: `i${Date.now()}`,
  name: "",
  goLiveDate: new Date().toISOString().slice(0, 10),
  status: "planned",
  owner: "",
  description: "",
  impacts: Object.fromEntries(leafUnits.map((u) => [u.id, 0])) as Record<string, ImpactRating>,
  contributors: [],
});

function unitPathLabel(unit: BusinessUnit, units: BusinessUnit[]): string {
  const parts: string[] = [unit.name];
  let cur = unit.parentId ? units.find((u) => u.id === unit.parentId) : null;
  while (cur) {
    parts.unshift(cur.name);
    cur = cur.parentId ? units.find((u) => u.id === cur!.parentId) ?? null : null;
  }
  return parts.join(" › ");
}

export function AddEditInitiativeDialog({
  open,
  onOpenChange,
  initiative,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initiative?: Initiative;
}) {
  const { units, leafUnits, people, addInitiative, updateInitiative } = useAppState();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Initiative>(initiative ?? empty(leafUnits));

  const isEdit = !!initiative;

  // Group leaf units by their top-level (L1) ancestor for the rating UI.
  const grouped: { l1: BusinessUnit; leaves: BusinessUnit[] }[] = [];
  for (const u of units.filter((u) => u.level === 1)) {
    const ownLeaves = leafUnits.filter((leaf) => {
      let cur: BusinessUnit | undefined = leaf;
      while (cur) {
        if (cur.id === u.id) return true;
        cur = cur.parentId ? units.find((x) => x.id === cur!.parentId) : undefined;
      }
      return false;
    });
    if (ownLeaves.length > 0) grouped.push({ l1: u, leaves: ownLeaves });
  }

  const handleSave = () => {
    if (isEdit) updateInitiative(data);
    else addInitiative(data);
    onOpenChange(false);
    setStep(1);
    if (!isEdit) setData(empty(leafUnits));
  };

  const addContributor = (personId: string) => {
    if (data.contributors.some((c) => c.personId === personId)) return;
    setData({ ...data, contributors: [...data.contributors, { personId, allocation: 20 }] });
  };
  const updateContributor = (personId: string, patch: Partial<Contributor>) => {
    setData({
      ...data,
      contributors: data.contributors.map((c) => (c.personId === personId ? { ...c, ...patch } : c)),
    });
  };
  const removeContributor = (personId: string) => {
    setData({ ...data, contributors: data.contributors.filter((c) => c.personId !== personId) });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setStep(1); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Initiative" : "Add Initiative"}</DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={cn("h-1 flex-1 rounded-full", s <= step ? "bg-accent" : "bg-muted")} />
            ))}
          </div>
          <div className="text-xs text-muted-foreground pt-1">
            Step {step} of 4 — {["Details", "Impact", "Contributors", "Review"][step - 1]}
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Initiative Name</Label>
              <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="e.g. CRM Replacement" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Owner</Label>
                <Input value={data.owner} onChange={(e) => setData({ ...data, owner: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Go-Live Date</Label>
                <Input type="date" value={data.goLiveDate} onChange={(e) => setData({ ...data, goLiveDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={data.status} onValueChange={(v) => setData({ ...data, status: v as Initiative["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-flight">In-Flight</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Rate impact on each function. Leave at 0 if not impacted.</p>
            {grouped.map(({ l1, leaves }) => (
              <div key={l1.id} className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{l1.name}</p>
                <div className="space-y-2">
                  {leaves.map((leaf) => (
                    <div key={leaf.id} className="flex items-center justify-between gap-3">
                      <span className="text-sm truncate">{unitPathLabel(leaf, units).replace(`${l1.name} › `, "")}</span>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((r) => {
                          const c = getImpactColour(r as ImpactRating);
                          const active = (data.impacts[leaf.id] ?? 0) === r;
                          return (
                            <button
                              key={r}
                              onClick={() => setData({ ...data, impacts: { ...data.impacts, [leaf.id]: r as ImpactRating } })}
                              className={cn(
                                "h-7 w-7 rounded-md text-sm font-semibold transition",
                                active ? `${c.bg} ${c.text} ring-2 ring-accent` : "bg-muted text-muted-foreground hover:bg-muted/70",
                              )}
                            >
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add the key individuals contributing to this initiative and the share of their capacity they'll dedicate.
            </p>

            <div>
              <Label className="text-xs">Add a contributor</Label>
              <Select value="" onValueChange={(v) => v && addContributor(v)}>
                <SelectTrigger><SelectValue placeholder="Pick a person…" /></SelectTrigger>
                <SelectContent>
                  {people
                    .filter((p) => !data.contributors.some((c) => c.personId === p.id))
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {data.contributors.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No contributors added yet.</p>
              )}
              {data.contributors.map((c) => {
                const person = people.find((p) => p.id === c.personId);
                if (!person) return null;
                return (
                  <div key={c.personId} className="rounded-lg border border-border p-3 flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{person.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{person.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        className="w-28"
                        value={c.role ?? ""}
                        placeholder="Role"
                        onChange={(e) => updateContributor(c.personId, { role: e.target.value })}
                      />
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={5}
                          className="w-20"
                          value={c.allocation}
                          onChange={(e) => updateContributor(c.personId, { allocation: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeContributor(c.personId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Name: </span><span className="font-medium">{data.name}</span></div>
            <div><span className="text-muted-foreground">Owner: </span>{data.owner}</div>
            <div><span className="text-muted-foreground">Go-Live: </span>{data.goLiveDate}</div>
            <div><span className="text-muted-foreground">Status: </span>{data.status}</div>
            <div><span className="text-muted-foreground">Description: </span>{data.description}</div>
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Impact Summary (functions with impact)</p>
              <div className="flex flex-wrap gap-1">
                {leafUnits
                  .filter((u) => (data.impacts[u.id] ?? 0) > 0)
                  .map((u) => {
                    const r = (data.impacts[u.id] ?? 0) as ImpactRating;
                    const c = getImpactColour(r);
                    return (
                      <div key={u.id} className={cn("rounded px-2 py-1 text-xs", c.bg, c.text)}>
                        {u.name}: {r}
                      </div>
                    );
                  })}
                {leafUnits.every((u) => (data.impacts[u.id] ?? 0) === 0) && (
                  <span className="text-xs text-muted-foreground italic">No impact recorded.</span>
                )}
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Contributors</p>
              {data.contributors.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">None.</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {data.contributors.map((c) => {
                    const person = people.find((p) => p.id === c.personId);
                    return (
                      <div key={c.personId} className="rounded bg-accent/10 text-accent px-2 py-1 text-xs">
                        {person?.name ?? c.personId} · {c.allocation}%{c.role ? ` · ${c.role}` : ""}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < 4 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !data.name}>Next</Button>
          ) : (
            <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isEdit ? "Save Changes" : "Add to Heatmap"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
