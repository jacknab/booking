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
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Beaker, X } from "lucide-react";
import { usePracticeMode } from "@/contexts/PracticeModeContext";

export function PracticeOverlay() {
  const { inPractice, exitPractice } = usePracticeMode();
  const panelRef = useRef<HTMLDivElement | null>(null);

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
          <button
            type="button"
            onClick={exitPractice}
            data-testid="button-practice-close"
            className="p-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            aria-label="Close practice mode"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-auto bg-muted/20">
          {/* Phase 9.4 will mount the sandbox-scoped app routes here. */}
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center max-w-md p-8">
              <Beaker className="w-10 h-10 mx-auto mb-3 opacity-60" />
              <p className="font-medium text-foreground mb-1">
                Practice surface ready.
              </p>
              <p>
                Phase 9.4 will mount the full app here against a sandbox store, so
                you can drill bookings, check-outs, and walk-ins without affecting
                live data.
              </p>
              <p className="mt-3 text-xs">
                Press <kbd className="px-1.5 py-0.5 rounded border bg-background">Esc</kbd>,
                click the ✕, or click outside this panel to close.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
