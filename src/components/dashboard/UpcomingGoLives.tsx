import { useNavigate } from "@tanstack/react-router";
import { useAppState } from "@/context/AppState";
import { formatDate } from "@/lib/heatmapUtils";
import { cn } from "@/lib/utils";

export function UpcomingGoLives() {
  const { initiatives } = useAppState();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [...initiatives].filter((i) => i.goLiveDate >= today).sort((a, b) => a.goLiveDate.localeCompare(b.goLiveDate));

  const statusClass = {
    "in-flight": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    planned: "bg-muted text-muted-foreground",
    completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  } as const;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold tracking-tight">Upcoming Go-Lives</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2 font-medium">Initiative</th>
              <th className="px-3 py-2 font-medium">Go-Live</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium text-center">High Impact</th>
              <th className="px-5 py-2 font-medium">Owner</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((i) => {
              const highCount = Object.values(i.impacts).filter((v) => v === 3).length;
              return (
                <tr
                  key={i.id}
                  onClick={() => navigate({ to: "/initiatives" })}
                  className="cursor-pointer border-t border-border hover:bg-accent/5 transition-colors"
                >
                  <td className="px-5 py-3 font-medium">{i.name}</td>
                  <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{formatDate(i.goLiveDate)}</td>
                  <td className="px-3 py-3"><span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", statusClass[i.status])}>{i.status.replace("-", " ")}</span></td>
                  <td className="px-3 py-3 text-center font-semibold">{highCount}</td>
                  <td className="px-5 py-3 text-muted-foreground">{i.owner}</td>
                </tr>
              );
            })}
            {upcoming.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No upcoming go-lives.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
