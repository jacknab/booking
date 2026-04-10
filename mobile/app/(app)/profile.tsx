import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/src/constants/colors";
import { crewGet } from "@/src/lib/api";
import { useAuth } from "@/src/context/AuthContext";

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <View style={[statStyles.card, { borderColor: color + "33", backgroundColor: color + "11" }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: { flex: 1, alignItems: "center", borderRadius: Colors.radius, borderWidth: 1, paddingVertical: 16, gap: 6 },
  value: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.foreground },
  label: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.foregroundSecondary },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: meData } = useQuery<any>({
    queryKey: ["/api/crew/me"],
    queryFn: () => crewGet("/api/crew/me"),
    refetchInterval: 30000,
  });

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/crew/orders"],
    queryFn: () => crewGet("/api/crew/orders"),
  });

  const completed = orders.filter((o: any) => o.status === "completed").length;
  const active = orders.filter((o: any) => o.status === "in_progress").length;
  const totalHours = orders.filter((o: any) => o.status === "completed" && o.startedAt && o.completedAt)
    .reduce((sum: number, o: any) => {
      const ms = new Date(o.completedAt).getTime() - new Date(o.startedAt).getTime();
      return sum + ms / 3600000;
    }, 0);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); logout(); } },
    ]);
  };

  const crewName = user?.name ?? meData?.name ?? "Crew Member";
  const crewColor = user?.color ?? meData?.color ?? Colors.primary;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 16 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: crewColor + "33", borderColor: crewColor }]}>
            <Text style={[styles.avatarText, { color: crewColor }]}>{crewName[0]?.toUpperCase() ?? "C"}</Text>
          </View>
          <Text style={styles.name}>{crewName}</Text>
          <Text style={styles.role}>Field Technician</Text>
          {(user?.phone || meData?.phone) && (
            <Text style={styles.phone}>{user?.phone ?? meData?.phone}</Text>
          )}
          <View style={[styles.statusPill, active > 0 ? styles.statusActive : styles.statusIdle]}>
            <View style={[styles.statusDot, { backgroundColor: active > 0 ? Colors.primary : Colors.foregroundTertiary }]} />
            <Text style={[styles.statusText, { color: active > 0 ? Colors.primary : Colors.foregroundSecondary }]}>
              {active > 0 ? "On the Job" : "Available"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>TODAY'S SUMMARY</Text>
        <View style={styles.statsRow}>
          <StatCard label="Completed" value={meData?.todayCompleted ?? completed} icon="checkmark-circle-outline" color={Colors.success} />
          <StatCard label="Active" value={active} icon="play-circle-outline" color={Colors.primary} />
          <StatCard label="Hours" value={totalHours.toFixed(1)} icon="time-outline" color={Colors.info} />
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          {[
            { icon: "briefcase-outline", label: "Total Jobs", value: String(orders.length) },
            { icon: "warning-outline", label: "Overtime Flags", value: String(orders.filter((o: any) => o.overtimeFlagged).length), color: Colors.warning },
          ].map((item, i, arr) => (
            <View key={item.label} style={[styles.menuRow, i < arr.length - 1 && styles.menuRowBorder]}>
              <Ionicons name={item.icon} size={18} color={item.color ?? Colors.foregroundSecondary} style={{ width: 24 }} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={[styles.menuValue, item.color ? { color: item.color } : {}]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={Colors.destructive} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Certxa Crew v1.0 · Field Service Platform</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.foreground },
  content: { paddingHorizontal: 16, paddingTop: 24, gap: 8 },
  profileCard: { backgroundColor: Colors.surface, borderRadius: Colors.radiusLarge, padding: 24, alignItems: "center", borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontSize: 36, fontFamily: "Inter_700Bold" },
  name: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.foreground },
  role: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.foregroundSecondary, marginTop: 2, marginBottom: 4 },
  phone: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.foregroundTertiary, marginBottom: 12 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  statusActive: { backgroundColor: Colors.primary + "15", borderColor: Colors.primary + "44" },
  statusIdle: { backgroundColor: Colors.muted, borderColor: Colors.border },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: Colors.foregroundTertiary, letterSpacing: 2, marginTop: 8, marginBottom: 4 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  menuCard: { backgroundColor: Colors.surface, borderRadius: Colors.radius, borderWidth: 1, borderColor: Colors.border },
  menuRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuLabel: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.foreground },
  menuValue: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.foregroundSecondary },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: Colors.destructive + "15", borderRadius: Colors.radius, borderWidth: 1, borderColor: Colors.destructive + "44", paddingVertical: 16, marginTop: 8 },
  logoutText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.destructive },
  footer: { textAlign: "center", fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.foregroundTertiary, marginTop: 8 },
});
