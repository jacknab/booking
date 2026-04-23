import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export type TrainingEventType =
  | "view"
  | "success"
  | "hesitation"
  | "wrong-click"
  | "help-requested"
  | "abandoned";

interface TrainingCategory {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  defaultHelpLevel: number;
  highRisk: boolean;
}

interface TrainingState {
  id: number;
  categoryId: number;
  helpLevel: number;
  successStreak: number;
  failures: number;
  totalAttempts: number;
  lastSeenAt: string | null;
  graduatedAt: string | null;
  pinnedLevel: number | null;
}

interface TrainingProfile {
  userId: string;
  enrolledAt: string;
  graduatedAt: string | null;
  graduationNotifiedOwner: boolean;
}

interface TrainingStateResponse {
  enrolled: boolean;
  profile: TrainingProfile | null;
  categories: TrainingCategory[];
  state: TrainingState[];
}

interface TrainingContextValue {
  enabled: boolean;
  profile: TrainingProfile | null;
  graduated: boolean;
  /** Returns the current help level (0..3) for a category. 3 if unknown. */
  getHelpLevel: (categorySlug: string) => number;
  /** True if the user has graduated this category (silent forever). */
  isCategoryGraduated: (categorySlug: string) => boolean;
  /** Records an event and optimistically updates local state. */
  recordEvent: (categorySlug: string, type: TrainingEventType, metadata?: Record<string, unknown>) => Promise<void>;
}

const TrainingContext = createContext<TrainingContextValue | null>(null);

const DEFAULT_HELP_LEVEL = 3;

export function TrainingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<TrainingState>>>({});

  // Throttle: drop duplicate events of the same (slug,type) within 1.5s.
  const lastEventRef = useRef<Map<string, number>>(new Map());

  const enabled = !!user;

  const { data } = useQuery<TrainingStateResponse>({
    queryKey: ["/api/training/state"],
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const categoriesBySlug = useMemo(() => {
    const map = new Map<string, TrainingCategory>();
    data?.categories?.forEach((c) => map.set(c.slug, c));
    return map;
  }, [data]);

  const stateByCategoryId = useMemo(() => {
    const map = new Map<number, TrainingState>();
    data?.state?.forEach((s) => map.set(s.categoryId, s));
    return map;
  }, [data]);

  const getHelpLevel = useCallback(
    (slug: string) => {
      const override = localOverrides[slug];
      if (override?.pinnedLevel != null) return override.pinnedLevel;
      if (override?.helpLevel != null) return override.helpLevel;
      const cat = categoriesBySlug.get(slug);
      if (!cat) return DEFAULT_HELP_LEVEL;
      const s = stateByCategoryId.get(cat.id);
      if (!s) return cat.defaultHelpLevel;
      if (s.pinnedLevel != null) return s.pinnedLevel;
      return s.helpLevel;
    },
    [categoriesBySlug, stateByCategoryId, localOverrides],
  );

  const isCategoryGraduated = useCallback(
    (slug: string) => {
      const override = localOverrides[slug];
      if (override?.graduatedAt) return true;
      const cat = categoriesBySlug.get(slug);
      if (!cat) return false;
      const s = stateByCategoryId.get(cat.id);
      return !!s?.graduatedAt;
    },
    [categoriesBySlug, stateByCategoryId, localOverrides],
  );

  const recordEvent = useCallback(
    async (slug: string, type: TrainingEventType, metadata?: Record<string, unknown>) => {
      if (!enabled) return;
      // Throttle
      const key = `${slug}:${type}`;
      const now = Date.now();
      const last = lastEventRef.current.get(key) ?? 0;
      if (now - last < 1500) return;
      lastEventRef.current.set(key, now);

      const helpLevelAtTime = getHelpLevel(slug);
      try {
        const res = await apiRequest("POST", "/api/training/event", {
          categorySlug: slug,
          type,
          helpLevelAtTime,
          metadata,
        });
        const json = await res.json();
        if (json?.state) {
          // Apply optimistic local override; the next /state refetch will reconcile.
          setLocalOverrides((prev) => ({
            ...prev,
            [slug]: {
              helpLevel: json.state.helpLevel,
              successStreak: json.state.successStreak,
              failures: json.state.failures,
              totalAttempts: json.state.totalAttempts,
              graduatedAt: json.state.graduatedAt ?? null,
            },
          }));
        }
      } catch (err) {
        // Training is non-critical — never break the host app.
        if (import.meta.env.DEV) console.warn("[training] recordEvent failed", err);
      }
    },
    [enabled, getHelpLevel],
  );

  // Refresh canonical state every 5 minutes so overrides don't drift forever.
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/state"] });
      setLocalOverrides({});
    }, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [enabled, queryClient]);

  const value: TrainingContextValue = useMemo(
    () => ({
      enabled,
      profile: data?.profile ?? null,
      graduated: !!data?.profile?.graduatedAt,
      getHelpLevel,
      isCategoryGraduated,
      recordEvent,
    }),
    [enabled, data, getHelpLevel, isCategoryGraduated, recordEvent],
  );

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}

export function useTraining(): TrainingContextValue {
  const ctx = useContext(TrainingContext);
  if (!ctx) {
    // Safe fallback: training is opt-in. Components can still call hooks.
    return {
      enabled: false,
      profile: null,
      graduated: false,
      getHelpLevel: () => DEFAULT_HELP_LEVEL,
      isCategoryGraduated: () => false,
      recordEvent: async () => {},
    };
  }
  return ctx;
}

/**
 * Convenience hook for a single category. Returns the current help level
 * and a `record` function pre-bound to that category.
 */
export function useTrainingCategory(slug: string) {
  const { getHelpLevel, isCategoryGraduated, recordEvent, enabled } = useTraining();
  const helpLevel = getHelpLevel(slug);
  const graduated = isCategoryGraduated(slug);
  const record = useCallback(
    (type: TrainingEventType, metadata?: Record<string, unknown>) =>
      recordEvent(slug, type, metadata),
    [recordEvent, slug],
  );
  return { enabled, helpLevel, graduated, record };
}
