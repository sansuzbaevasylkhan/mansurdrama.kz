import { useEffect, useState } from "react";
import { View, Text, Pressable, Alert, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LogOut, Mail, User as UserIcon, Tv, Clock, Heart, Play } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthContext";
import { watchHistoryApi } from "@/lib/endpoints";
import type { ContinueWatchingItem } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setContinueWatching([]);
      return;
    }
    watchHistoryApi
      .continueWatching()
      .then((res) => setContinueWatching(res.items))
      .catch(() => {});
  }, [isAuthenticated]);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A0A0F]" edges={["top"]}>
        {/* Gradient Header */}
        <LinearGradient
          colors={["#EC4899", "#8B5CF6"]}
          className="px-6 pt-10 pb-16 rounded-b-[40px] flex-row items-center gap-3"
        >
          <Image
            source={require("@/assets/md.png")}
            className="w-10 h-10 rounded-full bg-white/20"
            resizeMode="contain"
          />
          <Text className="text-xl font-bold text-white">Mansur Drama</Text>
        </LinearGradient>

        <View className="flex-1 items-center justify-center px-6">
          <View
            className="h-20 w-20 rounded-3xl items-center justify-center mb-6"
            style={{ backgroundColor: "rgba(236,72,153,0.15)" }}
          >
            <UserIcon size={40} color="#EC4899" />
          </View>
          <Text className="text-2xl font-bold text-white text-center">Кіру қажет</Text>
          <Text className="mt-2 text-sm text-white/60 text-center mb-8">
            11+ сериалды ашу үшін аккаунт жасаңыз
          </Text>

          <LinearGradient
            colors={["#EC4899", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-2xl overflow-hidden w-full max-w-xs"
          >
            <Button
              title="Email-мен кіру"
              onPress={() => router.push("/auth/login")}
              className="w-full py-4 bg-transparent"
            />
          </LinearGradient>
        </View>

        {/* Bottom Tab Line Indicator */}
        <View className="absolute bottom-0 left-0 right-0 h-1 bg-[#EC4899] opacity-50" />
      </SafeAreaView>
    );
  }

  const onLogout = () => {
    Alert.alert("Шығу", "Аккаунттан шығасыз ба?", [
      { text: "Болдырмау", style: "cancel" },
      {
        text: "Шығу",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const onDeleteAccount = () => {
    Alert.alert(
      "Аккаунтты жою",
      "Шынымен аккаунтыңызды өшіргіңіз келе ме? Барлық деректеріңіз және ашылған серияларыңыз біржолғы жойылады. Бұл әрекетті кері қайтару мүмкін емес.",
      [
        { text: "Болдырмау", style: "cancel" },
        {
          text: "Өшіру",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/delete-account`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert("Сәтті аяяқталды", "Аккаунтыңыз сәтті жойылды.");
                await logout();
              } else {
                const errData = await response.json();
                Alert.alert("Қате", errData.message || "Аккаунтты жою мүмкін болмады.");
              }
            } catch (err) {
              Alert.alert("Қате", "Сервермен байланыс үзілді.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-950" edges={["top"]}>
      <ScrollView contentContainerClassName="px-4 pt-3 pb-24">
        <Text className="text-xl font-bold text-white mb-4">Профиль</Text>

        {/* Header card */}
        <View
          className="rounded-3xl p-5 border border-white/10 flex-row items-center gap-4"
          style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        >
          <View
            className="h-16 w-16 rounded-2xl items-center justify-center"
            style={{ backgroundColor: "#ec4899" }}
          >
            <Text className="text-2xl font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-lg font-bold text-white" numberOfLines={1}>
              {user?.name}
            </Text>
            <View className="flex-row items-center gap-1 mt-1">
              <Mail size={12} color="rgba(255,255,255,0.5)" />
              <Text className="text-xs text-white/50" numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats placeholder */}
        <View className="mt-4 flex-row gap-3">
          <StatBox icon={<Tv size={14} color="#ec4899" />} label="Ашылған" value="—" />
          <StatBox icon={<Heart size={14} color="#f472b6" />} label="Таңдаулы" value="—" />
          <StatBox
            icon={<Clock size={14} color="#a78bfa" />}
            label="Қараған"
            value={continueWatching.length > 0 ? String(continueWatching.length) : "—"}
          />
        </View>

        {/* Жалғастырып көру */}
        {continueWatching.length > 0 ? (
          <View className="mt-5">
            <Text className="text-sm font-semibold text-white mb-2.5">Көрген дорамаларың</Text>
            <View className="gap-2.5">
              {continueWatching.map((item) => {
                const percent =
                  item.durationSeconds > 0
                    ? Math.min(100, (item.positionSeconds / item.durationSeconds) * 100)
                    : 0;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      router.push({
                        pathname: "/watch/[episodeId]",
                        params: {
                          episodeId: item.episode.id,
                          dramaId: item.dramaId,
                          videoUrl: item.episode.playbackId
                            ? `https://stream.mux.com/${item.episode.playbackId}.m3u8`
                            : item.episode.videoUrl,
                          posterUrl: item.drama.posterUrl,
                          title: item.drama.title,
                          subtitle: item.episode.title,
                        },
                      })
                    }
                    className="flex-row items-center gap-3 rounded-2xl border border-white/10 p-2.5"
                    style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  >
                    <View className="h-16 w-12 rounded-xl overflow-hidden bg-white/5">
                      <Image
                        source={{ uri: item.drama.posterUrl }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text className="text-sm font-semibold text-white" numberOfLines={1}>
                        {item.drama.title}
                      </Text>
                      <Text className="mt-0.5 text-xs text-white/50" numberOfLines={1}>
                        {item.episode.episodeNumber}-бөлім · {formatDuration(item.positionSeconds)} /{" "}
                        {formatDuration(item.durationSeconds)}
                      </Text>
                      <View className="mt-1.5 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{ width: `${percent}%`, backgroundColor: "#ec4899" }}
                        />
                      </View>
                    </View>
                    <View
                      className="h-8 w-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: "rgba(236,72,153,0.20)" }}
                    >
                      <Play size={14} color="#ec4899" fill="#ec4899" />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Info */}
        <View className="mt-5 rounded-2xl border border-white/10 p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
          <Text className="text-sm font-semibold text-white mb-1">Қалай жұмыс істейді?</Text>
          <Text className="text-xs text-white/60 leading-5">
            · 1-10 сериялар — тегін, аккаунтсыз{"\n"}
            · 11+ серия үшін Kaspi-мен қолмен төлем{"\n"}
            · Адміністратор чекті растағанда — серия ашылады
          </Text>
        </View>

        {/* Logout */}
        <Pressable
          onPress={onLogout}
          className="mt-5 h-12 rounded-2xl flex-row items-center justify-center gap-2 border"
          style={{ backgroundColor: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.30)" }}
        >
          <LogOut size={16} color="#fda4af" />
          <Text className="text-sm font-semibold text-red-300">Шығу</Text>
        </Pressable>

        {/* Delete Account */}
        <Pressable
          onPress={onDeleteAccount}
          className="mt-3 h-12 rounded-2xl flex-row items-center justify-center gap-2 border border-red-900/30"
          style={{ backgroundColor: "rgba(153, 27, 27, 0.10)" }}
        >
          <Text className="text-sm font-semibold text-red-500">Аккаунтты жою</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View
      className="flex-1 rounded-2xl border border-white/10 p-3"
      style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
      >
      <View className="flex-row items-center gap-1.5">
        {icon}
        <Text className="text-[11px] text-white/50">{label}</Text>
      </View>
      <Text className="mt-1 text-xl font-bold text-white">{value}</Text>
    </View>
  );
}
