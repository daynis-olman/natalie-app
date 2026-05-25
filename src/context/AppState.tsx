import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { BUSINESS_AREAS, INITIATIVES, type Initiative } from "@/data/mockData";

type Theme = "light" | "dark";

interface AppState {
  initiatives: Initiative[];
  addInitiative: (i: Initiative) => void;
  updateInitiative: (i: Initiative) => void;
  deleteInitiative: (id: string) => void;
  areaFilter: string; // "all" or area name
  setAreaFilter: (v: string) => void;
  theme: Theme;
  toggleTheme: () => void;
  areas: typeof BUSINESS_AREAS;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [initiatives, setInitiatives] = useState<Initiative[]>(INITIATIVES);
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

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
      areas: BUSINESS_AREAS,
    }),
    [initiatives, areaFilter, theme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
