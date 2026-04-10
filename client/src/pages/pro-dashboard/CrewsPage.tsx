import { useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StoreContext } from "@/hooks/use-store";
import { Plus, HardHat, Navigation, Edit2, Trash2, Navigation2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CREW_COLORS = ["#00D4AA","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"];

function CrewModal({ storeId, crew, onClose, onSaved }: any) {
  const [form, setForm] = useState({ name: crew?.name ?? "", color: crew?.color ?? CREW_COLORS[0], notes: crew?.notes ?? "" });
  const set = (k: string, v: string) => setForm(p => ({...p, [k]:v}));
  const save = useMutation({
    mutationFn: async () => {
      const url = crew ? `/api/pro-dashboard/crews/${crew.id}?storeId=${storeId}` : `/api/pro-dashboard/crews?storeId=${storeId}`;
      const r = await fetch(url, { method: crew ? "PUT" : "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(form) });
      return r.json();
    },
    onSuccess: () => { onSaved(); onClose(); },
  });
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A1628] border border-white/15 rounded-2xl w-full max-w-sm">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-bold">{crew ? "Edit Crew" : "Add Crew"}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label className="text-white/50 text-[11px] uppercase tracking-wider mb-1 block">Crew Name *</Label>
            <Input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Team Alpha"
              className="bg-white/6 border-white/15 text-white h-10 rounded-xl" />
          </div>
          <div>
            <Label className="text-white/50 text-[11px] uppercase tracking-wider mb-2 block">Color</Label>
            <div className="flex flex-wrap gap-2">
              {CREW_COLORS.map(c => (
                <button key={c} onClick={() => set("color", c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.color===c ? "border-white scale-110" : "border-transparent"}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <div>
            <Label className="text-white/50 text-[11px] uppercase tracking-wider mb-1 block">Notes</Label>
            <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2}
              className="w-full bg-white/6 border border-white/15 text-white rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#00D4AA]/50" />
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-white/15 text-white/60 rounded-xl text-sm">Cancel</button>
            <button onClick={() => save.mutate()} disabled={!form.name || save.isPending}
              className="flex-1 py-2 bg-[#00D4AA] text-[#050C18] font-bold rounded-xl text-sm disabled:opacity-40">
              {save.isPending ? "Saving…" : crew ? "Save Changes" : "Add Crew"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CrewsPage() {
  const ctx = useContext(StoreContext);
  const storeId = ctx?.selectedStore?.id;
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | "new" | any>(null);

  const { data: crews = [], isLoading } = useQuery({
    queryKey: ["/api/pro-dashboard/crews", storeId],
    queryFn: async () => {
      const r = await fetch(`/api/pro-dashboard/crews?storeId=${storeId}`);
      return r.json();
    },
    enabled: !!storeId,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/pro-dashboard/orders", storeId],
    queryFn: async () => {
      const r = await fetch(`/api/pro-dashboard/orders?storeId=${storeId}`);
      return r.json();
    },
    enabled: !!storeId,
  });

  const deleteCrew = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/pro-dashboard/crews/${id}?storeId=${storeId}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/pro-dashboard/crews"] }),
  });

  const simulateLocation = useMutation({
    mutationFn: async (crewId: number) => {
      const baseLats = [40.7128, 34.0522, 41.8781, 29.7604, 33.4484];
      const baseLngs = [-74.006, -118.2437, -87.6298, -95.3698, -112.074];
      const i = crewId % baseLats.length;
      const lat = baseLats[i] + (Math.random() - 0.5) * 0.08;
      const lng = baseLngs[i] + (Math.random() - 0.5) * 0.12;
      await fetch(`/api/pro-dashboard/crews/${crewId}/location`, {
        method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ lat, lng }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/pro-dashboard/crews"] }),
  });

  const getCrewJobs = (crewId: number) => jobs.filter((j: any) => j.crewId === crewId && !["completed","cancelled"].includes(j.status));

  return (
    <div className="p-6">
      {modal && (
        <CrewModal
          storeId={storeId}
          crew={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ["/api/pro-dashboard/crews"] })}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">Crews</h1>
          <p className="text-white/40 text-xs mt-0.5">{crews.length} active crews</p>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00D4AA] text-[#050C18] font-bold text-sm">
          <Plus className="w-4 h-4" /> Add Crew
        </button>
      </div>

      {isLoading ? <div className="text-center py-16 text-white/30">Loading…</div> :
        crews.length === 0 ? (
          <div className="text-center py-16">
            <HardHat className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No crews yet</p>
            <button onClick={() => setModal("new")} className="text-[#00D4AA] text-sm mt-2 hover:underline">Add your first crew →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crews.map((crew: any) => {
              const activeJobs = getCrewJobs(crew.id);
              const hasLocation = !!crew.location;
              const locationAge = crew.location?.updatedAt ? Math.floor((Date.now() - new Date(crew.location.updatedAt).getTime()) / 60000) : null;
              return (
                <div key={crew.id} className="bg-[#0D1F35] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg" style={{ background: crew.color + "33", border: `2px solid ${crew.color}` }}>
                        {crew.name[0]}
                      </div>
                      <div>
                        <p className="text-white font-bold">{crew.name}</p>
                        <p className="text-white/40 text-xs">{activeJobs.length} active job{activeJobs.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal(crew)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { if (confirm("Delete crew?")) deleteCrew.mutate(crew.id); }}
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* GPS Status */}
                  <div className="mb-4">
                    {hasLocation ? (
                      <div className="flex items-center justify-between bg-[#00D4AA]/10 border border-[#00D4AA]/20 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Navigation className="w-3.5 h-3.5 text-[#00D4AA]" />
                          <span className="text-[#00D4AA] text-xs font-semibold">Live Location</span>
                        </div>
                        <span className="text-white/40 text-[10px]">{locationAge !== null ? (locationAge < 1 ? "just now" : `${locationAge}m ago`) : ""}</span>
                      </div>
                    ) : (
                      <button onClick={() => simulateLocation.mutate(crew.id)}
                        className="w-full flex items-center justify-center gap-2 bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white/40 text-xs hover:bg-white/8 hover:text-white/60 transition-all">
                        <Navigation2 className="w-3.5 h-3.5" />
                        Simulate GPS Location (demo)
                      </button>
                    )}
                  </div>

                  {/* Active jobs */}
                  {activeJobs.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-white/30 text-[10px] uppercase tracking-wider font-semibold">Active Jobs</p>
                      {activeJobs.slice(0, 2).map((j: any) => (
                        <div key={j.id} className="bg-white/5 rounded-lg px-3 py-2 text-xs">
                          <p className="text-white font-semibold">{j.serviceType}</p>
                          <p className="text-white/40">{j.customerName} · {j.orderNumber}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {crew.notes && <p className="text-white/30 text-xs mt-3 pt-3 border-t border-white/8">{crew.notes}</p>}
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}
