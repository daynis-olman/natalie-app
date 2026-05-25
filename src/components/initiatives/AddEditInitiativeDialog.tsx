import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "@/context/AppState";
import type { Initiative, ImpactRating } from "@/data/mockData";
import { getImpactColour } from "@/lib/heatmapUtils";
import { cn } from "@/lib/utils";

const empty = (areas: { name: string }[]): Initiative => ({
  id: `i${Date.now()}`,
  name: "",
  goLiveDate: new Date().toISOString().slice(0, 10),
  status: "planned",
  owner: "",
  description: "",
  impacts: Object.fromEntries(areas.map((a) => [a.name, 0])) as Record<string, ImpactRating>,
});

export function AddEditInitiativeDialog({
  open,
  onOpenChange,
  initiative,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initiative?: Initiative;
}) {
  const { areas, addInitiative, updateInitiative } = useAppState();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Initiative>(initiative ?? empty(areas));

  const isEdit = !!initiative;

  const handleSave = () => {
    if (isEdit) updateInitiative(data);
    else addInitiative(data);
    onOpenChange(false);
    setStep(1);
    if (!isEdit) setData(empty(areas));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setStep(1); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Initiative" : "Add Initiative"}</DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("h-1 flex-1 rounded-full", s <= step ? "bg-accent" : "bg-muted")} />
            ))}
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
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Rate impact on each business area.</p>
            {areas.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium truncate">{a.name}</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((r) => {
                    const c = getImpactColour(r as ImpactRating);
                    const active = data.impacts[a.name] === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setData({ ...data, impacts: { ...data.impacts, [a.name]: r as ImpactRating } })}
                        className={cn(
                          "h-8 w-8 rounded-md text-sm font-semibold transition",
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
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Name: </span><span className="font-medium">{data.name}</span></div>
            <div><span className="text-muted-foreground">Owner: </span>{data.owner}</div>
            <div><span className="text-muted-foreground">Go-Live: </span>{data.goLiveDate}</div>
            <div><span className="text-muted-foreground">Status: </span>{data.status}</div>
            <div><span className="text-muted-foreground">Description: </span>{data.description}</div>
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Impact Summary</p>
              <div className="flex flex-wrap gap-1">
                {areas.map((a) => {
                  const r = (data.impacts[a.name] ?? 0) as ImpactRating;
                  const c = getImpactColour(r);
                  return (
                    <div key={a.id} className={cn("rounded px-2 py-1 text-xs", c.bg, c.text)}>
                      {a.name}: {r}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < 3 ? (
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
