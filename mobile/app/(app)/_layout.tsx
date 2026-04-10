import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Colors } from "@/src/constants/colors";
import { crewGet } from "@/src/lib/api";

function ActiveBadge() {
  const { data } = useQuery<any>({
    queryKey: ["/api/crew/me"],
    queryFn: () => crewGet("/api/crew/me"),
    refetchInterval: 15000,
  });
  if (!data?.activeJob) return null;
  return (
    <View style={styles.badge}>
      <View style={styles.badgeDot} />
    </View>
  );
}

export default function AppLayout() {
  const tabBarHeight = Platform.OS === "web" ? 84 : 64;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: Platform.OS === "web" ? 34 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.foregroundTertiary,
        tabBarLabelStyle: { fontFamily: "Inter_600SemiBold", fontSize: 11, marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="briefcase-outline" size={size} color={color} />
              <ActiveBadge />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="job/[id]"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: { position: "absolute", top: -2, right: -4, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.surface },
  badgeDot: { flex: 1 },
});
