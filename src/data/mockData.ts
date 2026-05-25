export type ImpactRating = 0 | 1 | 2 | 3;

export interface Initiative {
  id: string;
  name: string;
  goLiveDate: string;
  status: "planned" | "in-flight" | "completed";
  owner: string;
  description: string;
  impacts: Record<string, ImpactRating>;
}

export interface BusinessArea {
  id: string;
  name: string;
  lead: string;
  headcount: number;
}

export const IMPACT_LABEL: Record<ImpactRating, string> = {
  3: "High",
  2: "Medium",
  1: "Low",
  0: "None",
};

export const IMPACT_CRITERIA: Record<ImpactRating, string> = {
  3: "New technology operates significantly differently. Behaviour change required.",
  2: "Some process / tooling changes. Moderate behaviour change.",
  1: "Minor changes. Minimal behaviour change required.",
  0: "Not applicable — this area is not impacted.",
};

export const BUSINESS_AREAS: BusinessArea[] = [
  { id: "pac", name: "People & Culture", lead: "Sarah Mitchell", headcount: 18 },
  { id: "sal", name: "Sales", lead: "James Thornton", headcount: 45 },
  { id: "fib", name: "Fibre", lead: "Priya Ramesh", headcount: 62 },
  { id: "fin", name: "Finance", lead: "David Okonkwo", headcount: 24 },
  { id: "it", name: "IT", lead: "Chris Nakamura", headcount: 31 },
  { id: "pro", name: "Procurement", lead: "Lisa Brennan", headcount: 14 },
  { id: "ops", name: "Operations", lead: "Tom Veillard", headcount: 53 },
  { id: "cx", name: "Customer Experience", lead: "Amara Diallo", headcount: 38 },
];

export const INITIATIVES: Initiative[] = [
  {
    id: "i1",
    name: "Salesforce CRM",
    goLiveDate: "2026-10-01",
    status: "in-flight",
    owner: "James Thornton",
    description:
      "Full CRM replacement across Sales and customer-facing teams. New pipeline management, quoting, and forecasting workflows.",
    impacts: { "People & Culture": 0, Sales: 3, Fibre: 2, Finance: 3, IT: 3, Procurement: 2, Operations: 1, "Customer Experience": 2 },
  },
  {
    id: "i2",
    name: "Burnley Office Consolidation",
    goLiveDate: "2026-12-22",
    status: "planned",
    owner: "Sarah Mitchell",
    description:
      "Physical relocation and consolidation of Burnley office. Affects workspace design, team adjacencies, and hybrid working arrangements.",
    impacts: { "People & Culture": 3, Sales: 1, Fibre: 1, Finance: 3, IT: 3, Procurement: 3, Operations: 2, "Customer Experience": 0 },
  },
  {
    id: "i3",
    name: "Time & Attendance System",
    goLiveDate: "2026-08-01",
    status: "in-flight",
    owner: "Sarah Mitchell",
    description:
      "Replacement of legacy timekeeping system. New rostering, leave management, and payroll integration for all shift-based workers.",
    impacts: { "People & Culture": 3, Sales: 0, Fibre: 3, Finance: 2, IT: 2, Procurement: 0, Operations: 3, "Customer Experience": 0 },
  },
  {
    id: "i4",
    name: "Operating Model Redesign",
    goLiveDate: "2027-07-01",
    status: "planned",
    owner: "David Okonkwo",
    description:
      "Enterprise-wide operating model transformation. New accountability structures, revised reporting lines, and updated ways of working across all functions.",
    impacts: { "People & Culture": 3, Sales: 3, Fibre: 3, Finance: 3, IT: 3, Procurement: 3, Operations: 3, "Customer Experience": 3 },
  },
  {
    id: "i5",
    name: "Finance System Upgrade",
    goLiveDate: "2027-03-01",
    status: "planned",
    owner: "David Okonkwo",
    description:
      "Core financial system migration to cloud ERP. New chart of accounts, revised month-end processes, and updated procurement integration.",
    impacts: { "People & Culture": 1, Sales: 0, Fibre: 0, Finance: 3, IT: 2, Procurement: 2, Operations: 1, "Customer Experience": 0 },
  },
  {
    id: "i6",
    name: "Customer Portal Launch",
    goLiveDate: "2026-09-15",
    status: "in-flight",
    owner: "Amara Diallo",
    description:
      "New self-service customer portal enabling online account management, billing, and fault lodgement. Reduces inbound call volumes.",
    impacts: { "People & Culture": 0, Sales: 2, Fibre: 1, Finance: 1, IT: 3, Procurement: 0, Operations: 2, "Customer Experience": 3 },
  },
  {
    id: "i7",
    name: "Field Operations Digitisation",
    goLiveDate: "2026-11-01",
    status: "planned",
    owner: "Tom Veillard",
    description:
      "Mobile-first tooling for field technicians. Digital job cards, real-time scheduling, and geo-tracking replace paper-based workflows.",
    impacts: { "People & Culture": 1, Sales: 0, Fibre: 3, Finance: 1, IT: 2, Procurement: 1, Operations: 3, "Customer Experience": 2 },
  },
];
