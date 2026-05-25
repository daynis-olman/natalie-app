import { getImpactColour, type ImpactRating } from "@/lib/heatmapUtils";
import type { ImpactRating as IR } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function ImpactBadge({ rating, size = "sm" }: { rating: IR; size?: "sm" | "md" }) {
  const c = getImpactColour(rating);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        c.bg,
        c.text,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}
