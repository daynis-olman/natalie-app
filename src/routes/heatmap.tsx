import { createFileRoute } from "@tanstack/react-router";
import { InitiativeHeatmapGrid } from "@/components/heatmap/InitiativeHeatmapGrid";

export const Route = createFileRoute("/heatmap")({
  component: HeatmapPage,
  head: () => ({ meta: [{ title: "Heatmap · Change Compass" }] }),
});

function HeatmapPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Initiative × Business Area</h2>
        <p className="text-sm text-muted-foreground">Where each initiative will land — at a glance.</p>
      </div>
      <InitiativeHeatmapGrid />
    </div>
  );
}
