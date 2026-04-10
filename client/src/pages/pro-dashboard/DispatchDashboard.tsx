import { useContext, useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StoreContext } from "@/hooks/use-store";
import { Link } from "react-router-dom";
import { MapPin, Truck, Clock, AlertTriangle, CheckCircle2, Plus, RefreshCw, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png", iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png" });

const STATUS_COLOR: Record<string, string> = {
  new: "#94a3b8", assigned: "#3b82f6", en_route: "#f59e0b",
  in_progress: "#00D4AA", completed: "#22c55e", cancelled: "#ef4444",
};
const STATUS_LABEL: Record<string, string> = {
  new: "New", assigned: "Assigned", en_route: "En Route",
  in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled",
};
const PRIORITY_COLOR: Record<string, string> = { low: "#64748b", normal: "#3b82f6", high: "#f59e0b", emergency: "#ef4444" };

function crewIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 19.82A7.06 7.06 0 0 1 3 19.35a5.8 5.8 0 0 1 1-3.65C5.39 13.6 8 10 17 8"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 5c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function jobIcon(color: string, priority: string) {
  const isEmergency = priority === "emergency";
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:${isEmergency ? 32 : 26}px;height:${isEmergency ? 32 : 26}px;border-radius:6px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;${isEmergency ? "animation:pulse 1s infinite;" : ""}"><svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
    iconSize: [isEmergency ? 32 : 26, isEmergency ? 32 : 26],
    iconAnchor: [isEmergency ? 16 : 13, isEmergency ? 16 : 13],
  });
}

