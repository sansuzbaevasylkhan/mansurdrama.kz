import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Switch, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function NotificationSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    payments: true,
    newEpisodes: true,
    promos: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error("Fetch settings error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function updateSetting(key: string, value: boolean) {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ [key]: value })
      });

      if (!res.ok) throw new Error();
    } catch (e) {
      // Rollback on error
      setSettings(settings);
      alert("Баптауларды сақтау мүмкін болмады");
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
      <View className="px-4 py-3 flex-row items-center gap-3 border-b border-white/10">
        <Pressable onPress={() => router.back()} className="p-2 rounded-full bg-white/5">
          <ChevronLeft size={20} color="#fff" />
        </Pressable>
        <Text className="text-lg font-bold text-white">Хабарламалар баптаулары</Text>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-4">
        <View className="p-4 rounded-2xl bg-white/5 border border-white/10 gap-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <View className="p-2 rounded-lg bg-yellow-500/20">
                <Bell size={18} color="#eab308" />
              </View>
              <View>
                <Text className="text-white font-semibold">Төлем хабарламалары</Text>
                <Text className="text-xs text-white/50">Төлем мәртебесі туралы</Text>
              </View>
            </View>
            <Switch
              value={settings.payments}
              onValueChange={(val) => updateSetting('payments', val)}
              trackColor={{ false: "#3f3f46", true: "#ec4899" }}
              thumbColor="#fff"
            />
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <View className="p-2 rounded-lg bg-blue-500/20">
                <Bell size={18} color="#3b82f6" />
              </View>
              <View>
                <Text className="text-white font-semibold">Жаңа серия шықты</Text>
                <Text className="text-xs text-white/50">Жаңа бөлімдер жарияланғанда</Text>
              </View>
            </View>
            <Switch
              value={settings.newEpisodes}
              onValueChange={(val) => updateSetting('newEpisodes', val)}
              trackColor={{ false: "#3f3f46", true: "#ec4899" }}
              thumbColor="#fff"
            />
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <View className="p-2 rounded-lg bg-purple-500/20">
                <Bell size={18} color="#a855f7" />
              </View>
              <View>
                <Text className="text-white font-semibold">Акция және жеңілдіктер</Text>
                <Text className="text-xs text-white/50">Маңызды хабарландырулар</Text>
              </View>
            </View>
            <Switch
              value={settings.promos}
              onValueChange={(val) => updateSetting('promos', val)}
              trackColor={{ false: "#3f3f46", true: "#ec4899" }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
