import { Link, useLocation, useNavigate } from "react-router-dom";
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
  BarChart3,
  Globe,
  MessageSquare,
  Mail,
  Moon,
  Sun,
  TrendingUp,
  Clock,
  Gift,
  ClipboardList,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/analytics", label: "Analytics", icon: TrendingUp },
      { to: "/calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    label: "Clients",
    items: [
      { to: "/customers", label: "Customers", icon: Users },
      { to: "/waitlist", label: "Waitlist", icon: Clock },
      { to: "/loyalty", label: "Loyalty Program", icon: Star },
    ],
  },
  {
    label: "Business",
    items: [
      { to: "/services", label: "Services", icon: Scissors },
      { to: "/staff", label: "Staff", icon: UserCircle },
      { to: "/products", label: "Products", icon: ShoppingBag },
      { to: "/gift-cards", label: "Gift Cards", icon: Gift },
      { to: "/intake-forms", label: "Intake Forms", icon: ClipboardList },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/cash-drawer", label: "Cash Drawer", icon: Banknote },
      { to: "/commission-report", label: "Commissions", icon: BarChart3 },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/online-booking", label: "Online Booking", icon: Globe },
      { to: "/sms-settings", label: "SMS Notifications", icon: MessageSquare },
      { to: "/mail-settings", label: "Email Notifications", icon: Mail },
      { to: "/business-settings", label: "Business Settings", icon: Building2 },
      { to: "/calendar-settings", label: "Calendar Settings", icon: Settings },
    ],
  },
];

export function Sidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutAsync, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logoutAsync();
    } catch {}
    navigate("/auth");
  };

  return (
    <aside className="border-r bg-muted/40 w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold" onClick={onLinkClick}>
            <img src="/web-app.png" alt="Logo" className="h-6 w-6" />
            <span>Booking System</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <nav className="px-2 text-sm font-medium lg:px-4 pb-4">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                        isActive
                          ? "bg-muted text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
              {user?.firstName?.[0] || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
