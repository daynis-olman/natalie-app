import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getImpactColour } from "@/lib/heatmapUtils";
import type { ImpactRating } from "@/data/mockData";
import { IMPACT_CRITERIA, IMPACT_LABEL } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function HeatmapCell({ rating, area, display }: { rating: ImpactRating; area: string; display?: number }) {
  const c = getImpactColour(rating);
  const value = display ?? rating;
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "mx-auto flex h-9 min-w-9 px-1.5 items-center justify-center rounded-md text-sm font-semibold cursor-default transition-transform hover:scale-110",
              c.bg,
              c.text,
            )}
          >
            {value}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 max-w-[220px]">
            <p className="font-semibold">{area} · {IMPACT_LABEL[rating]}</p>
            <p className="text-xs text-muted-foreground">{IMPACT_CRITERIA[rating]}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
