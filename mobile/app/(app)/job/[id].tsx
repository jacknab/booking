import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, TextInput, ActivityIndicator, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/src/constants/colors";
import { crewGet, crewPut, crewPost } from "@/src/lib/api";

const STATUS_FLOW: Record<string, string> = {
  new: "en_route",
  assigned: "en_route",
  en_route: "in_progress",
  in_progress: "completed",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:         { label: "New",        color: Colors.info },
  assigned:    { label: "Assigned",   color: Colors.foregroundSecondary },
  en_route:    { label: "En Route",   color: Colors.warning },
  in_progress: { label: "In Progress",color: Colors.primary },
  completed:   { label: "Completed",  color: Colors.success },
  cancelled:   { label: "Cancelled",  color: Colors.destructive },
};

const NEXT_LABELS: Record<string, string> = {
  new:         "Head Out (En Route)",
  assigned:    "Head Out (En Route)",
  en_route:    "Start Job",
  in_progress: "Complete Job",
};

const NEXT_ICONS: Record<string, any> = {
  new:         "navigate-outline",
  assigned:    "navigate-outline",
  en_route:    "play-circle-outline",
  in_progress: "checkmark-circle-outline",
};

function LiveTimer({ startedAt }: { startedAt: string; estimatedHours?: string | null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const calc = () => setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const fmt = (n: number) => String(n).padStart(2, "0");

  return (
    <View style={timerStyles.wrap}>
      <View style={timerStyles.pulse} />
      <Text style={timerStyles.label}>TIME ELAPSED</Text>
      <Text style={timerStyles.clock}>{h > 0 ? `${fmt(h)}:${fmt(m)}:${fmt(s)}` : `${fmt(m)}:${fmt(s)}`}</Text>
    </View>
  );
}

const timerStyles = StyleSheet.create({
  wrap: { backgroundColor: Colors.primaryDark + "11", borderRadius: Colors.radius, padding: 20, alignItems: "center", borderWidth: 1.5, borderColor: Colors.primary + "44", marginVertical: 8 },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginBottom: 8 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: Colors.primary, letterSpacing: 2, marginBottom: 8 },
  clock: { fontFamily: "Inter_700Bold", fontSize: 48, color: Colors.foreground },
});

