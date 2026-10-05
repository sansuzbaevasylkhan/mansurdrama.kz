import React, { useEffect } from "react";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { useNetwork } from '@/lib/useNetwork';
import { NetworkStatusBar } from '@/components/ui/NetworkStatusBar';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("CRITICAL App Crash:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: "#0a0a10", justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: "white", textAlign: "center", fontSize: 18, fontWeight: 'bold' }}>Қосымшада техникалық қате шықты</Text>
          <Text style={{ color: "white/60", textAlign: "center", marginTop: 10 }}>{this.state.error?.message || "Белгісіз қате"}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const { isConnected } = useNetwork();

  useEffect(() => {
    // Register for push notifications on app start
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          console.log('Expo Push Token:', token);
          // Мұнда токенді серверге (Supabase/Firebase) жіберу логикасын қосу керек
        }
      })
      .catch(err => console.error('Notification registration error:', err));
  }, []);

  return (
    <ErrorBoundary>
      <>
        <NetworkStatusBar isConnected={isConnected} />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0a0a10" },
          }}
        />
      </>
    </ErrorBoundary>
  );
}
