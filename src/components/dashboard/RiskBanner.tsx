import { AlertTriangle } from "lucide-react";
import { useAppState } from "@/context/AppState";
import { generateMonths, getCumulativeScore, formatMonth } from "@/lib/heatmapUtils";

export function RiskBanner() {
  const { initiatives, displayUnits, scoreFor } = useAppState();
  const today = new Date();
  const months = generateMonths(today, new Date(today.getFullYear() + 1, today.getMonth() + 6, 1));

  let peakMonth: Date | null = null;
  let peakCount = 0;
  for (const m of months) {
    const overloaded = displayUnits.filter((u) => getCumulativeScore(u.id, m, initiatives, scoreFor) >= 6);
    if (overloaded.length > peakCount) {
      peakCount = overloaded.length;
      peakMonth = m;
    }
  }

  if (!peakMonth || peakCount === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div>
        <p className="font-semibold text-sm">Change saturation risk detected in {formatMonth(peakMonth)}</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {peakCount} business {peakCount === 1 ? "area is" : "areas are"} experiencing concurrent high-impact change.
        </p>
      </div>
    </div>
  );
}
