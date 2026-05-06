import { CalendarPlus, Clock, DollarSign, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onBook: () => void;
  onToday: () => void;
  onLookup: () => void;
  onCheckout: () => void;
  posEnabled: boolean;
  isToday: boolean;
}

export function MobileBottomNav({
  onBook,
  onToday,
  onLookup,
  onCheckout,
  posEnabled,
  isToday,
}: MobileBottomNavProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden select-none"
      style={{ height: 100 }}
    >
      {/* SVG background — crown molding arch */}
      <svg
        viewBox="0 0 414 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full drop-shadow-[0_-4px_16px_rgba(0,0,0,0.10)]"
        aria-hidden
      >
        {/* Bar + arch fill */}
        <path
          d="M 0 100 L 0 68 H 114 C 142 68 156 0 207 0 C 258 0 272 68 300 68 H 414 V 100 Z"
          className="fill-card"
        />
        {/* Top border of flat bar sections */}
        <line x1="0" y1="68" x2="114" y2="68" className="stroke-border" strokeWidth="1" />
        <line x1="300" y1="68" x2="414" y2="68" className="stroke-border" strokeWidth="1" />
        {/* Crown molding — the decorative arch stroke over the circle */}
        <path
          d="M 0 68 H 114 C 142 68 156 0 207 0 C 258 0 272 68 300 68 H 414"
          fill="none"
          className="stroke-border"
          strokeWidth="1"
        />
        {/* Inner crown detail — a second, inset arch line for the "molding" depth effect */}
        <path
          d="M 114 68 C 140 68 157 8 207 8 C 257 8 274 68 300 68"
          fill="none"
          className="stroke-border/40"
          strokeWidth="0.75"
          strokeDasharray="3 3"
        />
      </svg>

      {/* FAB — large circle button, centered at the arch peak */}
      <button
        onClick={onBook}
        data-testid="mobile-fab-new-appointment"
        aria-label="New appointment"
        className={cn(
          "absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full",
          "bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(0,0,0,0.22)]",
          "active:scale-95 transition-transform duration-100",
          "ring-4 ring-card"
        )}
        style={{ top: 4, width: 60, height: 60 }}
      >
        <CalendarPlus className="w-6 h-6" />
      </button>

      {/* Left side buttons */}
      <div className="absolute left-0 flex items-center justify-around"
        style={{ top: 68, bottom: 0, width: "calc(50% - 46px)" }}
      >
        {/* Today button */}
        <button
          onClick={onToday}
          data-testid="mobile-nav-today"
          aria-label="Go to today"
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors",
            isToday
              ? "text-primary"
              : "text-muted-foreground active:text-foreground"
          )}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">Today</span>
        </button>

        {/* Look up button */}
        <button
          onClick={onLookup}
          data-testid="mobile-nav-lookup"
          aria-label="Look up appointment"
          className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg text-muted-foreground active:text-foreground transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">Search</span>
        </button>
      </div>

      {/* Right side buttons */}
      <div className="absolute right-0 flex items-center justify-around"
        style={{ top: 68, bottom: 0, width: "calc(50% - 46px)" }}
      >
        {/* Checkout button */}
        {posEnabled ? (
          <button
            onClick={onCheckout}
            data-testid="mobile-nav-checkout"
            aria-label="Quick checkout"
            className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg text-muted-foreground active:text-foreground transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">Checkout</span>
          </button>
        ) : (
          <div />
        )}

        {/* Spacer slot (can add a 4th button here later) */}
        <div className="w-12" />
      </div>

      {/* iPhone home-indicator safe area */}
      <div className="absolute bottom-0 left-0 right-0 bg-card" style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
    </div>
  );
}
