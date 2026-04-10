import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/src/context/AuthContext";
import { Colors } from "@/src/constants/colors";

const NUMPAD = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  };

  const handleNumpad = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError("");
    if (key === "⌫") {
      setPin(p => p.slice(0, -1));
    } else if (key && pin.length < 8) {
      const next = pin + key;
      setPin(next);
    }
  };

  const handlePhoneNext = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    setStep("pin");
    setError("");
  };

  const handleLogin = async () => {
    if (pin.length < 4) { setError("PIN must be at least 4 digits"); return; }
    setLoading(true);
    setError("");
    try {
      await login(phone.replace(/\D/g, ""), pin);
    } catch (err: any) {
      setError(err.message ?? "Login failed. Check your phone or PIN.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" scrollEnabled={false}>
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>C</Text>
          </View>
          <Text style={styles.brand}>CERTXA</Text>
          <Text style={styles.brandSub}>CREW</Text>
        </View>

        <View style={styles.card}>
          {step === "phone" ? (
            <>
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSub}>Enter your mobile number to continue</Text>
              <View style={styles.phoneRow}>
                <Ionicons name="call-outline" size={18} color={Colors.foregroundSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.phoneInput}
                  value={formatPhone(phone)}
                  onChangeText={t => { setPhone(t.replace(/\D/g, "")); setError(""); }}
                  placeholder="(555) 555-5555"
                  placeholderTextColor={Colors.foregroundTertiary}
                  keyboardType="number-pad"
                  maxLength={14}
                  autoFocus
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity style={styles.btn} onPress={handlePhoneNext} activeOpacity={0.85}>
                <Text style={styles.btnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.background} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => { setStep("phone"); setPin(""); setError(""); }} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={16} color={Colors.foregroundSecondary} />
                <Text style={styles.backText}>{formatPhone(phone)}</Text>
              </TouchableOpacity>
              <Text style={styles.cardTitle}>Enter PIN</Text>
              <Text style={styles.cardSub}>Use the PIN assigned by your office manager</Text>

              <View style={styles.pinDots}>
                {Array.from({ length: Math.max(pin.length, 4) }, (_, i) => (
                  <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
                ))}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.numpad}>
                {NUMPAD.map((key, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.numKey, !key && styles.numKeyHidden]}
                    onPress={() => key && handleNumpad(key)}
                    activeOpacity={0.7}
                    disabled={!key}
                  >
                    <Text style={styles.numKeyText}>{key}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.btn, (loading || pin.length < 4) && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={loading || pin.length < 4}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.background} size="small" />
                ) : (
                  <>
                    <Text style={styles.btnText}>Sign In</Text>
                    <Ionicons name="lock-open-outline" size={18} color={Colors.background} />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.footer}>Certxa Field Service Platform</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  logoWrap: { width: 72, height: 72, borderRadius: 22, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoText: { fontSize: 36, fontFamily: "Inter_700Bold", color: Colors.background },
  brand: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.foreground, letterSpacing: 6 },
  brandSub: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.primary, letterSpacing: 8, marginTop: 2 },
  card: { width: "100%", backgroundColor: Colors.surface, borderRadius: Colors.radiusLarge, padding: 24, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.foreground, marginBottom: 6 },
  cardSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.foregroundSecondary, marginBottom: 24 },
  phoneRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.muted, borderRadius: Colors.radius, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, marginBottom: 8 },
  phoneInput: { flex: 1, color: Colors.foreground, fontFamily: "Inter_500Medium", fontSize: 18, paddingVertical: 14 },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: { fontFamily: "Inter_500Medium", color: Colors.foregroundSecondary, fontSize: 14, marginLeft: 4 },
  pinDots: { flexDirection: "row", gap: 12, justifyContent: "center", marginVertical: 24 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.border, borderWidth: 2, borderColor: Colors.borderBright },
  dotFilled: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  numpad: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 20 },
  numKey: { width: 72, height: 56, backgroundColor: Colors.muted, borderRadius: Colors.radius, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border },
  numKeyHidden: { backgroundColor: "transparent", borderColor: "transparent" },
  numKeyText: { fontSize: 20, fontFamily: "Inter_600SemiBold", color: Colors.foreground },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.primary, borderRadius: Colors.radius, paddingVertical: 16 },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.background },
  errorText: { color: Colors.destructive, fontFamily: "Inter_500Medium", fontSize: 13, textAlign: "center", marginBottom: 8 },
  footer: { marginTop: 24, fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.foregroundTertiary },
});
