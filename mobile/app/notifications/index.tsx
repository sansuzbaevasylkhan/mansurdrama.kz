import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, SafeAreaView } from "react-native";
import { SafeAreaView as SafeView } from "react-native-safe-area-context";
import { Bell, CheckCircle, Clock, AlertCircle } from "lucide-react-native";
import { useRouter } from "expo-router";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error("Fetch notifications error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function markAllAsRead() {
    setMarkingRead(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error("Mark as read error:", e);
    } finally {
      setMarkingRead(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-950 items-center justify-center">
        <ActivityIndicator color="#ec4899" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-950" edges={["top"]}>
      <View className="px-4 py-3 flex-row items-center justify-between border-b border-white/10">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="p-2 rounded-full bg-white/5">
            <Bell size={20} color="#fff" />
          </Pressable>
          <Text className="text-lg font-bold text-white">Хабарламалар</Text>
        </View>

        {notifications.some(n => !n.isRead) && (
          <Pressable
            onPress={markAllAsRead}
            disabled={markingRead}
            className="px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30"
          >
            <Text className="text-xs font-semibold text-primary-400">
              {markingRead ? '...' : 'Барлығын оқыдым'}
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerClassName="p-4 gap-3">
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Bell size={48} color="rgba(255,255,255,0.1)" />
            <Text className="text-white/40 mt-4 text-center">Хабарламалар жоқ</Text>
          </View>
        ) : (
          notifications.map((n) => (
            <View
              key={n.id}
              className={`p-4 rounded-2xl border ${n.isRead ? 'bg-white/[0.02] border-white/5' : 'bg-white/10 border-white/20'}`}
            >
              <View className="flex-row justify-between items-start mb-1">
                <Text className={`text-sm font-bold ${n.isRead ? 'text-white/80' : 'text-white'}`}>
                  {n.title}
                </Text>
                <View className="flex-row items-center gap-1">
                  <Clock size={10} color="rgba(255,255,255,0.3)" />
                  <Text className="text-[10px] text-white/30">
                    {new Date(n.createdAt).toLocaleDateString('kk-KZ')}
                  </Text>
                </View>
              </View>
              <Text className={`text-xs leading-4 ${n.isRead ? 'text-white/50' : 'text-white/80'}`}>
                {n.body}
              </Text>
              {!n.isRead && (
                <View className="mt-2 h-1 w-1 rounded-full bg-primary-500 ml-1" />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
