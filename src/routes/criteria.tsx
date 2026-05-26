import { createFileRoute } from "@tanstack/react-router";
import { CriteriaCard } from "@/components/criteria/CriteriaCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/criteria")({
  component: CriteriaPage,
  head: () => ({ meta: [{ title: "Impact Criteria · Natalie's Compass" }] }),
});

const LEVELS = [
  {
    level: 3 as const,
    label: "High",
    criteria: [
      "Significant changes to the way work is completed — >75% new skills or knowledge required",
      "Significant changes to current business processes — >50% process has changed",
      "New technology operates significantly differently from current technology",
      "Significant behaviour change required across the impacted team",
    ],
  },
  {
    level: 2 as const,
    label: "Medium",
    criteria: [
      "Changes to the way work is completed — 10–50% new skills or knowledge required",
      "Changes to current business processes — 15–50% process has changed",
      "New technology operates with some differences to previous technology",
      "Moderate level of behaviour change required",
    ],
  },
  {
    level: 1 as const,
    label: "Low",
    criteria: [
      "Minor changes to the way work is completed — <10% new skills or knowledge required",
      "Minor changes to current business processes — <15% process has changed",
      "New technology operates similarly or more intuitively than current",
      "Minimal level of behaviour change required",
    ],
  },
  {
    level: 0 as const,
    label: "No Impact",
    criteria: ["Not applicable — this business area is not impacted by the initiative"],
  },
];

function CriteriaPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Impact Criteria</h2>
        <p className="text-sm text-muted-foreground">Use this guide to rate the impact of each initiative on each business area.</p>
      </div>

      <div className="space-y-3">
        {LEVELS.map((l) => <CriteriaCard key={l.level} {...l} />)}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold tracking-tight mb-2">How to use this guide</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="who">
            <AccordionTrigger>Who should complete the impact assessment?</AccordionTrigger>
            <AccordionContent>The initiative owner, supported by leaders of each affected business area. Use a shared workshop to align on ratings.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="mh">
            <AccordionTrigger>How do I decide between Medium and High?</AccordionTrigger>
            <AccordionContent>If more than 50% of business processes or 75% of required skills are changing, rate it High. Otherwise Medium.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="hm">
            <AccordionTrigger>What happens with my ratings in the heatmap?</AccordionTrigger>
            <AccordionContent>Ratings combine into cumulative scores per area per month, surfacing saturation risk before it impacts delivery.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
