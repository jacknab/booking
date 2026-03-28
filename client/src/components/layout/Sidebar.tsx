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
  Puzzle,
  BarChart3,
  Globe,
  MessageSquare,
  Mail,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/services", label: "Services", icon: Scissors },
  // { to: "/addons", label: "Add-Ons", icon: Puzzle }, // Hidden
  { to: "/staff", label: "Staff", icon: UserCircle },
  { to: "/products", label: "Products", icon: ShoppingBag },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/cash-drawer", label: "Cash Drawer", icon: Banknote },
  { to: "/commission-report", label: "Commissions", icon: BarChart3 },
  { to: "/online-booking", label: "Online Booking", icon: Globe },
  { to: "/sms-settings", label: "SMS Notifications", icon: MessageSquare },
  { to: "/mail-settings", label: "Email Notifications", icon: Mail },
  { to: "/business-settings", label: "Business Settings", icon: Building2 },
  { to: "/calendar-settings", label: "Calendar Settings", icon: Settings },
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
        
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => {
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
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
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
