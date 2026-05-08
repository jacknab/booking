import { CalendarDays, Users, ClipboardList, Megaphone, Receipt } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { icon: CalendarDays, label: "Calendar",  to: "/calendar" },
  { icon: Users,        label: "Clients",   to: "/customers" },
  { icon: ClipboardList,label: "Queue",     to: "/queue" },
  { icon: Megaphone,    label: "Marketing", to: "/marketing" },
  { icon: Receipt,      label: "Checkout",  to: "/pos" },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();
  return (
    <div
      className={cn(
        "fixed bottom-0 inset-x-0 z-50 md:hidden flex items-stretch",
        "bg-background border-t border-border",
        "dark:bg-[#0f172a] dark:border-white/[0.07]"
      )}
      style={{
        height: "calc(56px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map(({ icon: Icon, label, to }) => {
        const active = pathname === to || (to === "/calendar" && pathname.startsWith("/calendar"));
        return (
          <Link
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] select-none active:opacity-50 transition-opacity relative"
          >
            {active && (
              <span className="absolute top-0 inset-x-0 flex justify-center">
                <span className="w-5 h-[2px] rounded-full bg-primary dark:bg-white/80" />
              </span>
            )}
            <Icon
              className={cn(
                "w-[22px] h-[22px] transition-colors",
                active
                  ? "text-primary dark:text-white"
                  : "text-muted-foreground dark:text-white/55"
              )}
              strokeWidth={active ? 2.2 : 1.7}
            />
            <span
              className={cn(
                "text-[10px] font-medium leading-none transition-colors",
                active
                  ? "text-primary dark:text-white"
                  : "text-muted-foreground dark:text-white/55"
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