function InfoRow({ icon, label, value, onPress }: { icon: any; label: string; value: string; onPress?: () => void }) {
  const Comp = onPress ? TouchableOpacity : View;
  return (
    <Comp style={styles.infoRow} onPress={onPress}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, !!onPress && { color: Colors.primary }]}>{value}</Text>
      </View>
      {!!onPress && <Ionicons name="open-outline" size={14} color={Colors.primary} />}
    </Comp>
  );
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: order, isLoading } = useQuery<any>({
    queryKey: ["/api/crew/orders", id],
    queryFn: () => crewGet(`/api/crew/orders/${id}`),
    refetchInterval: 15000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["/api/crew/orders", id] });
    qc.invalidateQueries({ queryKey: ["/api/crew/orders"] });
    qc.invalidateQueries({ queryKey: ["/api/crew/me"] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: string) => crewPut(`/api/crew/orders/${id}/status`, { status }),
    onSuccess: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); invalidate(); },
  });

  const noteMutation = useMutation({
    mutationFn: (note: string) => crewPost(`/api/crew/orders/${id}/notes`, { note }),
    onSuccess: () => { setNoteText(""); setShowNoteInput(false); invalidate(); },
  });

  const advanceStatus = () => {
    if (!order) return;
    const next = STATUS_FLOW[order.status];
    if (!next) return;
    const labels: Record<string, string> = { en_route: "Mark En Route?", in_progress: "Start this job?", completed: "Mark as completed?" };
    Alert.alert(labels[next] ?? "Update status?", "", [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); statusMutation.mutate(next); } },
    ]);
  };

  const openMaps = () => {
    if (!order) return;
    const q = encodeURIComponent(`${order.address}, ${order.city ?? ""} ${order.state ?? ""} ${order.zip ?? ""}`);
    Linking.openURL(`https://maps.google.com/?q=${q}`);
  };

  const callCustomer = () => {
    if (!order?.customerPhone) return;
    Linking.openURL(`tel:${order.customerPhone.replace(/\D/g, "")}`);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topPad, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }
  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: topPad, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: Colors.foregroundSecondary }}>Job not found</Text>
      </View>
    );
  }

  const nextStatus = STATUS_FLOW[order.status];
  const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.new;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={Colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerOrder}>#{order.orderNumber}</Text>
        </View>
        <View style={[styles.statusChip, { borderColor: statusInfo.color + "55", backgroundColor: statusInfo.color + "22" }]}>
          <Text style={[styles.statusChipText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 80 }]} showsVerticalScrollIndicator={false}>

        <Text style={styles.customerName}>{order.customerName}</Text>
        <Text style={styles.serviceType}>{order.serviceType}</Text>

        {order.status === "in_progress" && order.startedAt && (
          <LiveTimer startedAt={order.startedAt} estimatedHours={order.estimatedHours} />
        )}

        {order.overtimeFlagged && (
          <View style={styles.overtimeAlert}>
            <Ionicons name="warning-outline" size={18} color={Colors.warning} />
            <Text style={styles.overtimeAlertText}>Overtime — this job has exceeded the estimated time. Your office has been notified.</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <InfoRow icon="construct-outline" label="Service Type" value={order.serviceType} />
          {order.description && <InfoRow icon="document-text-outline" label="Description" value={order.description} />}
          {order.estimatedHours && <InfoRow icon="time-outline" label="Estimated Duration" value={`${order.estimatedHours} hours`} />}
          {order.priority && <InfoRow icon="flag-outline" label="Priority" value={order.priority.charAt(0).toUpperCase() + order.priority.slice(1)} />}
          {order.scheduledAt && <InfoRow icon="calendar-outline" label="Scheduled" value={new Date(order.scheduledAt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <InfoRow icon="person-outline" label="Name" value={order.customerName} />
          {order.customerPhone && <InfoRow icon="call-outline" label="Phone" value={order.customerPhone} onPress={callCustomer} />}
          {order.customerEmail && <InfoRow icon="mail-outline" label="Email" value={order.customerEmail} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <InfoRow icon="location-outline" label="Address" value={[order.address, order.city, order.state, order.zip].filter(Boolean).join(", ")} onPress={openMaps} />
        </View>

        {order.notes && order.notes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Notes</Text>
            {order.notes.map((note: any) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteAuthor}>{note.authorName ?? "Crew"}</Text>
                <Text style={styles.noteText}>{note.note}</Text>
                <Text style={styles.noteTime}>{new Date(note.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</Text>
              </View>
            ))}
          </View>
        )}

        {showNoteInput && (
          <View style={styles.noteInputWrap}>
            <TextInput
              style={styles.noteInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add a job note..."
              placeholderTextColor={Colors.foregroundTertiary}
              multiline
              autoFocus
            />
            <View style={styles.noteInputActions}>
              <TouchableOpacity onPress={() => setShowNoteInput(false)}>
                <Text style={styles.noteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.noteSubmitBtn, !noteText.trim() && { opacity: 0.4 }]}
                onPress={() => noteText.trim() && noteMutation.mutate(noteText.trim())}
                disabled={!noteText.trim() || noteMutation.isPending}
              >
                <Text style={styles.noteSubmitText}>{noteMutation.isPending ? "Saving…" : "Add Note"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: bottomPad + 8 }]}>
        {!showNoteInput && (
          <TouchableOpacity style={styles.noteBtn} onPress={() => setShowNoteInput(true)}>
            <Ionicons name="create-outline" size={20} color={Colors.foregroundSecondary} />
          </TouchableOpacity>
        )}
        {nextStatus && !["completed","cancelled"].includes(order.status) && (
          <TouchableOpacity
            style={[styles.advanceBtn, statusMutation.isPending && { opacity: 0.5 }]}
            onPress={advanceStatus}
            disabled={statusMutation.isPending}
            activeOpacity={0.85}
          >
            {statusMutation.isPending ? (
              <ActivityIndicator color={Colors.background} size="small" />
            ) : (
              <>
                <Ionicons name={NEXT_ICONS[order.status] ?? "arrow-forward"} size={20} color={Colors.background} />
                <Text style={styles.advanceBtnText}>{NEXT_LABELS[order.status] ?? "Update"}</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.muted, alignItems: "center", justifyContent: "center" },
  headerOrder: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.foregroundSecondary },
  statusChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusChipText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 4 },
  customerName: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.foreground },
  serviceType: { fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.primary, marginBottom: 16 },
  overtimeAlert: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: Colors.warning + "15", borderRadius: Colors.radius, borderWidth: 1, borderColor: Colors.warning + "44", padding: 14, marginVertical: 8 },
  overtimeAlertText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.warning, lineHeight: 18 },
  section: { backgroundColor: Colors.surface, borderRadius: Colors.radius, padding: 16, borderWidth: 1, borderColor: Colors.border, marginTop: 12 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 12, color: Colors.foregroundTertiary, letterSpacing: 1.5, marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  infoIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.muted, alignItems: "center", justifyContent: "center" },
  infoLabel: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.foregroundTertiary },
  infoValue: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.foreground },
  noteCard: { backgroundColor: Colors.muted, borderRadius: Colors.radiusSmall, padding: 12, marginTop: 8 },
  noteAuthor: { fontFamily: "Inter_700Bold", fontSize: 11, color: Colors.primary, marginBottom: 4 },
  noteText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.foreground, lineHeight: 18 },
  noteTime: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.foregroundTertiary, marginTop: 6 },
  noteInputWrap: { backgroundColor: Colors.surface, borderRadius: Colors.radius, borderWidth: 1, borderColor: Colors.borderBright, padding: 16, marginTop: 12 },
  noteInput: { color: Colors.foreground, fontFamily: "Inter_400Regular", fontSize: 14, minHeight: 80, lineHeight: 20 },
  noteInputActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  noteCancelText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.foregroundSecondary },
  noteSubmitBtn: { backgroundColor: Colors.primary, borderRadius: Colors.radiusSmall, paddingHorizontal: 16, paddingVertical: 8 },
  noteSubmitText: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.background },
  actionBar: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: 16, paddingTop: 12, flexDirection: "row", gap: 12 },
  noteBtn: { width: 48, height: 48, borderRadius: Colors.radius, backgroundColor: Colors.muted, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  advanceBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.primary, borderRadius: Colors.radius, height: 48 },
  advanceBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.background },
});
