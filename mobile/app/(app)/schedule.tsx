import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/src/constants/colors";
import { crewGet } from "@/src/lib/api";

// ─── Grid constants ────────────────────────────────────────────────────────
const HOUR_H    = 72;   // px per hour
const TIME_W    = 68;   // width of time label column
const DAY_START = 7;    // 7 am
const DAY_END   = 20;   // 8 pm
const HOURS     = Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i);
const TOTAL_H   = HOURS.length * HOUR_H;

// ─── Helpers ──────────────────────────────────────────────────────────────
function fmtHour(h: number) {
  if (h === 0 || h === 24) return "12 am";
  if (h === 12) return "12 pm";
  return h < 12 ? `${h} am` : `${h - 12} pm`;
}

function fmtTimeRange(scheduledAt: string, estHours: number | null) {
  const s = new Date(scheduledAt);
  const sh = s.getHours(), sm = s.getMinutes();
  const dur = estHours ?? 1;
  const totalMin = sh * 60 + sm + dur * 60;
  const eh = Math.floor(totalMin / 60) % 24, em = totalMin % 60;
  const f = (h: number, m: number) => {
    const suffix = h < 12 ? "a" : "p";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`;
  };
  return `${f(sh, sm)} - ${f(eh, em)}`;
}

function fmtFullDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function jobTopPx(scheduledAt: string) {
  const d = new Date(scheduledAt);
  const fromStart = (d.getHours() - DAY_START) + d.getMinutes() / 60;
  return Math.max(0, fromStart * HOUR_H);
}

function jobHeightPx(estHours: number | null) {
  return Math.max((estHours ?? 1) * HOUR_H - 6, 48);
}

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; bg: string; border: string }> = {
  new:         { label: "Scheduled",   bg: "#1e3a5f", border: "#3b82f6" },
  assigned:    { label: "Assigned",    bg: "#1e40af", border: "#3b82f6" },
  en_route:    { label: "En Route",    bg: "#78350f", border: "#f59e0b" },
  in_progress: { label: "Active",      bg: "#064e3b", border: "#00D4AA" },
  completed:   { label: "Completed",   bg: "#14532d", border: "#22c55e" },
  cancelled:   { label: "Cancelled",   bg: "#450a0a", border: "#ef4444" },
};

// ─── Job block ─────────────────────────────────────────────────────────────
function JobBlock({ job }: { job: any }) {
  const router = useRouter();
  const top = jobTopPx(job.scheduledAt);
  const height = jobHeightPx(Number(job.estimatedHours) || null);
  const cfg = STATUS_CFG[job.status] ?? STATUS_CFG.new;

  return (
    <TouchableOpacity
      style={[styles.jobBlock, {
        top, height,
        backgroundColor: cfg.bg,
        borderLeftColor: cfg.border,
      }]}
      onPress={() => { Haptics.selectionAsync(); router.push(`/(app)/job/${job.id}`); }}
      activeOpacity={0.85}
    >
      <View style={[styles.jobStatusRow]}>
        <Text style={styles.jobStatusLabel}>Status:</Text>
        <View style={[styles.statusPill, { borderColor: cfg.border + "88" }]}>
          <Text style={[styles.statusPillText, { color: cfg.border }]}>{cfg.label}</Text>
        </View>
      </View>

      {height > 52 && (
        <View style={styles.jobRow}>
          <Text style={styles.jobFieldLabel}>Type:</Text>
          <Text style={styles.jobFieldValue} numberOfLines={1}>{job.serviceType}</Text>
        </View>
      )}

      {height > 74 && (
        <View style={styles.jobRow}>
          <Text style={styles.jobFieldLabel}>Time:</Text>
          <Text style={styles.jobFieldValue}>
            {fmtTimeRange(job.scheduledAt, Number(job.estimatedHours) || null)}
          </Text>
        </View>
      )}

      {height > 96 && job.customerName && (
        <View style={styles.jobRow}>
          <Text style={styles.jobFieldLabel}>Client:</Text>
          <Text style={styles.jobFieldValue} numberOfLines={1}>{job.customerName}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────────
export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 100 : insets.bottom + 84;

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [now] = useState(() => new Date());
  const [clockedIn, setClockedIn] = useState(false);

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/crew/orders"],
    queryFn: () => crewGet("/api/crew/orders"),
    refetchInterval: 30000,
  });

  const dateStr = selectedDate.toDateString();
  const dayJobs = (orders as any[]).filter((o: any) => {
    if (!o.scheduledAt) return false;
    return new Date(o.scheduledAt).toDateString() === dateStr;
  });

  // Current time indicator
  const isToday = selectedDate.toDateString() === now.toDateString();
  const nowFrac = (now.getHours() - DAY_START) + now.getMinutes() / 60;
  const nowPx = nowFrac * HOUR_H;
  const showNow = isToday && nowFrac >= 0 && nowFrac <= HOURS.length;

  const prevDay = () => { Haptics.selectionAsync(); setSelectedDate(d => new Date(d.getTime() - 86400000)); };
  const nextDay = () => { Haptics.selectionAsync(); setSelectedDate(d => new Date(d.getTime() + 86400000)); };
  const goToday = () => { Haptics.selectionAsync(); setSelectedDate(new Date()); };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.clockBtn, clockedIn && styles.clockBtnActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setClockedIn(v => !v); }}
          activeOpacity={0.8}
        >
          <Ionicons name={clockedIn ? "time" : "time-outline"} size={14} color={clockedIn ? "#fff" : Colors.primary} />
          <Text style={[styles.clockBtnText, clockedIn && styles.clockBtnTextActive]}>
            {clockedIn ? "Clock Out" : "Clock in"}
          </Text>
        </TouchableOpacity>

        <View style={styles.statusWrap}>
          <Text style={styles.statusTopLabel}>Current status:</Text>
          <Text style={[styles.statusValue, { color: clockedIn ? Colors.success : Colors.destructive }]}>
            {clockedIn ? "Clocked in" : "Clocked out"}
          </Text>
        </View>
      </View>

      {/* ── Title + date nav ────────────────────────────────────────────── */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Schedule</Text>
      </View>
      <View style={styles.dateNav}>
        <Text style={styles.dateLabel}>{fmtFullDate(selectedDate)}</Text>
        <View style={styles.dateNavBtns}>
          <TouchableOpacity onPress={prevDay} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={18} color={Colors.foregroundSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextDay} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={18} color={Colors.foregroundSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToday} style={styles.todayBtn}>
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Calendar grid ───────────────────────────────────────────────── */}
      <ScrollView
        style={styles.gridScroll}
        contentContainerStyle={{ paddingBottom: botPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: TOTAL_H, flexDirection: "row" }}>

          {/* Time labels */}
          <View style={[styles.timeCol, { width: TIME_W }]}>
            {HOURS.map((h, i) => (
              <View key={h} style={[styles.hourLabel, { top: i * HOUR_H }]}>
                <Text style={styles.hourText}>{fmtHour(h)}</Text>
              </View>
            ))}
          </View>

          {/* Job area */}
          <View style={styles.jobArea}>
            {/* Hour lines */}
            {HOURS.map((_, i) => (
              <View key={i} style={[styles.hourLine, { top: i * HOUR_H }]} />
            ))}
            {/* Half-hour dashes */}
            {HOURS.map((_, i) => (
              <View key={`h${i}`} style={[styles.halfLine, { top: i * HOUR_H + HOUR_H / 2 }]} />
            ))}

            {/* Current time indicator */}
            {showNow && (
              <View style={[styles.nowLine, { top: nowPx }]}>
                <View style={styles.nowDot} />
                <View style={styles.nowBar} />
              </View>
            )}

            {/* Job blocks */}
            {dayJobs.map((job: any) => (
              <JobBlock key={job.id} job={job} />
            ))}

            {/* Empty state */}
            {dayJobs.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={36} color={Colors.foregroundTertiary} />
                <Text style={styles.emptyText}>No jobs scheduled</Text>
                <Text style={styles.emptySubText}>
                  {isToday ? "Nothing scheduled for today" : `Nothing on ${fmtFullDate(selectedDate)}`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  clockBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 24, borderWidth: 1.5, borderColor: Colors.primary,
  },
  clockBtnActive: { backgroundColor: Colors.primary },
  clockBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.primary },
  clockBtnTextActive: { color: "#fff" },
  statusWrap: { alignItems: "flex-end" },
  statusTopLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.foregroundSecondary },
  statusValue: { fontFamily: "Inter_600SemiBold", fontSize: 12 },

  titleRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.foreground },

  dateNav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dateLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.foreground },
  dateNavBtns: { flexDirection: "row", alignItems: "center", gap: 4 },
  navBtn: { padding: 6, borderRadius: 8 },
  todayBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  todayText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.primary },

  gridScroll: { flex: 1 },

  timeCol: { position: "relative" },
  hourLabel: {
    position: "absolute", left: 0, right: 0,
    paddingLeft: 16, paddingTop: 6,
  },
  hourText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.foregroundTertiary },

  jobArea: { flex: 1, position: "relative" },
  hourLine: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: Colors.border },
  halfLine: { position: "absolute", left: 0, right: 0, height: 1, borderStyle: "dashed", borderTopWidth: 1, borderTopColor: Colors.border + "60" },

  nowLine: { position: "absolute", left: 0, right: 0, flexDirection: "row", alignItems: "center", zIndex: 20 },
  nowDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ef4444", marginRight: -5 },
  nowBar: { flex: 1, height: 2, backgroundColor: "#ef4444" },

  jobBlock: {
    position: "absolute", left: 6, right: 6,
    borderRadius: 10, borderLeftWidth: 3,
    padding: 10, zIndex: 10,
  },
  jobStatusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  jobStatusLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.6)", width: 50 },
  statusPill: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, borderWidth: 1,
  },
  statusPillText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  jobRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  jobFieldLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.5)", width: 50 },
  jobFieldValue: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "rgba(255,255,255,0.9)", flex: 1 },

  emptyState: { position: "absolute", top: 80, left: 0, right: 0, alignItems: "center", gap: 10 },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.foregroundSecondary },
  emptySubText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.foregroundTertiary },
});
