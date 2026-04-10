import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/src/constants/colors";
import { crewGet } from "@/src/lib/api";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  new:         { label: "New",        color: Colors.info,               icon: "radio-button-on" },
  assigned:    { label: "Assigned",   color: Colors.foregroundSecondary, icon: "person-outline" },
  en_route:    { label: "En Route",   color: Colors.warning,             icon: "navigate-outline" },
  in_progress: { label: "Active",     color: Colors.primary,             icon: "play-circle" },
  completed:   { label: "Done",       color: Colors.success,             icon: "checkmark-circle" },
  cancelled:   { label: "Cancelled",  color: Colors.destructive,         icon: "close-circle" },
};

function formatWindow(scheduledAt: string | null): string {
  if (!scheduledAt) return "Unscheduled";
  const d = new Date(scheduledAt);
  const h = d.getHours();
  const start = `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;
  const end4 = h + 4;
  const endLabel = `${end4 % 12 || 12}${end4 < 12 ? "am" : "pm"}`;
  return `${start} – ${endLabel}`;
}

function formatDate(scheduledAt: string | null): string {
  if (!scheduledAt) return "";
  const d = new Date(scheduledAt);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [, forceUpdate] = useState(0);
  React.useEffect(() => {
    const t = setInterval(() => forceUpdate(n => n + 1), 10000);
    return () => clearInterval(t);
  }, []);
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
  const h = Math.floor(elapsed / 60), m = elapsed % 60;
  return <Text style={s.timerText}>{h > 0 ? `${h}h ${m}m` : `${m}m`}</Text>;
}

function ActiveBanner({ job }: { job: any }) {
  const router = useRouter();
  return (
    <TouchableOpacity style={s.activeBanner} onPress={() => router.push(`/(app)/job/${job.id}`)} activeOpacity={0.85}>
      <View style={s.activePulse} />
      <View style={{ flex: 1 }}>
        <Text style={s.activeBannerLabel}>ACTIVE JOB</Text>
        <Text style={s.activeBannerName} numberOfLines={1}>{job.customerName}</Text>
        <Text style={s.activeBannerAddress} numberOfLines={1}>{job.address}</Text>
      </View>
      <View style={s.activeBannerRight}>
        {job.startedAt && <ElapsedTimer startedAt={job.startedAt} />}
        <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

function JobCard({ job }: { job: any }) {
  const router = useRouter();
  const st = STATUS_MAP[job.status] ?? STATUS_MAP.new;
  const isActive = job.status === "in_progress";
  const isLate = job.scheduledAt && new Date(job.scheduledAt) < new Date() && !["completed","cancelled","in_progress"].includes(job.status);
  return (
    <TouchableOpacity
      style={[s.card, isActive && s.cardActive, isLate && s.cardLate]}
      onPress={() => { Haptics.selectionAsync(); router.push(`/(app)/job/${job.id}`); }}
      activeOpacity={0.8}
    >
      <View style={s.cardTop}>
        <View style={[s.statusPill, { backgroundColor: st.color + "22", borderColor: st.color + "55" }]}>
          <Ionicons name={st.icon} size={12} color={st.color} />
          <Text style={[s.statusLabel, { color: st.color }]}>{st.label}</Text>
        </View>
        {job.scheduledAt && (
          <View style={s.timeWrap}>
            <Text style={s.timeDate}>{formatDate(job.scheduledAt)}</Text>
            <Text style={s.timeWindow}>{formatWindow(job.scheduledAt)}</Text>
          </View>
        )}
      </View>
      <Text style={s.customerName} numberOfLines={1}>{job.customerName}</Text>
      <Text style={s.serviceType}>{job.serviceType}</Text>
      <Text style={s.address} numberOfLines={1}>{job.address}{job.city ? `, ${job.city}` : ""}</Text>
      <View style={s.cardBottom}>
        <View style={s.orderBadge}><Text style={s.orderBadgeText}>#{job.orderNumber}</Text></View>
        {job.overtimeFlagged && (
          <View style={s.overtimeBadge}>
            <Ionicons name="warning-outline" size={12} color={Colors.warning} />
            <Text style={s.overtimeText}>Overtime</Text>
          </View>
        )}
        {job.priority === "urgent" && (
          <View style={s.urgentBadge}><Text style={s.urgentText}>URGENT</Text></View>
        )}
        <Ionicons name="chevron-forward" size={16} color={Colors.foregroundTertiary} style={{ marginLeft: "auto" }} />
      </View>
    </TouchableOpacity>
  );
}

export default function JobsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: meData } = useQuery<any>({
    queryKey: ["/api/crew/me"],
    queryFn: () => crewGet("/api/crew/me"),
    refetchInterval: 15000,
  });

  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery<any[]>({
    queryKey: ["/api/crew/orders"],
    queryFn: () => crewGet("/api/crew/orders"),
    refetchInterval: 30000,
  });

  const activeJob = (orders as any[]).find((o: any) => o.status === "in_progress");
  const pendingJobs = (orders as any[]).filter((o: any) => !["completed","cancelled"].includes(o.status) && o.status !== "in_progress");
  const doneJobs = (orders as any[]).filter((o: any) => ["completed","cancelled"].includes(o.status));

  const sections = [
    ...(activeJob ? [{ type: "active" as const, job: activeJob }] : []),
    ...(pendingJobs.length > 0 ? [{ type: "header" as const, label: `UPCOMING (${pendingJobs.length})` }, ...pendingJobs.map(j => ({ type: "job" as const, job: j }))] : []),
    ...(doneJobs.length > 0 ? [{ type: "header" as const, label: `COMPLETED (${doneJobs.length})` }, ...doneJobs.map(j => ({ type: "job" as const, job: j }))] : []),
  ];

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.topBar}>
        <View>
          <Text style={s.topBarGreeting}>My Jobs</Text>
          <Text style={s.topBarName}>{meData?.name ?? "Crew Member"}</Text>
        </View>
        <View style={s.topBarRight}>
          <Text style={s.topBarCount}>{pendingJobs.length}</Text>
          <Text style={s.topBarCountLabel}>pending</Text>
        </View>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item, i) => `${item.type}-${i}`}
        contentContainerStyle={[s.list, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        renderItem={({ item }) => {
          if (item.type === "active") return <ActiveBanner job={item.job} />;
          if (item.type === "header") return <Text style={s.sectionHeader}>{item.label}</Text>;
          if (item.type === "job") return <JobCard job={item.job} />;
          return null;
        }}
        ListEmptyComponent={
          isLoading ? (
            <View style={s.emptyState}>
              <Ionicons name="time-outline" size={40} color={Colors.foregroundTertiary} />
              <Text style={s.emptyText}>Loading jobs…</Text>
            </View>
          ) : (
            <View style={s.emptyState}>
              <Ionicons name="briefcase-outline" size={40} color={Colors.foregroundTertiary} />
              <Text style={s.emptyText}>No jobs assigned</Text>
              <Text style={s.emptySubText}>Pull down to refresh</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  topBarGreeting: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.foregroundSecondary },
  topBarName: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.foreground },
  topBarRight: { alignItems: "flex-end" },
  topBarCount: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.primary },
  topBarCountLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.foregroundSecondary },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  sectionHeader: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.foregroundTertiary, letterSpacing: 1.5, marginTop: 4, marginBottom: 2 },
  activeBanner: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primaryDark + "22", borderRadius: Colors.radius, borderWidth: 1.5, borderColor: Colors.primary + "66", padding: 16, gap: 12 },
  activePulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  activeBannerLabel: { fontFamily: "Inter_600SemiBold", fontSize: 9, color: Colors.primary, letterSpacing: 2 },
  activeBannerName: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.foreground, marginTop: 2 },
  activeBannerAddress: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.foregroundSecondary },
  activeBannerRight: { alignItems: "flex-end", gap: 4 },
  timerText: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.primary },
  card: { backgroundColor: Colors.surface, borderRadius: Colors.radius, padding: 16, borderWidth: 1, borderColor: Colors.border },
  cardActive: { borderColor: Colors.primary + "55", backgroundColor: Colors.primaryDark + "11" },
  cardLate: { borderColor: Colors.warning + "55" },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  timeWrap: { alignItems: "flex-end" },
  timeDate: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.foregroundSecondary },
  timeWindow: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.foregroundTertiary },
  customerName: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.foreground, marginBottom: 2 },
  serviceType: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.primary, marginBottom: 4 },
  address: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.foregroundSecondary, marginBottom: 12 },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: 8 },
  orderBadge: { backgroundColor: Colors.muted, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  orderBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.foregroundTertiary },
  overtimeBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.warning + "22", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  overtimeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.warning },
  urgentBadge: { backgroundColor: Colors.destructive + "22", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  urgentText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: Colors.destructive, letterSpacing: 1 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.foregroundSecondary },
  emptySubText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.foregroundTertiary },
});
