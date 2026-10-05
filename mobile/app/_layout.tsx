import React, { useEffect } from "react";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, Platform } from "react-native";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import {/lib/useNetwork';
import { NetworkStatusBar } from '@/components/ui/NetworkStatusBar';
import * as NavigationBar from 'expo-navigation-bar';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
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
    // 1. Push notifications registration
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          console.log('Expo Push Token:', token);
        }
      })
      .catch(err => console.error('Notification registration error:', err));

    // 2. Fullscreen Mode Configuration (Android)
    if (Platform.OS === 'android') {
      // Hide the navigation bar (bottom buttons)
      NavigationBar.setBehaviorAsync('inset-touch');
      NavigationBar.setVisibilityAsync('hidden');

      // Make sure it stays hidden unless user swipes from bottom
      NavigationBar.setBehaviorAsync('inset-touch');
    }
  }, []);

  return (
    <ErrorBoundary>
      <>
        <NetworkStatusBar isConnected={isConnected} />
        {/* hidden prop hides the top status bar (time, battery) */}
        <StatusBar hidden={true} style="light" />
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
