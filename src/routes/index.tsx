import { createFileRoute } from "@tanstack/react-router";
import { Rocket, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { SaturationBarChart } from "@/components/dashboard/SaturationBarChart";
import { UpcomingGoLives } from "@/components/dashboard/UpcomingGoLives";
import { RiskBanner } from "@/components/dashboard/RiskBanner";
import { useAppState } from "@/context/AppState";
import { findPeakMonth, generateMonths, formatMonth } from "@/lib/heatmapUtils";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { initiatives, areas } = useAppState();
  const inFlight = initiatives.filter((i) => i.status === "in-flight").length;
  const highImpactAreas = areas.filter((a) => initiatives.some((i) => i.impacts[a.name] === 3)).length;
  const today = new Date();
  const months = generateMonths(today, new Date(today.getFullYear() + 1, today.getMonth() + 6, 1));
  const peak = findPeakMonth(months, areas, initiatives);

  return (
    <div className="space-y-6">
      <RiskBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Rocket} label="Total Initiatives" value={initiatives.length} tone="accent" />
        <StatCard icon={Zap} label="In-Flight" value={inFlight} tone="amber" />
        <StatCard icon={AlertTriangle} label="High-Impact Areas" value={highImpactAreas} tone="red" />
        <StatCard icon={TrendingUp} label="Peak Pressure" value={formatMonth(peak.month)} sub={`Score ${peak.score}`} tone="purple" />
      </div>

      <SaturationBarChart />
      <UpcomingGoLives />
    </div>
  );
}
