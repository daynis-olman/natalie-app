import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppState } from "@/context/AppState";
import { formatDate, getImpactColour, initials, maxImpact } from "@/lib/heatmapUtils";
import type { Initiative } from "@/data/mockData";
import { AddEditInitiativeDialog } from "./AddEditInitiativeDialog";
import { cn } from "@/lib/utils";

const STATUS_MAP = {
  "in-flight": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  planned: "bg-muted text-muted-foreground",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
} as const;

const BORDER_MAP = {
  3: "border-l-red-500",
  2: "border-l-amber-500",
  1: "border-l-emerald-500",
  0: "border-l-muted-foreground/30",
} as const;

export function InitiativeCard({ initiative }: { initiative: Initiative }) {
  const { areas, deleteInitiative } = useAppState();
  const [editing, setEditing] = useState(false);
  const max = maxImpact(initiative);

  return (
    <>
      <div className={cn("rounded-xl border border-border bg-card shadow-sm p-5 border-l-4 transition-shadow hover:shadow-md", BORDER_MAP[max])}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold tracking-tight">{initiative.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{initiative.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium whitespace-nowrap">{formatDate(initiative.goLiveDate)}</span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", STATUS_MAP[initiative.status])}>{initiative.status.replace("-", " ")}</span>
            <div className="h-8 w-8 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-semibold">{initials(initiative.owner)}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <TooltipProvider delayDuration={150}>
            {areas.map((a) => {
              const r = initiative.impacts[a.name] ?? 0;
              const c = getImpactColour(r as 0|1|2|3);
              return (
                <Tooltip key={a.id}>
                  <TooltipTrigger asChild>
                    <div className={cn("h-6 w-6 rounded flex items-center justify-center text-[10px] font-semibold", c.bg, c.text)}>{r}</div>
                  </TooltipTrigger>
                  <TooltipContent><span className="text-xs">{a.name}: <strong>{c.label}</strong></span></TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>

        <div className="mt-4 flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this initiative?</AlertDialogTitle>
                <AlertDialogDescription>This will remove “{initiative.name}” from all heatmap views. This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteInitiative(initiative.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <AddEditInitiativeDialog open={editing} onOpenChange={setEditing} initiative={initiative} />
    </>
  );
}
