import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSelectedStore } from "@/hooks/use-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Users, Clock, CheckCircle, XCircle, Bell, Plus, Trash2,
  Settings, RefreshCw, ExternalLink, Loader2, Phone, ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type WaitlistEntry = {
  id: number;
  customerName: string;
  customerPhone?: string;
  status: string;
  notes?: string;
  partySize?: number;
  createdAt: string;
  calledAt?: string;
};

const STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  waiting:   { label: "Waiting",   bg: "bg-amber-50  dark:bg-amber-950/40",  text: "text-amber-700  dark:text-amber-300",  dot: "bg-amber-400"  },
  called:    { label: "Called",    bg: "bg-blue-50   dark:bg-blue-950/40",   text: "text-blue-700   dark:text-blue-300",   dot: "bg-blue-400"   },
  serving:   { label: "Serving",   bg: "bg-teal-50   dark:bg-teal-950/40",   text: "text-teal-700   dark:text-teal-300",   dot: "bg-teal-400 animate-pulse"   },
  completed: { label: "Done",      bg: "bg-green-50  dark:bg-green-950/40",  text: "text-green-700  dark:text-green-300",  dot: "bg-green-400"  },
  cancelled: { label: "Removed",   bg: "bg-gray-50   dark:bg-gray-800/40",   text: "text-gray-500   dark:text-gray-400",   dot: "bg-gray-300"   },
};

export default function QueueDashboard() {
  const { selectedStore } = useSelectedStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ customerName: "", customerPhone: "", partySize: 1 });

  const { data: entries = [], isLoading, refetch } = useQuery<WaitlistEntry[]>({
    queryKey: ["/api/waitlist"],
    enabled: !!selectedStore,
    refetchInterval: 15000,
  });

  const today = new Date().toDateString();
  const todayEntries = entries.filter(e => new Date(e.createdAt).toDateString() === today);
  const waiting = todayEntries.filter(e => e.status === "waiting");
  const called = todayEntries.filter(e => ["called", "serving"].includes(e.status));
  const served = todayEntries.filter(e => e.status === "completed");
  const active = [...called, ...waiting];

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PUT", `/api/waitlist/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/waitlist/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] }),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/waitlist", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      setShowAddForm(false);
      setNewEntry({ customerName: "", customerPhone: "", partySize: 1 });
      toast({ title: "Walk-in added to queue" });
    },
  });

  const handleAction = (id: number, status: string) => {
    updateMutation.mutate({ id, status });
    toast({ title: status === "completed" ? "Marked as done" : status === "called" ? "Customer called" : "Status updated" });
  };

  const handleAddWalkIn = () => {
    if (!newEntry.customerName.trim()) return;
    addMutation.mutate({
      customerName: newEntry.customerName.trim(),
      customerPhone: newEntry.customerPhone.trim() || undefined,
      partySize: newEntry.partySize,
      storeId: selectedStore?.id,
      status: "waiting",
    });
  };

  const slug = (selectedStore as any)?.bookingSlug;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Queue</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Today's virtual check-ins and walk-ins</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {slug && (
              <a
                href={`/q/${slug}/display`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Display Board
              </a>
            )}
            <Link to="/dashboard/queue/settings">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <Settings className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Walk-In
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard icon={<Users className="w-5 h-5 text-amber-500" />} label="Waiting" value={waiting.length} highlight={waiting.length > 0} />
          <StatCard icon={<Bell className="w-5 h-5 text-blue-500" />} label="Called / Serving" value={called.length} />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-green-500" />} label="Served Today" value={served.length} />
        </div>

        {/* Add walk-in form */}
        {showAddForm && (
          <div className="bg-card border rounded-xl p-4 mb-6 shadow-sm">
            <h3 className="font-semibold text-sm mb-3">Add Walk-In</h3>
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                value={newEntry.customerName}
                onChange={e => setNewEntry(n => ({ ...n, customerName: e.target.value }))}
                placeholder="Customer name *"
                className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="tel"
                value={newEntry.customerPhone}
                onChange={e => setNewEntry(n => ({ ...n, customerPhone: e.target.value }))}
                placeholder="Phone (optional)"
                className="w-40 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="flex items-center gap-1.5 border rounded-lg px-2 py-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <select
                  value={newEntry.partySize}
                  onChange={e => setNewEntry(n => ({ ...n, partySize: Number(e.target.value) }))}
                  className="bg-transparent text-sm focus:outline-none pr-1"
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? "person" : "people"}</option>)}
                </select>
              </div>
              <button
                onClick={handleAddWalkIn}
                disabled={addMutation.isPending || !newEntry.customerName.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Queue list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : active.length === 0 && waiting.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-card">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Queue is empty</h3>
            <p className="text-muted-foreground text-sm mb-4">No customers in line right now.</p>
            {slug && (
              <a
                href={`/q/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View public check-in page
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Called/serving section */}
            {called.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Now Serving</p>
                {called.map(entry => (
                  <QueueEntryRow
                    key={entry.id}
                    entry={entry}
                    position={null}
                    onComplete={() => handleAction(entry.id, "completed")}
                    onRemove={() => deleteMutation.mutate(entry.id)}
                    isPending={updateMutation.isPending || deleteMutation.isPending}
                  />
                ))}
              </div>
            )}

            {/* Waiting section */}
            {waiting.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Waiting</p>
                {waiting.map((entry, idx) => (
                  <QueueEntryRow
                    key={entry.id}
                    entry={entry}
                    position={idx + 1}
                    onCall={() => handleAction(entry.id, "called")}
                    onRemove={() => deleteMutation.mutate(entry.id)}
                    isPending={updateMutation.isPending || deleteMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recently served (collapsed) */}
        {served.length > 0 && (
          <div className="mt-8 border-t pt-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Served Today ({served.length})</p>
            <div className="space-y-1.5">
              {served.slice(0, 5).map(entry => (
                <div key={entry.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground flex-1">{entry.customerName}</span>
                  {entry.partySize && entry.partySize > 1 && (
                    <span className="text-xs text-muted-foreground">×{entry.partySize}</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
              {served.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-1">+{served.length - 5} more</p>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 bg-card ${highlight && value > 0 ? "border-amber-200 dark:border-amber-800/50" : ""}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-sm text-muted-foreground">{label}</span></div>
      <p className={`text-3xl font-bold ${highlight && value > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function QueueEntryRow({ entry, position, onCall, onComplete, onRemove, isPending }: {
  entry: WaitlistEntry;
  position: number | null;
  onCall?: () => void;
  onComplete?: () => void;
  onRemove: () => void;
  isPending: boolean;
}) {
  const meta = STATUS_META[entry.status] || STATUS_META.waiting;
  const isServing = ["called", "serving"].includes(entry.status);

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 mb-2 transition-all ${meta.bg}`}>
      {position !== null ? (
        <span className="text-lg font-black text-muted-foreground w-8 text-center flex-shrink-0">#{position}</span>
      ) : (
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dot}`} />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground truncate">{entry.customerName}</span>
          {entry.partySize && entry.partySize > 1 && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              ×{entry.partySize}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {entry.customerPhone && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="w-3 h-3" />{entry.customerPhone}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {onCall && !isServing && (
          <button
            onClick={onCall}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Bell className="w-3 h-3" /> Call
          </button>
        )}
        {onComplete && (
          <button
            onClick={onComplete}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold hover:bg-green-200 dark:hover:bg-green-900/60 disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="w-3 h-3" /> Done
          </button>
        )}
        <button
          onClick={onRemove}
          disabled={isPending}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
          title="Remove from queue"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
