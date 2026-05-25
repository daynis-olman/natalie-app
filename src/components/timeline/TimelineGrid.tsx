import { useMemo, useState } from "react";
import { useAppState } from "@/context/AppState";
import { generateMonths, isActiveInMonth, getCumulativeScore, getCumulativeColour, formatMonth } from "@/lib/heatmapUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function TimelineGrid() {
  const { initiatives, areas, areaFilter } = useAppState();
  const visibleAreas = areaFilter === "all" ? areas : areas.filter((a) => a.name === areaFilter);

  const months = useMemo(() => {
    if (initiatives.length === 0) return [];
    const dates = initiatives.map((i) => new Date(i.goLiveDate));
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    return generateMonths(new Date(min.getFullYear(), min.getMonth() - 2, 1), new Date(max.getFullYear(), max.getMonth() + 2, 1));
  }, [initiatives]);

  const totalsPerMonth = months.map((m) => visibleAreas.reduce((s, a) => s + getCumulativeScore(a.name, m, initiatives), 0));
  const peakTotal = Math.max(...totalsPerMonth, 0);

  const [selected, setSelected] = useState<{ area: string; month: Date } | null>(null);
  const contributing = selected
    ? initiatives.filter((i) => isActiveInMonth(i, selected.month) && (i.impacts[selected.area] ?? 0) > 0)
    : [];

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="text-sm border-separate border-spacing-0">
        <thead>
          <tr className="bg-primary text-primary-foreground">
            <th className="sticky left-0 z-10 bg-primary text-left px-4 py-3 font-medium w-[160px]">Business Area</th>
            {months.map((m, i) => (
              <th key={i} className={cn("px-2 py-3 font-medium text-xs text-center min-w-[72px]", totalsPerMonth[i] === peakTotal && peakTotal > 0 && "border-t-2 border-red-400")}>
                {formatMonth(m)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleAreas.map((a, ridx) => (
            <tr key={a.id} className={ridx % 2 === 1 ? "bg-muted/30" : ""}>
              <td className="sticky left-0 z-[1] bg-inherit px-4 py-2 border-t border-border font-medium">{a.name}</td>
              {months.map((m, i) => {
                const score = getCumulativeScore(a.name, m, initiatives);
                const c = getCumulativeColour(score);
                return (
                  <td key={i} className="px-1 py-2 border-t border-border text-center">
                    <Popover open={selected?.area === a.name && selected?.month.getTime() === m.getTime()} onOpenChange={(o) => setSelected(o ? { area: a.name, month: m } : null)}>
                      <PopoverTrigger asChild>
                        <button className={cn("mx-auto inline-flex h-8 w-12 items-center justify-center rounded-md text-xs font-semibold transition hover:scale-105", c.bg, c.text)}>
                          {score || ""}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" align="center">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{a.name} · {formatMonth(m)}</p>
                        {contributing.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No active initiatives.</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {contributing.map((i) => (
                              <li key={i.id} className="flex items-center justify-between text-sm">
                                <span className="truncate">{i.name}</span>
                                <span className="font-semibold ml-2">{i.impacts[a.name]}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </PopoverContent>
                    </Popover>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
