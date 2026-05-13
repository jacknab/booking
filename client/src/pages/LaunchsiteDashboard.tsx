import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  Globe,
  LayoutDashboard,
  Loader2,
  Plus,
  Radio,
  RefreshCw,
  Settings,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LaunchsiteWebsite {
  id: number;
  business_name: string;
  template_id: string;
  status: string;
  email: string;
  slug: string | null;
  domain_type: "subdomain" | "custom" | string | null;
  custom_domain: string | null;
  domain_payment_status: string | null;
}

interface ManageOverview {
  launchsite: {
    websites: LaunchsiteWebsite[];
    activeCount: number;
  };
}

const SITE_STATUS: Record<string, { label: string; badge: string; dot: string; help: string }> = {
  active: {
    label: "Live",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    help: "This website is available to visitors.",
  },
  pending: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    help: "The site has been submitted and is being prepared.",
  },
  pending_payment: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    help: "Custom domain setup is pending.",
  },
  inactive: {
    label: "Offline",
    badge: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
    help: "This website is not currently being served.",
  },
};

function getSiteStatus(status: string) {
  return SITE_STATUS[status] ?? SITE_STATUS.pending;
}

function siteUrl(site: LaunchsiteWebsite): string | null {
  if (site.domain_type === "custom" && site.custom_domain) return `https://${site.custom_domain}`;
  if (site.slug) return `https://${site.slug}.certxa.com`;
  return null;
}

function domainLabel(site: LaunchsiteWebsite): string {
  if (site.domain_type === "custom" && site.custom_domain) return site.custom_domain;
  if (site.slug) return `${site.slug}.certxa.com`;
  return "Domain not assigned";
}

function editorUrl(site: LaunchsiteWebsite): string {
  return `/editor/?site=${encodeURIComponent(site.slug || site.custom_domain || String(site.id))}`;
}

export default function LaunchsiteDashboard() {
  const { data, isLoading, isFetching, refetch } = useQuery<ManageOverview>({
    queryKey: ["/api/manage/overview"],
    queryFn: async () => {
      const res = await fetch("/api/manage/overview", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load Launchit websites");
      return res.json();
    },
    staleTime: 30_000,
    retry: false,
  });

  const websites = data?.launchsite.websites ?? [];
  const activeCount = data?.launchsite.activeCount ?? 0;
  const pendingCount = websites.filter((site) => site.status === "pending" || site.status === "pending_payment").length;

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 pb-20 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 mb-3">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Launchit dashboard
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">My Websites</h1>
            <p className="mt-1 text-sm text-gray-500">
              View every Launchit website connected to your account.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
              title="Refresh"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </button>
            <a href="/launchsite/">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Website
              </Button>
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total websites" value={String(websites.length)} icon={<Globe className="h-4 w-4" />} />
          <StatCard label="Live" value={String(activeCount)} icon={<Radio className="h-4 w-4" />} valueClass="text-emerald-600" />
          <StatCard label="Pending" value={String(pendingCount)} icon={<Clock className="h-4 w-4" />} valueClass="text-amber-600" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-950">Websites</h2>
              <p className="text-xs text-gray-500">Each website gets its own status and domain controls.</p>
            </div>
            <a href="/website-designs" className="text-xs font-semibold text-violet-700 hover:text-violet-600">
              Browse designs
            </a>
          </div>

          {isLoading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-500" />
                <p className="mt-3 text-sm text-gray-400">Loading websites...</p>
              </div>
            </div>
          ) : websites.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <Globe className="h-10 w-10 text-gray-200" />
              <h3 className="mt-4 text-base font-semibold text-gray-950">No Launchit websites yet</h3>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                Pick a design, complete the setup flow, and your website will appear here.
              </p>
              <a href="/launchsite/" className="mt-5">
                <Button size="sm" variant="outline">Browse templates</Button>
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {websites.map((site) => (
                <WebsiteSection key={site.id} site={site} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Site editor status</p>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                A LaunchSite editor shell exists at <span className="font-mono text-xs">/editor/?site=...</span>, but it currently points to a local editor app and is not ready as a customer-facing update tool.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  icon,
  valueClass,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <span className="text-gray-300">{icon}</span>
      </div>
      <p className={cn("mt-3 text-2xl font-bold text-gray-950", valueClass)}>{value}</p>
    </div>
  );
}

function WebsiteSection({ site }: { site: LaunchsiteWebsite }) {
  const status = getSiteStatus(site.status);
  const url = siteUrl(site);

  return (
    <section className="px-5 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", status.dot, site.status === "active" && "animate-pulse")} />
            <h3 className="truncate text-base font-semibold text-gray-950">{site.business_name}</h3>
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", status.badge)}>
              {status.label}
            </span>
          </div>
          <div className="mt-2 grid gap-2 text-sm text-gray-500 sm:grid-cols-2 lg:grid-cols-3">
            <Meta label="Domain" value={domainLabel(site)} />
            <Meta label="Template" value={site.template_id || "Unknown"} />
            <Meta label="Setup" value={status.help} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <a
            href={editorUrl(site)}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
          >
            <Settings className="h-3.5 w-3.5" />
            Edit Website
          </a>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Open Site
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-400">
              No public URL
            </span>
          )}
          <a
            href="/launchsite/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950"
          >
            Templates
          </a>
          <Link
            to="/account"
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950"
          >
            Account
          </Link>
        </div>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-0.5 truncate text-xs font-medium text-gray-700">{value}</p>
    </div>
  );
}
