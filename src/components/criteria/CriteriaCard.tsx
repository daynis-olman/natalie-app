import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  level: 3 | 2 | 1 | 0;
  label: string;
  criteria: string[];
}

const ACCENT = {
  3: { bar: "bg-red-500", chip: "bg-red-500/15 text-red-700 dark:text-red-300" },
  2: { bar: "bg-amber-500", chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  1: { bar: "bg-emerald-500", chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  0: { bar: "bg-muted-foreground/40", chip: "bg-muted text-muted-foreground" },
} as const;

export function CriteriaCard({ level, label, criteria }: Props) {
  const a = ACCENT[level];
  return (
    <div className="flex overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className={cn("w-3 shrink-0", a.bar)} />
      <div className="flex-1 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold", a.chip)}>{level}</div>
          <h3 className={cn("text-xs font-semibold uppercase tracking-wider", a.chip.split(" ").slice(1).join(" "))}>{label}</h3>
        </div>
        <ul className="space-y-2.5">
          {criteria.map((c, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              <CheckCircle2 className={cn("h-4 w-4 mt-0.5 shrink-0", level === 3 ? "text-red-500" : level === 2 ? "text-amber-500" : level === 1 ? "text-emerald-500" : "text-muted-foreground")} />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
