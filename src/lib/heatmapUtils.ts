import type { BusinessUnit, ImpactRating, Initiative } from "@/data/mockData";

export function generateMonths(start: Date, end: Date): Date[] {
  const months: Date[] = [];
  const d = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (d <= last) {
    months.push(new Date(d));
    d.setMonth(d.getMonth() + 1);
  }
  return months;
}

// active window: goLive -2 months through goLive +1 month
export function isActiveInMonth(initiative: Initiative, month: Date): boolean {
  const go = new Date(initiative.goLiveDate);
  const start = new Date(go.getFullYear(), go.getMonth() - 2, 1);
  const end = new Date(go.getFullYear(), go.getMonth() + 1, 1);
  const m = new Date(month.getFullYear(), month.getMonth(), 1);
  return m >= start && m <= end;
}

/**
 * Cumulative impact score for a unit in a month, summed over all initiatives
 * active in that month. `scoreFor` is supplied so callers can use the
 * roll-up logic from AppState (handles non-leaf units).
 */
export function getCumulativeScore(
  unitId: string,
  month: Date,
  initiatives: Initiative[],
  scoreFor: (i: Initiative, unitId: string) => number,
): number {
  return initiatives.reduce((sum, i) => {
    if (!isActiveInMonth(i, month)) return sum;
    return sum + scoreFor(i, unitId);
  }, 0);
}

export function getCumulativeColour(score: number): { bg: string; text: string; ring?: string } {
  if (score === 0) return { bg: "bg-muted/40", text: "text-muted-foreground/60" };
  if (score <= 2) return { bg: "bg-emerald-500/15 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300" };
  if (score <= 4) return { bg: "bg-amber-500/15 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300" };
  if (score <= 7) return { bg: "bg-orange-500/20 dark:bg-orange-500/25", text: "text-orange-700 dark:text-orange-300" };
  if (score <= 9) return { bg: "bg-red-500/20 dark:bg-red-500/25", text: "text-red-700 dark:text-red-300" };
  return { bg: "bg-red-600", text: "text-white" };
}

export function getImpactColour(rating: ImpactRating): { bg: string; text: string; dot: string; label: string } {
  switch (rating) {
    case 3:
      return { bg: "bg-red-500/15 dark:bg-red-500/20", text: "text-red-700 dark:text-red-300", dot: "bg-red-500", label: "High" };
    case 2:
      return { bg: "bg-amber-500/15 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500", label: "Medium" };
    case 1:
      return { bg: "bg-emerald-500/15 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500", label: "Low" };
    default:
      return { bg: "bg-muted/40", text: "text-muted-foreground/60", dot: "bg-muted-foreground/40", label: "None" };
  }
}

/** For a cumulative-impact cell, clamp the score onto the 0-3 colour scale. */
export function ratingFromScore(score: number): ImpactRating {
  if (score >= 6) return 3;
  if (score >= 3) return 2;
  if (score >= 1) return 1;
  return 0;
}

export function findPeakMonth(
  months: Date[],
  units: BusinessUnit[],
  initiatives: Initiative[],
  scoreFor: (i: Initiative, unitId: string) => number,
): { month: Date; score: number } {
  let best = { month: months[0] ?? new Date(), score: 0 };
  for (const m of months) {
    const score = units.reduce((s, u) => s + getCumulativeScore(u.id, m, initiatives, scoreFor), 0);
    if (score > best.score) best = { month: m, score };
  }
  return best;
}

export function formatMonth(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(d);
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function maxImpact(i: Initiative): ImpactRating {
  return Math.max(0, ...Object.values(i.impacts)) as ImpactRating;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
