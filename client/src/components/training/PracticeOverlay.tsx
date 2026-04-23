/**
 * Phase 9.3 — PracticeOverlay portal.
 *
 * Mounts a fixed, ~90% viewport overlay above the live app so the live
 * calendar stays visible at the edges (a constant reminder you're in
 * practice, not production). Closes on ✕, Esc, and outside-click.
 *
 * Phase 9.4 will mount the full app routes inside `<main>` against a
 * sandbox storeId. For now this is an empty shell with a header — enough to
 * verify open/close UX and the portal plumbing.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MemoryRouter } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Beaker, X, Loader2, Sparkles } from "lucide-react";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import { SandboxStoreProvider } from "@/components/training/SandboxStoreProvider";
import { SandboxRoutes } from "@/components/training/SandboxRoutes";
import { PracticePersistence } from "@/components/training/PracticePersistence";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Scenario = { key: string; label: string; description: string };

function ScenarioPicker() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const { data } = useQuery<{ scenarios: Scenario[] }>({
    queryKey: ["/api/training/sandbox/scenarios"],
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async (scenario: string) => {
      const res = await apiRequest("POST", "/api/training/sandbox/scenario", { scenario });
      return res.json();
    },
    onSuccess: (result, scenario) => {
      const label = data?.scenarios.find((s) => s.key === scenario)?.label ?? "Scenario";
      toast({
        title: `${label} loaded`,
        description: `${result.appointmentsCreated ?? 0} practice bookings ready to work through.`,
      });
      // Refresh anything reading appointments/customers in the sandbox view.
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setOpen(false);
    },
    onError: () => {
      toast({ title: "Could not load scenario", variant: "destructive" });
    },
  });

  // Click-outside to close.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const scenarios = data?.scenarios ?? [];

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={mutation.isPending}
        data-testid="button-scenario-picker"
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border border-amber-300 dark:border-amber-700 bg-white/60 dark:bg-amber-900/40 hover:bg-white dark:hover:bg-amber-900/60 transition-colors disabled:opacity-60"
      >
        {mutation.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        Quick Scenarios
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg z-10 overflow-hidden"
          data-testid="menu-scenarios"
        >
          <div className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground border-b">
            Load themed practice data
          </div>
          {scenarios.length === 0 && (
            <div className="px-3 py-3 text-sm text-muted-foreground">Loading…</div>
          )}
          {scenarios.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => mutation.mutate(s.key)}
              disabled={mutation.isPending}
              data-testid={`button-scenario-${s.key}`}
              className="w-full text-left px-3 py-2.5 hover:bg-muted transition-colors block disabled:opacity-60"
            >
              <div className="text-sm font-medium">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PracticeOverlay() {
  const { inPractice, exitPractice } = usePracticeMode();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Esc to close
  useEffect(() => {
    if (!inPractice) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        exitPractice();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [inPractice, exitPractice]);

  // Lock body scroll while open so the page underneath doesn't shift on
  // open/close — also kills the perceived "lag" the plan calls out.
  useEffect(() => {
    if (!inPractice) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [inPractice]);

  if (!inPractice) return null;

  const onBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      exitPractice();
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Practice mode"
      data-testid="practice-overlay"
      onMouseDown={onBackdropMouseDown}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div
        ref={panelRef}
        className="relative w-[90vw] h-[90vh] bg-background rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-4 py-2.5 border-b bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Beaker className="w-4 h-4" />
            Practice Mode
            <span className="text-xs font-normal opacity-70">
              · nothing here is real · changes reset nightly
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ScenarioPicker />
            <button
              type="button"
              onClick={exitPractice}
              data-testid="button-practice-close"
              className="p-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              aria-label="Close practice mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-auto bg-background">
          {/*
           * MemoryRouter keeps practice navigation isolated from the live URL,
           * so a trainee clicking around inside the overlay never changes the
           * browser address bar. SandboxStoreProvider overrides StoreContext
           * so every reused page component reads/writes the sandbox store.
           * PracticePersistence (Phase 9.5) restores the previous path +
           * scroll position so re-opening picks up exactly where you left off.
           */}
          <MemoryRouter initialEntries={["/calendar"]}>
            <PracticePersistence scrollRef={scrollRef} />
            <SandboxStoreProvider>
              <SandboxRoutes />
            </SandboxStoreProvider>
          </MemoryRouter>
        </div>
      </div>
    </div>,
    document.body,
  );
}
