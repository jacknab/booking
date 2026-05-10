import { CalendarDays, TrendingUp, Users, AlignJustify } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { icon: CalendarDays, to: "/calendar",        label: "Calendar" },
  { icon: TrendingUp,   to: "/reports",          label: "Analytics" },
  { icon: Users,        to: "/dashboard/queue",  label: "Crew" },
  { icon: AlignJustify, to: "/settings",         label: "Menu" },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();
  return (
    <div
      className={cn(
        "fixed bottom-0 inset-x-0 z-50 md:hidden flex items-stretch",
        "bg-white border-t border-gray-100",
      )}
      style={{
        height: "calc(60px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map(({ icon: Icon, label, to }) => {
        const active =
          pathname === to ||
          (to === "/calendar" && pathname.startsWith("/calendar"));
        return (
          <Link
            key={to}
            to={to}
            aria-label={label}
            className="flex-1 flex flex-col items-center justify-center select-none active:opacity-50 transition-opacity"
          >
            <Icon
              className={cn(
                "transition-colors",
                active ? "text-teal-500" : "text-slate-400"
              )}
              size={24}
              strokeWidth={active ? 2.2 : 1.8}
            />
          </Link>
        );
      })}
    </div>
  );
}
