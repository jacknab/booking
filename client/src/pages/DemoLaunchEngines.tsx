import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelectedStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import {
  Database, Users, AlertTriangle, Star, Clock,
  TrendingUp, DollarSign, Zap, CheckCircle2, ChevronRight,
  Radio
} from "lucide-react";

const DEMO_EMAIL = "nail-demo@certxa.com";

type EngineStatus = "offline" | "initializing" | "running" | "online";

interface EngineState {
  status: EngineStatus;
  progress: number;
  result: string;
}

const ENGINES = [
  {
    id: "data_scan",
    label: "Appointment History Scanner",
    description: "Indexing 6 months of booking data",
    Icon: Database,
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.35)",
  },
  {
    id: "client_profiles",
    label: "Client Profile Engine",
    description: "Cadence & lifetime value per client",
    Icon: Users,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.35)",
  },
  {
    id: "churn_scoring",
    label: "Churn Risk Scoring",
    description: "Multi-factor retention risk analysis",
    Icon: AlertTriangle,
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.35)",
  },
  {
    id: "staff_intelligence",
    label: "Staff Intelligence",
    description: "Rebooking rates & tech performance",
    Icon: Star,
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.35)",
  },
  {
    id: "dead_seats",
    label: "Dead Seat Detector",
    description: "Chronically underbooked slot analysis",
    Icon: Clock,
    color: "#fb923c",
    glow: "rgba(251,146,60,0.35)",
  },
  {
    id: "growth_score",
    label: "Growth Score Engine",
    description: "Composite 0–100 business health score",
    Icon: TrendingUp,
    color: "#34d399",
    glow: "rgba(52,211,153,0.35)",
  },
  {
    id: "revenue_leakage",
    label: "Revenue Leakage Scanner",
    description: "Lapsed client & lost revenue mapping",
    Icon: DollarSign,
    color: "#f87171",
    glow: "rgba(248,113,113,0.35)",
  },
  {
    id: "drift_engine",
    label: "Drift Recovery Engine",
    description: "Win-back candidate identification",
    Icon: Zap,
    color: "#c084fc",
    glow: "rgba(192,132,252,0.35)",
  },
];

const defaultState = (): EngineState => ({ status: "offline", progress: 0, result: "" });

