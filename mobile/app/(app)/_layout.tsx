import { Tabs } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
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
  return <View style={styles.badge} />;
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
      {/* Home dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Schedule calendar */}
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Jobs list */}
      <Tabs.Screen
        name="jobs"
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

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden routes */}
      <Tabs.Screen name="job/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute", top: -2, right: -4,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2, borderColor: Colors.surface,
  },
});
