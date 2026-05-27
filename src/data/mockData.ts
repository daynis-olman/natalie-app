export type ImpactRating = 0 | 1 | 2 | 3;

/**
 * Business unit hierarchy — up to 3 levels:
 *  L1 = Business Unit (e.g. HR, Operations, Technology)
 *  L2 = Function (e.g. Recruitment, Quality, Engineering)
 *  L3 = Sub-function (e.g. DevOps, Architecture & Engineering)
 *
 * Impacts on initiatives are recorded against LEAF units only
 * (a unit with no children). Parent scores are rolled up by summing
 * the impacts of their descendants.
 */
export interface BusinessUnit {
  id: string;
  name: string;
  parentId: string | null;
  level: 1 | 2 | 3;
  lead?: string;
  headcount?: number;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  unitId: string; // home leaf unit
  /** Total weekly capacity expressed as percentage (typically 100). */
  capacity: number;
}

export interface Contributor {
  personId: string;
  /** Percentage of capacity this person is committing to the initiative. */
  allocation: number;
  /** Optional role on the initiative, e.g. "Tech Lead", "SME". */
  role?: string;
}

export interface Initiative {
  id: string;
  name: string;
  goLiveDate: string;
  status: "planned" | "in-flight" | "completed";
  owner: string;
  description: string;
  /** Keyed by LEAF BusinessUnit id. */
  impacts: Record<string, ImpactRating>;
  contributors: Contributor[];
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

// ──────────────────────────────────────────────────────────────────────────────
// Org structure
// ──────────────────────────────────────────────────────────────────────────────

export const BUSINESS_UNITS: BusinessUnit[] = [
  // ── HR ──────────────────────────────────────────────────────────────────────
  { id: "hr", name: "HR", parentId: null, level: 1, lead: "Sarah Mitchell", headcount: 18 },
  { id: "hr-rec", name: "Recruitment", parentId: "hr", level: 2, lead: "Priya Shah", headcount: 5 },
  { id: "hr-od", name: "Organisational Development", parentId: "hr", level: 2, lead: "Marcus Lee", headcount: 4 },
  { id: "hr-pay", name: "Payroll", parentId: "hr", level: 2, lead: "Ana Costa", headcount: 4 },
  { id: "hr-wr", name: "Workplace Relations", parentId: "hr", level: 2, lead: "Tom Reilly", headcount: 5 },

  // ── Operations ─────────────────────────────────────────────────────────────
  { id: "ops", name: "Operations", parentId: null, level: 1, lead: "Tom Veillard", headcount: 84 },
  { id: "ops-qa", name: "Quality", parentId: "ops", level: 2, lead: "Emma Wright", headcount: 12 },
  { id: "ops-cai", name: "Cloud & AI", parentId: "ops", level: 2, lead: "Jordan Kim", headcount: 16 },
  { id: "ops-is", name: "IS", parentId: "ops", level: 2, lead: "Chris Nakamura", headcount: 56 },
  { id: "ops-is-devops", name: "DevOps", parentId: "ops-is", level: 3, lead: "Daynis Olman", headcount: 18 },
  { id: "ops-is-arch", name: "Architecture & Engineering", parentId: "ops-is", level: 3, lead: "Rohan Patel", headcount: 22 },

  // ── Technology ─────────────────────────────────────────────────────────────
  { id: "tech", name: "Technology", parentId: null, level: 1, lead: "Amelia Hart", headcount: 62 },
  { id: "tech-ml", name: "Machine Learning", parentId: "tech", level: 2, lead: "Dr. Wei Chen", headcount: 14 },
  { id: "tech-eng", name: "Engineering", parentId: "tech", level: 2, lead: "Natalie Brooks", headcount: 28 },
  { id: "tech-cloud", name: "Cloud Services", parentId: "tech", level: 2, lead: "Felix Owusu", headcount: 20 },

  // ── Sales ──────────────────────────────────────────────────────────────────
  { id: "sales", name: "Sales", parentId: null, level: 1, lead: "James Thornton", headcount: 45 },
  { id: "sales-direct", name: "Direct Sales", parentId: "sales", level: 2, lead: "Olivia Hart", headcount: 28 },
  { id: "sales-channel", name: "Channel Partners", parentId: "sales", level: 2, lead: "Ben Carter", headcount: 17 },

  // ── Finance ────────────────────────────────────────────────────────────────
  { id: "fin", name: "Finance", parentId: null, level: 1, lead: "David Okonkwo", headcount: 24 },
  { id: "fin-acct", name: "Accounting", parentId: "fin", level: 2, lead: "Hana Suzuki", headcount: 14 },
  { id: "fin-fp", name: "Financial Planning", parentId: "fin", level: 2, lead: "Liam Walsh", headcount: 10 },

  // ── Customer Experience ────────────────────────────────────────────────────
  { id: "cx", name: "Customer Experience", parentId: null, level: 1, lead: "Amara Diallo", headcount: 38 },
  { id: "cx-cc", name: "Contact Centre", parentId: "cx", level: 2, lead: "Zara Ahmed", headcount: 26 },
  { id: "cx-fs", name: "Field Service", parentId: "cx", level: 2, lead: "Pete Larkin", headcount: 12 },

  // ── Fibre ──────────────────────────────────────────────────────────────────
  { id: "fib", name: "Fibre", parentId: null, level: 1, lead: "Priya Ramesh", headcount: 62 },
  { id: "fib-build", name: "Network Build", parentId: "fib", level: 2, lead: "Sam O'Connor", headcount: 34 },
  { id: "fib-ops", name: "Field Operations", parentId: "fib", level: 2, lead: "Mei Tanaka", headcount: 28 },

  // ── Procurement ────────────────────────────────────────────────────────────
  { id: "pro", name: "Procurement", parentId: null, level: 1, lead: "Lisa Brennan", headcount: 14 },
];

// ──────────────────────────────────────────────────────────────────────────────
// People
// ──────────────────────────────────────────────────────────────────────────────

export const PEOPLE: Person[] = [
  { id: "p-daynis", name: "Daynis Olman", role: "DevOps Lead", unitId: "ops-is-devops", capacity: 100 },
  { id: "p-natalie", name: "Natalie Brooks", role: "Engineering Manager", unitId: "tech-eng", capacity: 100 },
  { id: "p-james", name: "James Thornton", role: "Sales Director", unitId: "sales-direct", capacity: 100 },
  { id: "p-sarah", name: "Sarah Mitchell", role: "Chief People Officer", unitId: "hr", capacity: 100 },
  { id: "p-tom", name: "Tom Veillard", role: "COO", unitId: "ops", capacity: 100 },
  { id: "p-priya-s", name: "Priya Shah", role: "Talent Lead", unitId: "hr-rec", capacity: 100 },
  { id: "p-marcus", name: "Marcus Lee", role: "OD Partner", unitId: "hr-od", capacity: 100 },
  { id: "p-ana", name: "Ana Costa", role: "Payroll Manager", unitId: "hr-pay", capacity: 100 },
  { id: "p-rohan", name: "Rohan Patel", role: "Principal Architect", unitId: "ops-is-arch", capacity: 100 },
  { id: "p-jordan", name: "Jordan Kim", role: "Cloud & AI Lead", unitId: "ops-cai", capacity: 100 },
  { id: "p-wei", name: "Wei Chen", role: "ML Lead", unitId: "tech-ml", capacity: 100 },
  { id: "p-felix", name: "Felix Owusu", role: "Cloud Services Lead", unitId: "tech-cloud", capacity: 100 },
  { id: "p-david", name: "David Okonkwo", role: "CFO", unitId: "fin", capacity: 100 },
  { id: "p-hana", name: "Hana Suzuki", role: "Financial Controller", unitId: "fin-acct", capacity: 100 },
  { id: "p-amara", name: "Amara Diallo", role: "CX Director", unitId: "cx", capacity: 100 },
  { id: "p-zara", name: "Zara Ahmed", role: "Contact Centre Lead", unitId: "cx-cc", capacity: 100 },
  { id: "p-mei", name: "Mei Tanaka", role: "Field Ops Manager", unitId: "fib-ops", capacity: 100 },
];

// ──────────────────────────────────────────────────────────────────────────────
// Initiatives — impacts keyed by leaf unit id
// ──────────────────────────────────────────────────────────────────────────────

export const INITIATIVES: Initiative[] = [
  {
    id: "i1",
    name: "Salesforce CRM",
    goLiveDate: "2026-10-01",
    status: "in-flight",
    owner: "James Thornton",
    description:
      "Full CRM replacement across Sales and customer-facing teams. New pipeline management, quoting, and forecasting workflows.",
    impacts: {
      "sales-direct": 3, "sales-channel": 3,
      "fin-acct": 2, "fin-fp": 3,
      "ops-is-devops": 2, "ops-is-arch": 3, "ops-cai": 1,
      "tech-eng": 2,
      "cx-cc": 2,
      "fib-build": 1,
    },
    contributors: [
      { personId: "p-james", allocation: 60, role: "Executive Sponsor" },
      { personId: "p-daynis", allocation: 30, role: "Integration Lead" },
      { personId: "p-natalie", allocation: 50, role: "Tech Lead" },
      { personId: "p-rohan", allocation: 25, role: "Architect" },
      { personId: "p-zara", allocation: 20, role: "CX SME" },
    ],
  },
  {
    id: "i2",
    name: "Burnley Office Consolidation",
    goLiveDate: "2026-12-22",
    status: "planned",
    owner: "Sarah Mitchell",
    description:
      "Physical relocation and consolidation of Burnley office. Affects workspace design, team adjacencies, and hybrid working arrangements.",
    impacts: {
      "hr-wr": 3, "hr-od": 2,
      "sales-direct": 1,
      "fib-build": 1, "fib-ops": 2,
      "fin-acct": 2,
      "ops-is-devops": 2, "ops-is-arch": 2, "ops-cai": 1,
      "pro": 3,
    },
    contributors: [
      { personId: "p-sarah", allocation: 50, role: "Executive Sponsor" },
      { personId: "p-marcus", allocation: 40, role: "Change Lead" },
      { personId: "p-tom", allocation: 20 },
    ],
  },
  {
    id: "i3",
    name: "Time & Attendance System",
    goLiveDate: "2026-08-01",
    status: "in-flight",
    owner: "Sarah Mitchell",
    description:
      "Replacement of legacy timekeeping system. New rostering, leave management, and payroll integration for all shift-based workers.",
    impacts: {
      "hr-pay": 3, "hr-wr": 2,
      "fib-ops": 3, "fib-build": 2,
      "fin-acct": 2,
      "ops-is-devops": 2,
      "tech-eng": 1,
    },
    contributors: [
      { personId: "p-ana", allocation: 70, role: "Product Owner" },
      { personId: "p-daynis", allocation: 40, role: "Integration" },
      { personId: "p-mei", allocation: 35, role: "Field SME" },
      { personId: "p-hana", allocation: 15 },
    ],
  },
  {
    id: "i4",
    name: "Operating Model Redesign",
    goLiveDate: "2027-07-01",
    status: "planned",
    owner: "David Okonkwo",
    description:
      "Enterprise-wide operating model transformation. New accountability structures, revised reporting lines, and updated ways of working across all functions.",
    impacts: {
      "hr-od": 3, "hr-wr": 3, "hr-rec": 2, "hr-pay": 1,
      "sales-direct": 3, "sales-channel": 2,
      "fib-build": 3, "fib-ops": 3,
      "fin-acct": 3, "fin-fp": 3,
      "ops-qa": 3, "ops-cai": 2, "ops-is-devops": 2, "ops-is-arch": 3,
      "tech-ml": 2, "tech-eng": 3, "tech-cloud": 2,
      "pro": 3,
      "cx-cc": 3, "cx-fs": 3,
    },
    contributors: [
      { personId: "p-david", allocation: 60, role: "Executive Sponsor" },
      { personId: "p-sarah", allocation: 50 },
      { personId: "p-tom", allocation: 40 },
      { personId: "p-natalie", allocation: 25 },
      { personId: "p-marcus", allocation: 50, role: "Change Lead" },
    ],
  },
  {
    id: "i5",
    name: "Finance System Upgrade",
    goLiveDate: "2027-03-01",
    status: "planned",
    owner: "David Okonkwo",
    description:
      "Core financial system migration to cloud ERP. New chart of accounts, revised month-end processes, and updated procurement integration.",
    impacts: {
      "hr-pay": 1,
      "fin-acct": 3, "fin-fp": 3,
      "ops-is-arch": 2, "ops-cai": 1, "ops-is-devops": 1,
      "tech-cloud": 2, "tech-eng": 1,
      "pro": 2,
    },
    contributors: [
      { personId: "p-david", allocation: 40, role: "Executive Sponsor" },
      { personId: "p-hana", allocation: 70, role: "Finance Lead" },
      { personId: "p-felix", allocation: 35, role: "Cloud Architect" },
      { personId: "p-rohan", allocation: 20 },
    ],
  },
  {
    id: "i6",
    name: "Customer Portal Launch",
    goLiveDate: "2026-09-15",
    status: "in-flight",
    owner: "Amara Diallo",
    description:
      "New self-service customer portal enabling online account management, billing, and fault lodgement. Reduces inbound call volumes.",
    impacts: {
      "sales-direct": 2,
      "fib-ops": 1,
      "fin-acct": 1,
      "ops-is-devops": 3, "ops-is-arch": 2, "ops-cai": 2,
      "tech-eng": 3, "tech-cloud": 2, "tech-ml": 1,
      "cx-cc": 3, "cx-fs": 2,
    },
    contributors: [
      { personId: "p-amara", allocation: 50, role: "Executive Sponsor" },
      { personId: "p-natalie", allocation: 60, role: "Tech Lead" },
      { personId: "p-daynis", allocation: 35 },
      { personId: "p-wei", allocation: 25, role: "ML SME" },
      { personId: "p-zara", allocation: 40, role: "CX Lead" },
    ],
  },
  {
    id: "i7",
    name: "Field Operations Digitisation",
    goLiveDate: "2026-11-01",
    status: "planned",
    owner: "Tom Veillard",
    description:
      "Mobile-first tooling for field technicians. Digital job cards, real-time scheduling, and geo-tracking replace paper-based workflows.",
    impacts: {
      "hr-wr": 1,
      "fib-build": 3, "fib-ops": 3,
      "fin-acct": 1,
      "ops-is-devops": 2, "ops-cai": 2,
      "tech-eng": 2, "tech-cloud": 1,
      "pro": 1,
      "cx-fs": 3, "cx-cc": 1,
    },
    contributors: [
      { personId: "p-tom", allocation: 50, role: "Executive Sponsor" },
      { personId: "p-mei", allocation: 60, role: "Field Ops Lead" },
      { personId: "p-jordan", allocation: 30 },
      { personId: "p-natalie", allocation: 20 },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

export function getChildren(units: BusinessUnit[], parentId: string | null): BusinessUnit[] {
  return units.filter((u) => u.parentId === parentId);
}

export function isLeaf(units: BusinessUnit[], unit: BusinessUnit): boolean {
  return !units.some((u) => u.parentId === unit.id);
}

export function getLeafUnits(units: BusinessUnit[]): BusinessUnit[] {
  return units.filter((u) => isLeaf(units, u));
}

/** Returns the unit and all of its descendants. */
export function getDescendants(units: BusinessUnit[], unitId: string): BusinessUnit[] {
  const out: BusinessUnit[] = [];
  const walk = (id: string) => {
    for (const child of units.filter((u) => u.parentId === id)) {
      out.push(child);
      walk(child.id);
    }
  };
  walk(unitId);
  return out;
}

export function getUnitPath(units: BusinessUnit[], unitId: string): BusinessUnit[] {
  const map = new Map(units.map((u) => [u.id, u]));
  const path: BusinessUnit[] = [];
  let cur = map.get(unitId);
  while (cur) {
    path.unshift(cur);
    cur = cur.parentId ? map.get(cur.parentId) : undefined;
  }
  return path;
}

/**
 * Legacy export — some screens still want a flat list of "areas" to show
 * as columns. Default to leaf units.
 */
export const BUSINESS_AREAS = getLeafUnits(BUSINESS_UNITS);