export default function DemoLaunchEngines() {
  const { user } = useAuth();
  const { selectedStore } = useSelectedStore();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<"idle" | "launching" | "complete">("idle");
  const [engines, setEngines] = useState<Record<string, EngineState>>(
    () => Object.fromEntries(ENGINES.map((e) => [e.id, defaultState()]))
  );
  const [log, setLog] = useState<string[]>([]);
  const [dots, setDots] = useState(".");
  const logRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (phase !== "launching") return;
    const iv = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 400);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  useEffect(() => () => { esRef.current?.close(); }, []);

  if (!user || user.email !== DEMO_EMAIL) {
    navigate("/intelligence", { replace: true });
    return null;
  }

  function setEngine(id: string, patch: Partial<EngineState>) {
    setEngines((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function appendLog(msg: string) {
    setLog((prev) => [...prev.slice(-80), msg]);
  }

  function handleLaunch() {
    if (!selectedStore?.id) return;
    setPhase("launching");
    appendLog("[SYSTEM] Initiating Revenue Intelligence engine sequence...");
    appendLog("[SYSTEM] Establishing secure data pipeline...");

    const url = `/api/intelligence/demo/launch?storeId=${selectedStore.id}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);

        if (data.phase === "complete") {
          setPhase("complete");
          appendLog("[SYSTEM] ✅ ALL ENGINES ONLINE — Intelligence dashboard ready.");
          es.close();
          return;
        }

        if (data.phase === "error") {
          appendLog(`[ERROR] ${data.error || "Unknown engine error"}`);
          es.close();
          return;
        }

        const { phase: p, status, label, result, progress, description } = data;

        if (status === "starting") {
          setEngine(p, { status: "initializing", progress: 0, result: "" });
          appendLog(`[BOOT] ${label} — ${description || "initializing..."}`);
        } else if (status === "running") {
          setEngine(p, { status: "running", progress: progress ?? 50 });
          appendLog(`[RUN]  ${label} — ${progress ?? 0}% complete`);
        } else if (status === "done") {
          setEngine(p, { status: "online", progress: 100, result: result || "" });
          appendLog(`[ONLINE] ✓ ${label}${result ? ` — ${result}` : ""}`);
        }
      } catch {
        /* ignore parse errors */
      }
    };

    es.onerror = () => {
      appendLog("[ERROR] Stream connection lost.");
      es.close();
    };
  }

  const allOnline = ENGINES.every((e) => engines[e.id].status === "online");

  return (
    <div
      className="min-h-screen w-full overflow-auto"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0f0f1a 60%, #07070f 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.08); }
        }
        @keyframes glow-in {
          from { box-shadow: none; }
          to { box-shadow: var(--glow); }
        }
        @keyframes scan-line {
          0% { background-position: 0 0; }
          100% { background-position: 0 100px; }
        }
        @keyframes blink-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes all-online-glow {
          0%, 100% { text-shadow: 0 0 20px #34d399, 0 0 40px #34d39966; }
          50%       { text-shadow: 0 0 40px #34d399, 0 0 80px #34d39966; }
        }
        @keyframes button-pulse {
          0%, 100% { box-shadow: 0 0 20px #7c3aed88, 0 0 40px #7c3aed44; }
          50%       { box-shadow: 0 0 40px #7c3aedcc, 0 0 80px #7c3aed66; }
        }
        @keyframes progress-fill {
          from { width: 0%; }
          to   { width: var(--target-width); }
        }
        .engine-card { transition: all 0.4s ease; }
        .engine-card.online {
          border-color: var(--card-color) !important;
          box-shadow: 0 0 0 1px var(--card-color), 0 0 24px var(--card-glow), inset 0 0 24px rgba(0,0,0,0.6);
        }
        .engine-card.initializing {
          border-color: #fbbf24 !important;
          box-shadow: 0 0 12px rgba(251,191,36,0.3);
        }
        .engine-card.running {
          border-color: var(--card-color) !important;
          box-shadow: 0 0 16px var(--card-glow);
        }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .status-dot.offline  { background: #374151; }
        .status-dot.initializing { background: #fbbf24; animation: blink-dot 0.6s infinite; }
        .status-dot.running  { background: var(--dot-color); animation: blink-dot 0.8s infinite; }
        .status-dot.online   { background: #34d399; box-shadow: 0 0 8px #34d39988; }
        .grid-bg {
          background-image: linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <div className="grid-bg min-h-screen">

        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Radio size={14} className="text-violet-400" />
            <span className="text-xs font-mono tracking-widest text-violet-400 uppercase">
              Certxa Intelligence System · Demo Mode
            </span>
          </div>
          <button
            onClick={() => navigate("/intelligence")}
            className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            Skip → Dashboard
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-16 pt-10">

          {/* Title */}
          <div className="text-center mb-10">
            {phase === "idle" && (
              <div style={{ animation: "slide-up 0.6s ease both" }}>
                <p className="text-xs font-mono tracking-widest text-violet-500 uppercase mb-3">
                  8 engines · standing by
                </p>
                <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                  Revenue Intelligence
                </h1>
                <p className="text-slate-400 text-base max-w-md mx-auto">
                  All engines are offline. Press the button below to initialise the full intelligence stack on your demo data.
                </p>
              </div>
            )}
            {phase === "launching" && (
              <div style={{ animation: "slide-up 0.4s ease both" }}>
                <p className="text-xs font-mono tracking-widest text-amber-400 uppercase mb-3">
                  sequence in progress
                </p>
                <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                  Initialising{dots}
                </h1>
                <p className="text-slate-400 text-sm">
                  Engines are coming online. This takes 20–40 seconds.
                </p>
              </div>
            )}
            {phase === "complete" && (
              <div style={{ animation: "slide-up 0.4s ease both" }}>
                <p className="text-xs font-mono tracking-widest text-emerald-400 uppercase mb-3">
                  all systems nominal
                </p>
                <h1
                  className="text-4xl sm:text-5xl font-black tracking-tight"
                  style={{
                    color: "#34d399",
                    animation: "all-online-glow 2s ease-in-out infinite",
                  }}
                >
                  All Engines Online
                </h1>
                <p className="text-slate-400 text-sm mt-3">
                  Revenue Intelligence is fully initialised. Your dashboard is ready.
                </p>
              </div>
            )}
          </div>

          {/* Engine grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {ENGINES.map((engine) => {
              const state = engines[engine.id];
              return (
                <div
                  key={engine.id}
                  className={`engine-card relative rounded-xl border p-4 ${state.status}`}
                  style={{
                    borderColor: state.status === "offline" ? "rgba(255,255,255,0.06)" : undefined,
                    background: state.status === "online"
                      ? `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))`
                      : "rgba(0,0,0,0.5)",
                    ["--card-color" as any]: engine.color,
                    ["--card-glow" as any]: engine.glow,
                    ["--dot-color" as any]: engine.color,
                  }}
                >
                  {/* Status dot */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`status-dot ${state.status}`}
                      style={{ ["--dot-color" as any]: engine.color }}
                    />
                    <span className="text-[9px] font-mono uppercase tracking-widest"
                      style={{
                        color: state.status === "online" ? engine.color
                          : state.status === "initializing" ? "#fbbf24"
                          : state.status === "running" ? engine.color
                          : "#374151",
                      }}
                    >
                      {state.status === "offline" ? "OFFLINE"
                        : state.status === "initializing" ? "BOOT"
                        : state.status === "running" ? "RUN"
                        : "ONLINE"}
                    </span>
                  </div>

                  {/* Icon */}
                  <engine.Icon
                    size={22}
                    style={{
                      color: state.status === "offline" ? "#374151" : engine.color,
                      transition: "color 0.4s ease",
                      filter: state.status === "online" ? `drop-shadow(0 0 6px ${engine.color})` : undefined,
                    }}
                    className="mb-2"
                  />

                  {/* Label */}
                  <p className="text-[11px] font-semibold leading-tight mb-1"
                    style={{ color: state.status === "offline" ? "#4b5563" : "#e2e8f0" }}
                  >
                    {engine.label}
                  </p>
                  <p className="text-[10px] leading-snug"
                    style={{ color: state.status === "offline" ? "#374151" : "#64748b" }}
                  >
                    {state.status === "online" && state.result
                      ? state.result
                      : engine.description}
                  </p>

                  {/* Progress bar */}
                  {(state.status === "running" || state.status === "initializing") && (
                    <div className="mt-3 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${state.progress}%`,
                          background: `linear-gradient(90deg, ${engine.color}88, ${engine.color})`,
                          boxShadow: `0 0 6px ${engine.color}`,
                          minWidth: state.status === "initializing" ? "20%" : undefined,
                        }}
                      />
                    </div>
                  )}

                  {/* Online checkmark */}
                  {state.status === "online" && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 size={13} style={{ color: "#34d399", filter: "drop-shadow(0 0 4px #34d399)" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Launch button */}
          {phase === "idle" && (
            <div className="flex justify-center" style={{ animation: "slide-up 0.8s ease both" }}>
              <button
                onClick={handleLaunch}
                disabled={!selectedStore?.id}
                className="relative px-12 py-5 rounded-2xl font-black text-lg tracking-wider text-white uppercase disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                  animation: "button-pulse 2s ease-in-out infinite",
                  letterSpacing: "0.12em",
                }}
              >
                <span className="flex items-center gap-3">
                  <Zap size={20} />
                  Initiate Intelligence Engines
                  <Zap size={20} />
                </span>
              </button>
            </div>
          )}

          {/* Open dashboard button */}
          {phase === "complete" && (
            <div className="flex justify-center" style={{ animation: "slide-up 0.6s ease both" }}>
              <button
                onClick={() => navigate("/intelligence")}
                className="flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base text-white transition-all duration-200 active:scale-95 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #059669, #047857)",
                  boxShadow: "0 0 32px #059669aa, 0 0 64px #05966944",
                  letterSpacing: "0.04em",
                }}
              >
                Open Intelligence Dashboard
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Activity log */}
          {phase !== "idle" && (
            <div
              className="mt-8 rounded-xl border border-white/5 overflow-hidden"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" style={{ animation: phase === "launching" ? "blink-dot 1s infinite" : undefined }} />
                <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                  Engine Activity Log
                </span>
              </div>
              <div
                ref={logRef}
                className="font-mono text-[11px] text-slate-400 px-4 py-3 space-y-0.5 overflow-y-auto"
                style={{ maxHeight: "160px" }}
              >
                {log.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      color: line.startsWith("[ONLINE]") ? "#34d399"
                        : line.startsWith("[ERROR]") ? "#f87171"
                        : line.startsWith("[SYSTEM]") ? "#a78bfa"
                        : "#64748b",
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
