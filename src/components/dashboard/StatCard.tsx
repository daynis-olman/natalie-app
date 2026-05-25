import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "accent",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "accent" | "amber" | "red" | "purple";
}) {
  const toneClass = {
    accent: "bg-accent/10 text-accent",
    amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    red: "bg-red-500/15 text-red-600 dark:text-red-400",
    purple: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  }[tone];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg mb-3", toneClass)}>
        <Icon className="h-4.5 w-4.5" strokeWidth={2.25} />
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground/80">{sub}</div>}
    </div>
  );
}
