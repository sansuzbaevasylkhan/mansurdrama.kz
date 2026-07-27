import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useUser } from "@/lib/user-store";

export default function RootLayout() {
  const hydrate = useUser((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <StatusBar style="light" backgroundColor="#0a0a10" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a10" },
        }}
      />
    </>
  );
}
