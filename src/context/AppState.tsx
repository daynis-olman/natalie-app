import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BUSINESS_UNITS,
  INITIATIVES,
  PEOPLE,
  getLeafUnits,
  getDescendants,
  type BusinessUnit,
  type Initiative,
  type Person,
} from "@/data/mockData";

type Theme = "light" | "dark";

/** Which level of the org tree to display as columns in heatmap/timeline. */
export type ViewLevel = 1 | 2 | 3;

interface AppState {
  initiatives: Initiative[];
  addInitiative: (i: Initiative) => void;
  updateInitiative: (i: Initiative) => void;
  deleteInitiative: (id: string) => void;
  /** Filter is a unit id (any level) or "all". */
  areaFilter: string;
  setAreaFilter: (v: string) => void;
  theme: Theme;
  toggleTheme: () => void;

  /** Full hierarchical unit list. */
  units: BusinessUnit[];
  /** Leaf units only — where impacts are actually recorded. */
  leafUnits: BusinessUnit[];
  /** People directory. */
  people: Person[];
  addPerson: (p: Person) => void;
  removePerson: (id: string) => void;

  /** Org structure mutations. */
  addUnit: (u: BusinessUnit) => void;
  updateUnit: (u: BusinessUnit) => void;
  removeUnit: (id: string) => void;

  /** Current view granularity for grids that show units as columns. */
  viewLevel: ViewLevel;
  setViewLevel: (l: ViewLevel) => void;

  /** Units to display as columns at the current view level. */
  displayUnits: BusinessUnit[];

  /**
   * Returns the rolled-up impact score for an initiative against a unit
   * (sum of impacts on the unit's leaf descendants, or its own impact if leaf).
   */
  scoreFor: (initiative: Initiative, unitId: string) => number;

  /**
   * Compatibility alias — older components reference `areas`.
   * Returns the current `displayUnits`.
   */
  areas: BusinessUnit[];
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [initiatives, setInitiatives] = useState<Initiative[]>(INITIATIVES);
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [theme, setTheme] = useState<Theme>("light");
  const [viewLevel, setViewLevel] = useState<ViewLevel>(2);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const [units, setUnits] = useState<BusinessUnit[]>(BUSINESS_UNITS);
  const leafUnits = useMemo(() => getLeafUnits(units), [units]);
  const [people, setPeople] = useState<Person[]>(PEOPLE);

  const displayUnits = useMemo(() => {
    // Show units AT the chosen level. For units that are leaves at a higher
    // level than the requested one (e.g. Procurement is a leaf at L1), include
    // them so nothing is hidden.
    const list = units.filter(
      (u) => u.level === viewLevel || (u.level < viewLevel && !units.some((c) => c.parentId === u.id)),
    );
    if (areaFilter === "all") return list;
    const filter = units.find((u) => u.id === areaFilter);
    if (!filter) return list;
    const descendantIds = new Set([filter.id, ...getDescendants(units, filter.id).map((d) => d.id)]);
    return list.filter((u) => descendantIds.has(u.id));
  }, [units, viewLevel, areaFilter]);

  const scoreFor = useMemo(
    () => (initiative: Initiative, unitId: string): number => {
      const unit = units.find((u) => u.id === unitId);
      if (!unit) return 0;
      const isLeafUnit = !units.some((u) => u.parentId === unit.id);
      if (isLeafUnit) return initiative.impacts[unit.id] ?? 0;
      return getDescendants(units, unit.id)
        .filter((d) => !units.some((c) => c.parentId === d.id))
        .reduce((s, leaf) => s + (initiative.impacts[leaf.id] ?? 0), 0);
    },
    [units],
  );

  const value = useMemo<AppState>(
    () => ({
      initiatives,
      addInitiative: (i) => setInitiatives((prev) => [...prev, i]),
      updateInitiative: (i) => setInitiatives((prev) => prev.map((p) => (p.id === i.id ? i : p))),
      deleteInitiative: (id) => setInitiatives((prev) => prev.filter((p) => p.id !== id)),
      areaFilter,
      setAreaFilter,
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      units,
      leafUnits,
      people,
      addPerson: (p) => setPeople((prev) => [...prev, p]),
      removePerson: (id) => {
        setPeople((prev) => prev.filter((p) => p.id !== id));
        setInitiatives((prev) =>
          prev.map((i) => ({ ...i, contributors: i.contributors.filter((c) => c.personId !== id) })),
        );
      },
      addUnit: (u) => setUnits((prev) => [...prev, u]),
      updateUnit: (u) => setUnits((prev) => prev.map((x) => (x.id === u.id ? u : x))),
      removeUnit: (id) => {
        setUnits((prev) => {
          const toRemove = new Set<string>([id, ...getDescendants(prev, id).map((d) => d.id)]);
          return prev.filter((u) => !toRemove.has(u.id));
        });
        // Cascade: drop people in removed units; drop impacts keyed on removed leaves.
        const removedIds = new Set<string>([id, ...getDescendants(units, id).map((d) => d.id)]);
        setPeople((prev) => prev.filter((p) => !removedIds.has(p.unitId)));
        setInitiatives((prev) =>
          prev.map((i) => {
            const impacts = { ...i.impacts };
            for (const k of Object.keys(impacts)) if (removedIds.has(k)) delete impacts[k];
            return { ...i, impacts };
          }),
        );
      },
      viewLevel,
      setViewLevel,
      displayUnits,
      scoreFor,
      areas: displayUnits,
    }),
    [initiatives, areaFilter, theme, units, leafUnits, people, viewLevel, displayUnits, scoreFor],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
