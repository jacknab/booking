import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { ExternalLink, Globe, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  category: string;
  style: string;
  desc: string;
  badge: string;
  accent: string;
  dark: string;
  features: string[];
  hero_tagline: string;
  type: string;
  react_path: string | null;
  scraped_path: string | null;
  has_thumb: boolean;
  thumb_url: string | null;
  preview_url: string;
  select_url: string;
}

const CATEGORIES = ["All", "Hair Salon", "Barbershop", "Nail Salon"];

const BADGE_STYLES: Record<string, string> = {
  popular: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  new:     "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  premium: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
};

function TemplateCard({ t }: { t: Template }) {
  const iframeBase =
    t.type === "react" && t.react_path
      ? t.react_path
      : t.type === "scraped" && t.scraped_path
      ? `/launchsite${t.scraped_path}`
      : `/launchsite/preview-render.php?id=${encodeURIComponent(t.id)}`;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200">
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-muted" style={{ height: 200 }}>
        {t.has_thumb && t.thumb_url ? (
          <img
            src={t.thumb_url}
            alt={t.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full relative">
            <iframe
              src={iframeBase}
              className="absolute inset-0 w-[200%] h-[200%] pointer-events-none"
              style={{ transform: "scale(0.5)", transformOrigin: "top left" }}
              scrolling="no"
              tabIndex={-1}
              loading="lazy"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Badge */}
        {t.badge && (
          <span className={cn(
            "absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold",
            BADGE_STYLES[t.badge] ?? "bg-zinc-500/20 text-zinc-300"
          )}>
            {t.badge.charAt(0).toUpperCase() + t.badge.slice(1)}
          </span>
        )}

        {/* Category */}
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/60 text-white/90 backdrop-blur-sm">
          {t.category}
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          {t.style && (
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{t.style}</p>
          )}
          <h3 className="font-semibold text-sm leading-snug">{t.name}</h3>
          {t.desc && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.desc}</p>
          )}
        </div>

        {/* Feature pills */}
        {t.features && t.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {t.features.slice(0, 3).map((f) => (
              <span key={f} className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground border border-border/60">
                {f}
              </span>
            ))}
            {t.features.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground border border-border/60">
                +{t.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <a
            href={t.preview_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border/70 bg-background hover:bg-muted hover:border-border transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Preview
          </a>
          <a
            href={t.select_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Use This Design
          </a>
        </div>
      </div>
    </div>
  );
}

export default function WebsiteDesigns() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const { data: templates = [], isLoading, isError } = useQuery<Template[]>({
    queryKey: ["/launchsite/api/templates.php"],
    queryFn: async () => {
      const res = await fetch("/launchsite/api/templates.php");
      if (!res.ok) throw new Error("Failed to load templates");
      return res.json();
    },
    staleTime: 60_000,
  });

  const categories = useMemo(() => {
    const seen = new Set<string>();
    templates.forEach((t) => seen.add(t.category));
    return ["All", ...CATEGORIES.filter((c) => c !== "All" && seen.has(c))];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return templates.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (!q) return true;
      return [t.name, t.category, t.style, t.desc, t.hero_tagline]
        .join(" ").toLowerCase().includes(q);
    });
  }, [templates, category, search]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-violet-500" />
            <h1 className="text-2xl font-bold tracking-tight">Website Designs</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Browse professionally designed salon websites. Pick a design and go live with your domain.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 rounded-lg border border-border/70 bg-background px-3 pr-8 text-sm font-medium appearance-none cursor-pointer hover:border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors min-w-[160px]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Categories" : `${c}s`}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, style, keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border/70 bg-background pl-9 pr-8 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Result count */}
          {templates.length > 0 && (
            <div className="flex items-center text-xs text-muted-foreground sm:ml-auto self-center whitespace-nowrap">
              {filtered.length} design{filtered.length !== 1 ? "s" : ""}
              {category !== "All" || search ? " found" : " available"}
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading designs…</span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-24 gap-2 text-center">
            <p className="text-sm font-medium text-destructive">Could not load designs</p>
            <p className="text-xs text-muted-foreground">Make sure the PHP server is running.</p>
          </div>
        )}

        {/* Empty state — no templates at all */}
        {!isLoading && !isError && templates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl">
              🚀
            </div>
            <div>
              <p className="font-semibold text-base">No designs in the catalog yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Add templates via the Launchit Admin panel to see them appear here.
              </p>
            </div>
            <a
              href="/launchsite/admin.php"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Admin Panel
            </a>
          </div>
        )}

        {/* Empty state — filter returned nothing */}
        {!isLoading && !isError && templates.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <p className="font-medium text-sm">No designs match your filters</p>
            <p className="text-xs text-muted-foreground">Try a different category or clear the search.</p>
            <button
              onClick={() => { setCategory("All"); setSearch(""); }}
              className="text-xs text-primary underline underline-offset-2 hover:no-underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((t) => (
              <TemplateCard key={t.id} t={t} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
