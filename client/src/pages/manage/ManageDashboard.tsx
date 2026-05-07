import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ExternalLink, LogOut, Calendar, Globe, ArrowRight, Sparkles, LayoutDashboard } from "lucide-react";

interface ManageOverview {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    subscriptionStatus: string | null;
    trialEndsAt: string | null;
  };
  salonos: {
    stores: Array<{
      id: number;
      name: string;
      bookingSlug: string | null;
      timezone: string | null;
      phone: string | null;
      address: string | null;
    }>;
  };
  launchsite: {
    websites: Array<{
      id: number;
      business_name: string;
      template_id: string;
      status: string;
      email: string;
      slug: string | null;
    }>;
  };
}

async function fetchOverview(): Promise<ManageOverview> {
  const res = await fetch("/api/manage/overview", { credentials: "include" });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error("Failed to load overview");
  return res.json();
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:           { label: "Active",   cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    trial:            { label: "Trial",    cls: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
    pending_payment:  { label: "Pending",  cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    cancelled:        { label: "Inactive", cls: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

export default function ManageDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ManageOverview>({
    queryKey: ["/api/manage/overview"],
    queryFn: fetchOverview,
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (error?.message === "unauthorized") {
      navigate("/auth?redirect=/manage", { replace: true });
    }
  }, [error, navigate]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/manage/logout", { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/auth", { replace: true });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { user, salonos, launchsite } = data;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || user.email[0].toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Top bar */}
      <header className="border-b border-white/8 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/overview.php" className="flex items-center gap-1.5 font-semibold text-lg tracking-tight">
            Certxa<span className="text-violet-400">.</span>
          </a>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            <span className="text-sm text-zinc-400 hidden sm:block">{displayName}</span>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors ml-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Welcome */}
        <div className="mb-10">
          <p className="text-sm text-zinc-500 mb-1 uppercase tracking-widest">Subscriber Hub</p>
          <h1 className="text-3xl font-semibold">
            Welcome back{user.firstName ? `, ${user.firstName}` : ""}.
          </h1>
          <p className="text-zinc-400 mt-2">All your Certxa applications in one place.</p>
        </div>

        {/* App cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── SalonOS card ──────────────────────────── */}
          <AppCard
            accent="violet"
            icon={<Calendar className="w-5 h-5" />}
            label="SalonOS"
            tagline="Booking, POS & salon management"
          >
            {salonos.stores.length === 0 ? (
              <EmptySlot
                message="No salon set up yet."
                cta="Set up SalonOS"
                href="/onboarding"
              />
            ) : (
              <div className="space-y-3">
                {salonos.stores.map((store) => (
                  <StoreRow key={store.id} store={store} />
                ))}
                <a
                  href="/dashboard"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-sm font-medium"
                >
                  Open Dashboard <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </AppCard>

          {/* ── LaunchSite card ───────────────────────── */}
          <AppCard
            accent="indigo"
            icon={<Globe className="w-5 h-5" />}
            label="LaunchSite"
            tagline="Your salon website, live in minutes"
          >
            {launchsite.websites.length === 0 ? (
              <EmptySlot
                message="No website created yet."
                cta="Browse templates"
                href="/launchsite/"
              />
            ) : (
              <div className="space-y-3">
                {launchsite.websites.map((site) => (
                  <WebsiteRow key={site.id} site={site} />
                ))}
                <a
                  href="/launchsite/"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-medium"
                >
                  Manage Websites <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </AppCard>

        </div>

        {/* Quick links */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Calendar",     href: "/calendar",          icon: <Calendar className="w-4 h-4" /> },
            { label: "Dashboard",    href: "/dashboard",         icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: "Billing",      href: "/manage/billing",    icon: <Sparkles className="w-4 h-4" /> },
            { label: "Account Settings", href: "/business-settings", icon: <ExternalLink className="w-4 h-4" /> },
          ].map(({ label, href, icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-sm text-zinc-300 hover:text-white transition-all"
            >
              <span className="text-zinc-500">{icon}</span>
              {label}
            </a>
          ))}
        </div>

      </main>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function AppCard({
  accent,
  icon,
  label,
  tagline,
  children,
}: {
  accent: "violet" | "indigo";
  icon: React.ReactNode;
  label: string;
  tagline: string;
  children: React.ReactNode;
}) {
  const colors = {
    violet: "border-violet-500/20 from-violet-950/40",
    indigo:  "border-indigo-500/20 from-indigo-950/40",
  };
  const iconColors = {
    violet: "bg-violet-600/20 text-violet-400",
    indigo:  "bg-indigo-600/20 text-indigo-400",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-b to-zinc-900/60 p-6 flex flex-col gap-5 ${colors[accent]}`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColors[accent]}`}>
          {icon}
        </div>
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-zinc-500">{tagline}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function StoreRow({ store }: { store: ManageOverview["salonos"]["stores"][number] }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 border border-white/8">
      <div>
        <p className="text-sm font-medium">{store.name}</p>
        {store.address && <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[180px]">{store.address}</p>}
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status="active" />
        {store.bookingSlug && (
          <a
            href={`/book/${store.bookingSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-white transition-colors"
            title="Booking page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function WebsiteRow({ site }: { site: ManageOverview["launchsite"]["websites"][number] }) {
  const domain = site.slug ? `${site.slug}.certxa.com` : null;
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 border border-white/8">
      <div>
        <p className="text-sm font-medium">{site.business_name}</p>
        {domain && <p className="text-xs text-zinc-500 mt-0.5">{domain}</p>}
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={site.status === "active" ? "active" : site.status === "pending_payment" ? "pending_payment" : "active"} />
        {domain && (
          <a
            href={`https://${domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-white transition-colors"
            title="View site"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function EmptySlot({ message, cta, href }: { message: string; cta: string; href: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <p className="text-sm text-zinc-500">{message}</p>
      <a
        href={href}
        className="text-sm font-medium text-violet-400 hover:text-violet-300 underline-offset-4 hover:underline transition-colors"
      >
        {cta} →
      </a>
    </div>
  );
}
