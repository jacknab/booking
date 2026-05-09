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
  Megaphone,
  Key,
  TrendingUp,
  Clock,
  Gift,
  ClipboardList,
  Star,
  ThumbsUp,
  MapPin,
  FileText,
  ListOrdered,
  GraduationCap,
} from "lucide-react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useSelectedStore } from "@/hooks/use-store";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@shared/permissions";
import { useQuery } from "@tanstack/react-query";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: string;
  anyOf?: string[];
  hideForStaff?: boolean;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, hideForStaff: true },
      { to: "/analytics", label: "Analytics", icon: TrendingUp, permission: PERMISSIONS.REPORTS_VIEW, hideForStaff: true },
      { to: "/calendar", label: "Calendar", icon: Calendar, anyOf: [PERMISSIONS.APPOINTMENTS_VIEW_ALL, PERMISSIONS.APPOINTMENTS_VIEW_OWN] },
    ],
  },
  {
    label: "Clients",
    items: [
      { to: "/customers", label: "Customers", icon: Users, permission: PERMISSIONS.CUSTOMERS_VIEW },
      { to: "/waitlist", label: "Waitlist", icon: Clock, permission: PERMISSIONS.CUSTOMERS_VIEW },
      { to: "/dashboard/queue", label: "Queue", icon: ListOrdered },
      { to: "/loyalty", label: "Loyalty Program", icon: Star, permission: PERMISSIONS.CUSTOMERS_VIEW },
      { to: "/reviews", label: "Reviews", icon: ThumbsUp },
      { to: "/sms-inbox", label: "SMS Inbox", icon: MessageSquare, permission: PERMISSIONS.CUSTOMERS_VIEW },
      { to: "/sms-activity", label: "SMS Activity", icon: MessageSquare, permission: PERMISSIONS.REPORTS_VIEW },
      { to: "/campaigns", label: "Campaigns", icon: Megaphone, permission: PERMISSIONS.CUSTOMERS_VIEW },
      { to: "/google-business", label: "Google Reviews", icon: MapPin, permission: PERMISSIONS.INTEGRATIONS_MANAGE },
    ],
  },
  {
    label: "Business",
    items: [
      { to: "/services", label: "Services", icon: Scissors, permission: PERMISSIONS.SERVICES_MANAGE, hideForStaff: true },
      { to: "/staff", label: "Team", icon: UserCircle, permission: PERMISSIONS.STAFF_MANAGE, hideForStaff: true },
      { to: "/dashboard/training", label: "Staff Training", icon: GraduationCap, permission: PERMISSIONS.STAFF_MANAGE },
      { to: "/dashboard/training/settings", label: "Training Settings", icon: GraduationCap, permission: PERMISSIONS.STAFF_MANAGE },
      { to: "/products", label: "Products", icon: ShoppingBag, permission: PERMISSIONS.PRODUCTS_MANAGE },
      { to: "/gift-cards", label: "Gift Cards", icon: Gift },
      { to: "/intake-forms", label: "Intake Forms", icon: ClipboardList, permission: PERMISSIONS.SERVICES_MANAGE },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/reports", label: "Reports", icon: FileText, permission: PERMISSIONS.REPORTS_VIEW, hideForStaff: true },
      { to: "/cash-drawer", label: "Cash Drawer", icon: Banknote, permission: PERMISSIONS.CASH_DRAWER_VIEW },
      {
        to: "/commission-report",
        label: "Commissions",
        icon: BarChart3,
        anyOf: [PERMISSIONS.COMMISSIONS_VIEW_ALL, PERMISSIONS.COMMISSIONS_VIEW_OWN],
      },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/online-booking", label: "Online Booking", icon: Globe, permission: PERMISSIONS.STORE_SETTINGS },
      { to: "/sms-settings", label: "SMS Notifications", icon: MessageSquare, permission: PERMISSIONS.STORE_SETTINGS },
      { to: "/mail-settings", label: "Email Notifications", icon: Mail, permission: PERMISSIONS.STORE_SETTINGS },
      { to: "/business-settings", label: "Business Settings", icon: Building2, permission: PERMISSIONS.STORE_SETTINGS, hideForStaff: true },
      { to: "/calendar-settings", label: "Calendar Settings", icon: Settings, permission: PERMISSIONS.STORE_SETTINGS },
      { to: "/team-permissions", label: "Roles & Permissions", icon: Shield, permission: PERMISSIONS.STAFF_MANAGE },
      { to: "/api-keys", label: "API Keys", icon: Key, permission: PERMISSIONS.STORE_SETTINGS, hideForStaff: true },
      { to: "/multi-location", label: "Multi-Location", icon: Building2, permission: PERMISSIONS.STORE_SETTINGS, hideForStaff: true },
    ],
  },
];

export function Sidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutAsync, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { selectedStore } = useSelectedStore();
  const { can, canAny, isStaff } = usePermissions();
  const posEnabled = (selectedStore as any)?.posEnabled !== false;

  const { data: smsConversations } = useQuery<any[]>({
    queryKey: ["/api/sms-inbox/conversations", selectedStore?.id],
    queryFn: async () => {
      if (!selectedStore?.id) return [];
      const res = await fetch(`/api/sms-inbox/conversations?storeId=${selectedStore.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedStore?.id,
    refetchInterval: 30000,
  });
  const smsUnreadCount = smsConversations?.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0) || 0;

  const handleLogout = async () => {
    try {
      await logoutAsync();
    } catch {}
    navigate("/auth");
  };

  return (
    <aside className="w-64 border-r border-border/60 bg-background/95 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold" onClick={onLinkClick}>
            <img src="/web-app.png" alt="Logo" className="h-6 w-6" />
            <span>Certxa</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
          <nav className="px-2 text-sm font-medium lg:px-4 pb-4">
            {navGroups.map((group) => {
              const posHiddenRoutes = ["/analytics", "/reports", "/cash-drawer", "/commission-report"];
              const items = (posEnabled
                ? group.items
                : group.items.filter((item) => !posHiddenRoutes.includes(item.to))
              ).filter((item) => {
                if (isStaff && item.hideForStaff) return false;
                if (item.permission && !can(item.permission)) return false;
                if (item.anyOf && !canAny(...item.anyOf)) return false;
                return true;
              });
              if (items.length === 0) return null;
              return (
              <div key={group.label} className="mb-2">
                <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
                {items.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:text-primary",
                        isActive
                          ? "border border-primary/10 bg-card text-primary shadow-[0_3px_12px_rgba(15,23,42,0.08)] ring-1 ring-primary/5"
                          : "border border-transparent text-muted-foreground hover:border-border/70 hover:bg-card hover:shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.to === "/sms-inbox" && smsUnreadCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                          {smsUnreadCount > 9 ? "9+" : smsUnreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
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
