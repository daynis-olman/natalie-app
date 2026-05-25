import { useMemo } from "react";
import { useAppState } from "@/context/AppState";
import { generateMonths, formatMonth, maxImpact, getImpactColour } from "@/lib/heatmapUtils";
import { cn } from "@/lib/utils";

export function GanttSwimLane() {
  const { initiatives } = useAppState();

  const months = useMemo(() => {
    if (initiatives.length === 0) return [];
    const dates = initiatives.map((i) => new Date(i.goLiveDate));
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    return generateMonths(new Date(min.getFullYear(), min.getMonth() - 2, 1), new Date(max.getFullYear(), max.getMonth() + 2, 1));
  }, [initiatives]);

  const monthIndex = (d: Date) => months.findIndex((m) => m.getFullYear() === d.getFullYear() && m.getMonth() === d.getMonth());

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5">
      <h3 className="text-sm font-semibold tracking-tight mb-1">Initiatives Contributing</h3>
      <p className="text-xs text-muted-foreground mb-4">Active window: 2 months before through 1 month after go-live</p>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid text-[10px] text-muted-foreground" style={{ gridTemplateColumns: `200px repeat(${months.length}, minmax(0, 1fr))` }}>
            <div />
            {months.map((m, i) => (<div key={i} className="text-center">{formatMonth(m)}</div>))}
          </div>
          <div className="mt-2 space-y-2">
            {initiatives.map((i) => {
              const go = new Date(i.goLiveDate);
              const startIdx = monthIndex(new Date(go.getFullYear(), go.getMonth() - 2, 1));
              const endIdx = monthIndex(new Date(go.getFullYear(), go.getMonth() + 1, 1));
              const c = getImpactColour(maxImpact(i));
              return (
                <div key={i.id} className="grid items-center gap-1" style={{ gridTemplateColumns: `200px repeat(${months.length}, minmax(0, 1fr))` }}>
                  <div className="truncate text-xs font-medium pr-2">{i.name}</div>
                  {months.map((_, idx) => {
                    const within = idx >= startIdx && idx <= endIdx;
                    const isGoLive = idx === monthIndex(new Date(go.getFullYear(), go.getMonth(), 1));
                    return (
                      <div key={idx} className="px-0.5">
                        {within && (
                          <div className={cn("h-5 rounded", c.bg, isGoLive && "ring-2 ring-accent")} />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
