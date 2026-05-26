import { createFileRoute } from "@tanstack/react-router";
import { TimelineGrid } from "@/components/timeline/TimelineGrid";
import { GanttSwimLane } from "@/components/timeline/GanttSwimLane";

export const Route = createFileRoute("/timeline")({
  component: TimelinePage,
  head: () => ({ meta: [{ title: "Timeline · Natalie's Compass" }] }),
});

function TimelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Timeline Heatmap</h2>
        <p className="text-sm text-muted-foreground">Cumulative change pressure per business area, per month.</p>
      </div>
      <TimelineGrid />
      <GanttSwimLane />
    </div>
  );
}
