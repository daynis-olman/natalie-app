import { useMemo } from "react";
import { useAppState } from "@/context/AppState";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { generateMonths, isActiveInMonth, formatMonth } from "@/lib/heatmapUtils";

const PALETTE = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444", "#84cc16"];

export function SaturationBarChart() {
  const { initiatives, displayUnits, areaFilter, scoreFor } = useAppState();

  const data = useMemo(() => {
    const today = new Date();
    const months = generateMonths(today, new Date(today.getFullYear() + 1, today.getMonth() + 6, 1));
    return months.map((m) => {
      const row: Record<string, number | string> = { month: formatMonth(m) };
      initiatives.forEach((i) => {
        if (!isActiveInMonth(i, m)) { row[i.name] = 0; return; }
        const unitIds = areaFilter === "all" ? displayUnits.map((u) => u.id) : [areaFilter];
        row[i.name] = unitIds.reduce((s, id) => s + scoreFor(i, id), 0);
      });
      return row;
    });
  }, [initiatives, displayUnits, areaFilter, scoreFor]);

  const avg = useMemo(() => {
    const totals = data.map((d) => initiatives.reduce((s, i) => s + ((d[i.name] as number) ?? 0), 0));
    return totals.reduce((a, b) => a + b, 0) / Math.max(1, totals.length);
  }, [data, initiatives]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-sm font-semibold tracking-tight">Change Saturation</h3>
        <span className="text-xs text-muted-foreground">Cumulative impact by month · 18 months</span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: "color-mix(in oklab, var(--muted), transparent 50%)" }}
            />
            <ReferenceLine y={avg} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: "avg", fontSize: 10, fill: "var(--muted-foreground)" }} />
            {initiatives.map((i, idx) => (
              <Bar key={i.id} dataKey={i.name} stackId="a" fill={PALETTE[idx % PALETTE.length]} radius={idx === initiatives.length - 1 ? [4, 4, 0, 0] : 0} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {initiatives.map((i, idx) => (
          <div key={i.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-sm" style={{ background: PALETTE[idx % PALETTE.length] }} />
            {i.name}
          </div>
        ))}
      </div>
    </div>
  );
}
