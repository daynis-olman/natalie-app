import { createFileRoute } from "@tanstack/react-router";
import { useAppState } from "@/context/AppState";
import { InitiativeCard } from "@/components/initiatives/InitiativeCard";

export const Route = createFileRoute("/initiatives")({
  component: InitiativesPage,
  head: () => ({ meta: [{ title: "Initiatives · Change Compass" }] }),
});

function InitiativesPage() {
  const { initiatives } = useAppState();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">All Initiatives</h2>
        <p className="text-sm text-muted-foreground">Manage and refine the change portfolio.</p>
      </div>
      {initiatives.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No initiatives yet — add your first one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {initiatives.map((i) => <InitiativeCard key={i.id} initiative={i} />)}
        </div>
      )}
    </div>
  );
}
