import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { Colors } from "@/src/constants/colors";
import { crewGet, crewPost } from "@/src/lib/api";
import { useAuth } from "@/src/context/AuthContext";

const GPS_INTERVAL_MS = 60_000;

export default function HomeScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 100 : insets.bottom + 84;

  const [clockedIn, setClockedIn] = useState(false);
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const gpsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendLocation = async () => {
    if (Platform.OS === "web") return;
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await crewPost("/api/crew/location", {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    } catch {
    }
  };

  useEffect(() => {
    if (clockedIn) {
      (async () => {
        if (Platform.OS !== "web") {
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationGranted(status === "granted");
          if (status !== "granted") return;
        }
        sendLocation();
        gpsTimerRef.current = setInterval(sendLocation, GPS_INTERVAL_MS);
      })();
    } else {
      if (gpsTimerRef.current) {
        clearInterval(gpsTimerRef.current);
        gpsTimerRef.current = null;
      }
    }
    return () => {
      if (gpsTimerRef.current) {
        clearInterval(gpsTimerRef.current);
        gpsTimerRef.current = null;
      }
    };
  }, [clockedIn]);

  const { data: meData } = useQuery<any>({
    queryKey: ["/api/crew/me"],
    queryFn: () => crewGet("/api/crew/me"),
    refetchInterval: 60000,
  });

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/crew/orders"],
    queryFn: () => crewGet("/api/crew/orders"),
    refetchInterval: 60000,
  });

  const activeJob = (orders as any[]).find((o: any) => o.status === "in_progress");
  const todayJobs = (orders as any[]).filter((o: any) => {
    if (!o.scheduledAt) return false;
    return new Date(o.scheduledAt).toDateString() === new Date().toDateString();
  });
  const pendingCount = (orders as any[]).filter((o: any) =>
    !["completed", "cancelled"].includes(o.status)
  ).length;

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleClockToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setClockedIn(v => !v);
  };

  const ACTION_BUTTONS = [
    {
      icon: "calendar-outline",
      label: "Daily Schedule",
      sublabel: `${todayJobs.length} jobs today`,
      color: Colors.primary,
      onPress: () => { Haptics.selectionAsync(); router.push("/(app)/schedule"); },
      large: true,
    },
    {
      icon: "briefcase-outline",
      label: "My Jobs",
      sublabel: `${pendingCount} pending`,
      color: "#3b82f6",
      onPress: () => { Haptics.selectionAsync(); router.push("/(app)/jobs"); },
    },
    {
      icon: "person-outline",
      label: "Profile",
      sublabel: "Stats & settings",
      color: "#8b5cf6",
      onPress: () => { Haptics.selectionAsync(); router.push("/(app)/profile"); },
    },
    {
      icon: "location-outline",
      label: "Active Job",
      sublabel: activeJob ? activeJob.serviceType : "None active",
      color: activeJob ? Colors.primary : Colors.foregroundTertiary,
      onPress: () => {
        Haptics.selectionAsync();
        if (activeJob) router.push(`/(app)/job/${activeJob.id}`);
      },
    },
  ];

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* ── Top header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greet}>{greet()},</Text>
          <Text style={styles.name} numberOfLines={1}>
            {meData?.name ?? "Crew Member"}
          </Text>
        </View>

        {/* Clock In / Out */}
        <TouchableOpacity
          style={[styles.clockBtn, clockedIn && styles.clockBtnActive]}
          onPress={handleClockToggle}
          activeOpacity={0.8}
        >
          <Ionicons
            name={clockedIn ? "time" : "time-outline"}
            size={15}
            color={clockedIn ? Colors.background : Colors.primary}
          />
          <Text style={[styles.clockBtnText, clockedIn && styles.clockBtnTextActive]}>
            {clockedIn ? "Clock Out" : "Clock In"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Status bar ─────────────────────────────────────────────────── */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: clockedIn ? Colors.primary : Colors.destructive }]} />
        <Text style={styles.statusLabel}>
          Current status:{" "}
          <Text style={{ color: clockedIn ? Colors.primary : Colors.destructive, fontFamily: "Inter_600SemiBold" }}>
            {clockedIn ? "Clocked in" : "Clocked out"}
          </Text>
        </Text>
        {activeJob && (
          <View style={styles.activePill}>
            <View style={styles.activePillDot} />
            <Text style={styles.activePillText}>Job active</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Active job notice ─────────────────────────────────────────── */}
        {activeJob && (
          <TouchableOpacity
            style={styles.activeBanner}
            onPress={() => router.push(`/(app)/job/${activeJob.id}`)}
            activeOpacity={0.85}
          >
            <View style={styles.activePulse} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeBannerTag}>ACTIVE JOB</Text>
              <Text style={styles.activeBannerName} numberOfLines={1}>
                {activeJob.customerName}
              </Text>
              <Text style={styles.activeBannerService}>{activeJob.serviceType}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}

        {/* ── Action buttons ──────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>QUICK ACCESS</Text>

        {/* Large schedule button */}
        <TouchableOpacity
          style={[styles.bigBtn, { borderColor: ACTION_BUTTONS[0].color + "55" }]}
          onPress={ACTION_BUTTONS[0].onPress}
          activeOpacity={0.85}
        >
          <View style={[styles.bigBtnIcon, { backgroundColor: ACTION_BUTTONS[0].color + "22" }]}>
            <Ionicons name={ACTION_BUTTONS[0].icon as any} size={28} color={ACTION_BUTTONS[0].color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bigBtnLabel}>{ACTION_BUTTONS[0].label}</Text>
            <Text style={styles.bigBtnSub}>{ACTION_BUTTONS[0].sublabel}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={ACTION_BUTTONS[0].color} />
        </TouchableOpacity>

        {/* 2-column grid for remaining buttons */}
        <View style={styles.grid}>
          {ACTION_BUTTONS.slice(1).map((btn) => (
            <TouchableOpacity
              key={btn.label}
              style={[styles.gridBtn, { borderColor: btn.color + "33" }]}
              onPress={btn.onPress}
              activeOpacity={0.85}
            >
              <View style={[styles.gridBtnIcon, { backgroundColor: btn.color + "18" }]}>
                <Ionicons name={btn.icon as any} size={22} color={btn.color} />
              </View>
              <Text style={styles.gridBtnLabel}>{btn.label}</Text>
              <Text style={styles.gridBtnSub} numberOfLines={1}>{btn.sublabel}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Today summary ────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>TODAY AT A GLANCE</Text>
        <View style={styles.summaryRow}>
          {[
            { label: "Scheduled", value: todayJobs.length, color: Colors.primary },
            { label: "Pending", value: pendingCount, color: "#f59e0b" },
            { label: "Completed", value: (orders as any[]).filter((o: any) => o.status === "completed").length, color: Colors.success },
          ].map(s => (
            <View key={s.label} style={[styles.summaryCard, { borderColor: s.color + "30" }]}>
              <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  greet: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.foregroundSecondary },
  name: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.foreground },

  clockBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 24, borderWidth: 1.5, borderColor: Colors.primary,
  },
  clockBtnActive: { backgroundColor: Colors.primary },
  clockBtnText: {
    fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.primary,
  },
  clockBtnTextActive: { color: Colors.background },

  statusBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.foregroundSecondary, flex: 1 },
  activePill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.primary + "22", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  activePillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  activePillText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: Colors.primary },

  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 10, color: Colors.foregroundTertiary,
    letterSpacing: 1.5, marginBottom: 8,
  },

  activeBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.primary + "18", borderRadius: Colors.radius,
    borderWidth: 1.5, borderColor: Colors.primary + "55", padding: 16,
    marginBottom: 16,
  },
  activePulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  activeBannerTag: { fontFamily: "Inter_600SemiBold", fontSize: 9, color: Colors.primary, letterSpacing: 2 },
  activeBannerName: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.foreground, marginTop: 2 },
  activeBannerService: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.foregroundSecondary },

  bigBtn: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: Colors.surface, borderRadius: Colors.radius,
    borderWidth: 1, padding: 16,
  },
  bigBtnIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bigBtnLabel: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.foreground },
  bigBtnSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.foregroundSecondary, marginTop: 2 },

  grid: { flexDirection: "row", gap: 12, marginTop: 4 },
  gridBtn: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Colors.radius,
    borderWidth: 1, padding: 14, alignItems: "flex-start", gap: 6,
  },
  gridBtnIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  gridBtnLabel: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.foreground },
  gridBtnSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.foregroundSecondary },

  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Colors.radius,
    borderWidth: 1, paddingVertical: 14, alignItems: "center", gap: 4,
  },
  summaryVal: { fontFamily: "Inter_700Bold", fontSize: 26 },
  summaryLabel: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.foregroundSecondary },
});
