import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSelectedStore } from "@/hooks/use-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Settings, Copy, ExternalLink, Check, ArrowLeft, QrCode,
  Code2, ToggleLeft, ToggleRight, Clock, Users, Loader2
} from "lucide-react";

type QueuePrefs = {
  queueEnabled: boolean;
  queueAvgServiceTime: number;
  queueMaxSize: number;
};

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl border bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        </div>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>
      <pre className="px-4 py-3 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input
          readOnly
          value={value}
          className="flex-1 px-3 py-2 rounded-lg border bg-muted text-sm font-mono text-muted-foreground"
          onFocus={e => e.target.select()}
        />
        <button onClick={copy} className="px-3 py-2 rounded-lg border hover:bg-muted transition-colors text-sm flex items-center gap-1.5">
          {copied ? <><Check className="w-4 h-4 text-green-500" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
        </button>
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-lg border hover:bg-muted transition-colors text-sm flex items-center gap-1.5">
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export default function QueueSettings() {
  const { selectedStore } = useSelectedStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const slug = (selectedStore as any)?.bookingSlug;
  const baseUrl = window.location.origin;
  const checkInUrl = slug ? `${baseUrl}/q/${slug}` : "";
  const displayUrl = slug ? `${baseUrl}/q/${slug}/display` : "";

  const { data: settingsData, isLoading } = useQuery<any>({
    queryKey: ["/api/pro-dashboard/features", selectedStore?.id],
    queryFn: async () => {
      const r = await fetch(`/api/queue/settings?storeId=${selectedStore?.id}`);
      return r.json();
    },
    enabled: !!selectedStore?.id,
  });

  const [prefs, setPrefs] = useState<QueuePrefs>({
    queueEnabled: true,
    queueAvgServiceTime: 20,
    queueMaxSize: 30,
  });

  useEffect(() => {
    if (settingsData) {
      setPrefs({
        queueEnabled: settingsData.queueEnabled !== false,
        queueAvgServiceTime: settingsData.queueAvgServiceTime || 20,
        queueMaxSize: settingsData.queueMaxSize || 30,
      });
    }
  }, [settingsData]);

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("PUT", `/api/queue/settings?storeId=${selectedStore?.id}`, prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pro-dashboard/features"] });
      toast({ title: "Queue settings saved" });
    },
    onError: () => toast({ title: "Failed to save settings", variant: "destructive" }),
  });

  const checkInIframe = checkInUrl
    ? `<iframe\n  src="${checkInUrl}"\n  width="100%"\n  height="600"\n  style="border:none;border-radius:16px;"\n  title="Virtual Check-In"\n></iframe>`
    : "";

  const displayIframe = displayUrl
    ? `<iframe\n  src="${displayUrl}"\n  width="100%"\n  height="100vh"\n  style="border:none;"\n  allowfullscreen\n  title="Queue Display Board"\n></iframe>`
    : "";

  const qrUrl = checkInUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkInUrl)}`
    : "";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard/queue">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Queue Settings</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Configure your virtual check-in system and get embed codes</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* Queue Settings */}
            <div className="bg-card border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">Queue Settings</h2>
              </div>

              <div className="space-y-5">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">Accept Virtual Check-Ins</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Allow customers to join the queue remotely</p>
                  </div>
                  <button
                    onClick={() => setPrefs(p => ({ ...p, queueEnabled: !p.queueEnabled }))}
                    className="transition-all"
                  >
                    {prefs.queueEnabled
                      ? <ToggleRight className="w-9 h-9 text-primary" />
                      : <ToggleLeft className="w-9 h-9 text-muted-foreground" />}
                  </button>
                </div>

                {/* Avg service time */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Average Service Time (minutes)
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">Used to estimate wait times for customers</p>
                  <div className="flex items-center gap-3">
                    {[10, 15, 20, 30, 45, 60].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setPrefs(p => ({ ...p, queueAvgServiceTime: mins }))}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                          prefs.queueAvgServiceTime === mins
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {mins}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max queue size */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Max Queue Size
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">Stop accepting check-ins once this limit is reached</p>
                  <div className="flex items-center gap-3">
                    {[10, 20, 30, 50, 100].map(n => (
                      <button
                        key={n}
                        onClick={() => setPrefs(p => ({ ...p, queueMaxSize: n }))}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                          prefs.queueMaxSize === n
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Settings"}
                </button>
              </div>
            </div>

            {/* Share Links */}
            {slug ? (
              <div className="bg-card border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">Share Links</h2>
                </div>
                <CopyField value={checkInUrl} label="Customer Check-In URL" />
                <CopyField value={displayUrl} label="Queue Display Board URL (for TV / lobby screen)" />
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
                ⚠️ Set your <strong>Booking Slug</strong> in Online Booking settings to enable check-in links.
              </div>
            )}

            {/* Embed Codes */}
            {slug && (
              <div className="bg-card border rounded-xl p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">Embed Codes</h2>
                </div>
                <p className="text-sm text-muted-foreground -mt-2">
                  Paste these into your website's HTML to add the check-in form or live display board.
                </p>
                <CodeBlock code={checkInIframe} label="Check-In Widget (embed on your website)" />
                <CodeBlock code={displayIframe} label="Queue Display Board (embed or open full-screen on a TV)" />
              </div>
            )}

            {/* QR Code */}
            {slug && qrUrl && (
              <div className="bg-card border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="w-5 h-5 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">QR Code</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Print and display at your front desk so walk-ins can scan to join the line.
                </p>
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-white border rounded-xl shadow-sm">
                    <img src={qrUrl} alt="Check-in QR Code" className="w-40 h-40" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Points to:</p>
                    <p className="text-xs font-mono text-muted-foreground">{checkInUrl}</p>
                    <a
                      href={qrUrl}
                      download="checkin-qr-code.png"
                      className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-2"
                    >
                      Download QR Code
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
