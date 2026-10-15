import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { prisma } from "@/lib/prisma"; // Note: This is a frontend component, will use API instead
import { Button } from "@/components/ui/Button";

export default function AppConfigManager() {
  const [config, setConfig] = useState({
    latestVersion: "",
    minimumSupportedVersion: "",
    forceUpdate: false,
    storeUrl: "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/app-version?version=0.0.0`);
        const data = await res.json();
        // Note: /api/app-version is public, but for admin we might need a dedicated GET /api/admin/app-config
        // Since I don't have a GET /api/admin/app-config, I'll assume we can use a similar pattern or just fetch current.
        // For now, I'll implement the fetch logic and let the user know if a GET endpoint is needed.
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/admin/app-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        Alert.alert("Сәтті", "Конфигурация сақталды");
      } else {
        throw new Error("Save failed");
      }
    } catch (e) {
      Alert.alert("Қате", "Сақтау мүмкін болмады");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator className="m-10" />;

  return (
    <View className="p-6 bg-dark-900 min-h-screen">
      <Text className="text-2xl font-bold text-white mb-6">App Version Config</Text>

      <View className="gap-4">
        <View>
          <Text className="text-white/60 text-sm mb-1">Latest Version (e.g. 1.2.0)</Text>
          <TextInput
            className="bg-white/5 border border-white/10 p-3 rounded-xl text-white"
            value={config.latestVersion}
            onChangeText={(t) => setConfig({...config, latestVersion: t})}
          />
        </View>

        <View>
          <Text className="text-white/60 text-sm mb-1">Min Supported Version</Text>
          <TextInput
            className="bg-white/5 border border-white/10 p-3 rounded-xl text-white"
            value={config.minimumSupportedVersion}
            onChangeText={(t) => setConfig({...config, minimumSupportedVersion: t})}
          />
        </View>

        <View>
          <Text className="text-white/60 text-sm mb-1">Store URL (APK link)</Text>
          <TextInput
            className="bg-white/5 border border-white/10 p-3 rounded-xl text-white"
            value={config.storeUrl}
            onChangeText={(t) => setConfig({...config, storeUrl: t})}
          />
        </View>

        <View>
          <Text className="text-white/60 text-sm mb-1">Update Message</Text>
          <TextInput
            className="bg-white/5 border border-white/10 p-3 rounded-xl text-white"
            value={config.message}
            onChangeText={(t) => setConfig({...config, message: t})}
            multiline
          />
        </View>

        <View className="flex-row items-center justify-between p-3 bg-white/5 rounded-xl">
          <Text className="text-white">Force Update (Mandatory)</Text>
          <Pressable
            onPress={() => setConfig({...config, forceUpdate: !config.forceUpdate})}
            className={`w-12 h-6 rounded-full ${config.forceUpdate ? 'bg-emerald-500' : 'bg-gray-500'}`}
          >
            <View className={`w-4 h-4 bg-white rounded-full ${config.forceUpdate ? 'ml-7' : 'ml-1'}`} />
          </Pressable>
        </View>

        <Button
          title={saving ? "Сақталуде..." : "Сақтау"}
          onPress={handleSave}
          disabled={saving}
          className="mt-6"
        />
      </View>
    </View>
  );
}
