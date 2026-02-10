import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  ShoppingBag, 
  LogOut,
  UserCircle,
  Banknote,
  Settings,
  Building2,
  Puzzle,
  BarChart3,
  Globe,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/services", label: "Services", icon: Scissors },
  { href: "/addons", label: "Add-Ons", icon: Puzzle },
  { href: "/staff", label: "Staff", icon: UserCircle },
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/cash-drawer", label: "Cash Drawer", icon: Banknote },
  { href: "/commission-report", label: "Commissions", icon: BarChart3 },
  { href: "/online-booking", label: "Online Booking", icon: Globe },
  { href: "/sms-settings", label: "SMS Notifications", icon: MessageSquare },
  { href: "/business-settings", label: "Business Settings", icon: Building2 },
  { href: "/calendar-settings", label: "Calendar Settings", icon: Settings },
];

export function Sidebar() {
  const [location, navigate] = useLocation();
  const { logoutAsync, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutAsync();
    } catch {}
    navigate("/auth");
  };

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-card z-20">
      <div className="p-6 border-b">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Scissors className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Zolmi Clone</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.firstName?.[0] || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium transition-colors"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
