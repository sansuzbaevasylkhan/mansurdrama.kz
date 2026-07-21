import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { useUser } from "@/lib/user-store";

export default function RootLayout() {
  const hydrate = useUser((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0a0a10" }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0a0a10" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0a0a10" },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="drama/[slug]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="auth/login"
            options={{ presentation: "modal", animation: "fade_from_bottom" }}
          />
          <Stack.Screen
            name="profile"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
