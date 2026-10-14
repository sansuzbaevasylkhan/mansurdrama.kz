import React, { useEffect } from "react";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, Platform } from "react-native";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { useNetwork } from '@/lib/useNetwork';
import { NetworkStatusBar } from '@/components/ui/NetworkStatusBar';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenCapture from 'expo-screen-capture';
import { AuthProvider } from '@/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
    // 1. Prevent screenshots and screen recording
    try {
      if (ScreenCapture && typeof ScreenCapture.preventScreenCaptureAsync === 'function') {
        ScreenCapture.preventScreenCaptureAsync()
          .then(() => console.log('Screenshots and recording prevented'))
          .catch(err => console.error('Screen capture prevention error:', err));
      }
    } catch (e) {
      console.error('Critical error in ScreenCapture block: ', e);
    }

    // 2. Push notifications registration
    try {
      if (typeof registerForPushNotificationsAsync === 'function') {
        registerForPushNotificationsAsync()
          .then(token => {
            if (token) {
              console.log('Expo Push Token:', token);
            }
          })
          .catch(err => console.error('Notification registration error:', err));
      }
    } catch (e) {
      console.error('Critical error in registerForPushNotificationsAsync block: ', e);
    }

    // 3. Fullscreen Mode Configuration (Android)
    if (Platform.OS === 'android') {
      try {
        if (NavigationBar && typeof NavigationBar.setBehaviorAsync === 'function') {
          NavigationBar.setBehaviorAsync('inset-touch').catch(e => console.error('NavigationBar setBehaviorAsync error:', e));
          NavigationBar.setVisibilityAsync('hidden').catch(e => console.error('NavigationBar setVisibilityAsync error:', e));
        }
      } catch (e) {
        console.error('Critical error in NavigationBar block: ', e);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ErrorBoundary>
          <>
            <NetworkStatusBar isConnected={isConnected} />
            <StatusBar hidden={true} style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#0a0a10" },
              }}
            />
          </>
        </ErrorBoundary>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