export default function DispatchDashboard() {
  const ctx = useContext(StoreContext);
  const storeId = ctx?.selectedStore?.id;
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/pro-dashboard/dispatch", storeId],
    queryFn: async () => {
      const r = await fetch(`/api/pro-dashboard/dispatch?storeId=${storeId}`);
      return r.json();
    },
    enabled: !!storeId,
    refetchInterval: 15000,
  });

  const simulateLocation = useMutation({
    mutationFn: async (crewId: number) => {
      // Simulate a random location around a US city center
      const baseLats = [40.7128, 34.0522, 41.8781, 29.7604, 33.4484];
      const baseLngs = [-74.006, -118.2437, -87.6298, -95.3698, -112.074];
      const i = crewId % baseLats.length;
      const lat = baseLats[i] + (Math.random() - 0.5) * 0.08;
      const lng = baseLngs[i] + (Math.random() - 0.5) * 0.12;
      await fetch(`/api/pro-dashboard/crews/${crewId}/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/pro-dashboard/dispatch", storeId] }),
  });

  const orders = data?.orders ?? [];
  const crewList = data?.crews ?? [];
  const stats = data?.stats ?? {};

  const mapCenter: [number, number] = crewList.find((c: any) => c.location)
    ? [Number(crewList.find((c: any) => c.location).location.lat), Number(crewList.find((c: any) => c.location).location.lng)]
    : [39.8283, -98.5795];

  const STAT_CARDS = [
    { label: "Active Jobs", value: stats.activeJobs ?? 0, icon: Clock, color: "text-blue-400" },
    { label: "Crews Out", value: stats.activeCrews ?? 0, icon: Truck, color: "text-[#00D4AA]" },
    { label: "Completed Today", value: stats.completedJobs ?? 0, icon: CheckCircle2, color: "text-green-400" },
    { label: "Revenue", value: `$${Number(stats.revenue ?? 0).toLocaleString()}`, icon: AlertTriangle, color: "text-yellow-400" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <div>
          <h1 className="text-xl font-extrabold text-white">Live Dispatch</h1>
          <p className="text-white/40 text-xs mt-0.5">Real-time crew tracking and job assignment</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white text-xs font-semibold transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link to="/pro-dashboard/jobs/new" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00D4AA] text-[#050C18] font-bold text-xs transition-all hover:bg-[#00D4AA]/90">
            <Plus className="w-4 h-4" /> New Job
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 px-6 py-3 border-b border-white/8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className="text-white font-bold text-lg leading-none">{value}</p>
              <p className="text-white/40 text-xs mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map + Side panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#060E1A]">
              <div className="text-white/40 text-sm">Loading dispatch data…</div>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={crewList.find((c: any) => c.location) ? 12 : 4}
              style={{ height: "100%", width: "100%", background: "#060E1A" }}
              className="z-0"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* Crew markers */}
              {crewList.map((crew: any) =>
                crew.location ? (
                  <Marker key={`crew-${crew.id}`} position={[Number(crew.location.lat), Number(crew.location.lng)]} icon={crewIcon(crew.color)}>
                    <Popup className="leaflet-dark-popup">
                      <div style={{ background: "#0D1F35", color: "white", padding: "8px", borderRadius: "8px", minWidth: "160px" }}>
                        <p style={{ fontWeight: 700, marginBottom: 4 }}>{crew.name}</p>
                        {orders.find((o: any) => o.crewId === crew.id && ["assigned","en_route","in_progress"].includes(o.status)) ? (
                          <p style={{ fontSize: 12, color: "#00D4AA" }}>
                            On job: {orders.find((o: any) => o.crewId === crew.id)?.serviceType}
                          </p>
                        ) : (
                          <p style={{ fontSize: 12, color: "#94a3b8" }}>Available</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}

              {/* Job markers */}
              {orders.filter((o: any) => o.lat && o.lng).map((order: any) => (
                <Marker
                  key={`job-${order.id}`}
                  position={[Number(order.lat), Number(order.lng)]}
                  icon={jobIcon(STATUS_COLOR[order.status] ?? "#94a3b8", order.priority)}
                >
                  <Popup>
                    <div style={{ background: "#0D1F35", color: "white", padding: "8px", borderRadius: "8px", minWidth: "200px" }}>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{order.orderNumber}</p>
                      <p style={{ fontSize: 12, color: "#94a3b8" }}>{order.serviceType}</p>
                      <p style={{ fontSize: 12, marginTop: 4 }}>{order.customerName}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>{order.address}</p>
                      <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ background: STATUS_COLOR[order.status], borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700, color: "white" }}>
                          {STATUS_LABEL[order.status]}
                        </span>
                        {order.priority !== "normal" && (
                          <span style={{ color: PRIORITY_COLOR[order.priority], fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>{order.priority}</span>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 z-10 bg-[#0A1628]/90 border border-white/15 rounded-xl px-3 py-2 text-xs space-y-1">
            <p className="text-white/40 font-semibold uppercase tracking-wider text-[10px] mb-2">Legend</p>
            {Object.entries(STATUS_LABEL).filter(([k]) => k !== "cancelled").map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: STATUS_COLOR[k] }} />
                <span className="text-white/60">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-80 bg-[#0A1628] border-l border-white/8 flex flex-col overflow-hidden">
          {/* Crews */}
          <div className="px-4 py-3 border-b border-white/8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold text-sm">Crews ({crewList.length})</h3>
              <Link to="/pro-dashboard/crews" className="text-[#00D4AA] text-xs hover:underline">Manage</Link>
            </div>
            {crewList.length === 0 ? (
              <p className="text-white/30 text-xs">No crews yet. <Link to="/pro-dashboard/crews" className="text-[#00D4AA]">Add one →</Link></p>
            ) : (
              <div className="space-y-2">
                {crewList.map((crew: any) => {
                  const activeJob = orders.find((o: any) => o.crewId === crew.id && ["assigned","en_route","in_progress"].includes(o.status));
                  return (
                    <div key={crew.id} className="flex items-center justify-between bg-white/4 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: crew.color }}>
                          {crew.name[0]}
                        </div>
                        <div>
                          <p className="text-white text-xs font-semibold">{crew.name}</p>
                          <p className="text-white/40 text-[10px]">{activeJob ? activeJob.serviceType : "Available"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {crew.location ? (
                          <span className="text-[#00D4AA] text-[10px] font-semibold flex items-center gap-1"><Navigation className="w-3 h-3" />Live</span>
                        ) : (
                          <button onClick={() => simulateLocation.mutate(crew.id)} className="text-white/30 text-[10px] hover:text-[#00D4AA] transition-colors" title="Simulate GPS">
                            Ping
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Jobs */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <h3 className="text-white font-bold text-sm">Active Jobs ({orders.length})</h3>
              <Link to="/pro-dashboard/jobs" className="text-[#00D4AA] text-xs hover:underline">View all</Link>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm">No active jobs</p>
                  <Link to="/pro-dashboard/jobs/new" className="text-[#00D4AA] text-xs mt-1 hover:underline block">Create your first job</Link>
                </div>
              ) : (
                orders.map((order: any) => (
                  <Link to={`/pro-dashboard/jobs/${order.id}`} key={order.id}
                    className="block bg-white/4 hover:bg-white/8 border border-white/8 rounded-xl px-3 py-2.5 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold truncate">{order.customerName}</p>
                        <p className="text-white/50 text-[10px] truncate">{order.serviceType}</p>
                        <p className="text-white/30 text-[10px] truncate mt-0.5">{order.address}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: STATUS_COLOR[order.status] }}>
                          {STATUS_LABEL[order.status]}
                        </span>
                        {order.priority !== "normal" && (
                          <span className="text-[10px] font-semibold uppercase" style={{ color: PRIORITY_COLOR[order.priority] }}>{order.priority}</span>
                        )}
                      </div>
                    </div>
                    {order.crew && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ background: order.crew.color }} />
                        <span className="text-white/40 text-[10px]">{order.crew.name}</span>
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
