import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { ArrowLeft, Star, Eye, Film, Play, LayoutGrid, Heart } from "lucide-react-native";
import { dramasApi } from "@/lib/endpoints";
import type { Drama, Episode } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { EpisodePaywall } from "@/components/EpisodePaywall";
import { EpisodeSheet } from "@/components/EpisodeSheet";
import { useUser } from "@/lib/user-store";

export default function DramaPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const user = useUser((s) => s.user);

  const [drama, setDrama] = useState<Drama | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const d = await dramasApi.bySlug(slug);
        if (!d) {
          setDrama(null);
          return;
        }
        setDrama(d);
        const eps = await dramasApi.episodes(d.id);
        setEpisodes(eps);

        if (user) {
          const checks = await Promise.all(
            eps
              .filter((e) => e.episodeNumber > 10)
              .map((e) =>
                dramasApi
                  .checkAccess({
                    email: user.email,
                    dramaId: d.id,
                    episodeNumber: e.episodeNumber,
                  })
                  .then((r) => ({ n: e.episodeNumber, ok: r.allowed }))
                  .catch(() => ({ n: e.episodeNumber, ok: false })),
              ),
          );
          setUnlocked((s) => {
            const next = new Set(s);
            checks.forEach((c) => c.ok && next.add(c.n));
            return next;
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, user]);

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert("Кіру қажет", "Таңдаулылар тізіміне қосу үшін аккаунтқа кіріңіз.");
      return;
    }

    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const url = method === 'DELETE'
        ? `${process.env.EXPO_PUBLIC_API_URL}/api/favorites?dramaId=${drama?.id}`
        : `${process.env.EXPO_PUBLIC_API_URL}/api/favorites`;

      const body = method === 'POST' ? JSON.stringify({ userId: user.id, dramaId: drama?.id }) : undefined;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body
      });

      if (res.ok) {
        setIsFavorite(!isFavorite);
      } else {
        throw new Error();
      }
    } catch (e) {
      Alert.alert("Қате", "Әрекет орындалмады");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-950 items-center justify-center" edges={["top"]}>
        <ActivityIndicator color="#ec4899" />
      </SafeAreaView>
    );
  }

  if (!drama) {
    return (
      <SafeAreaView className="flex-1 bg-dark-950 items-center justify-center" edges={["top"]}>
        <Text className="text-white">Дорама табылмады</Text>
      </SafeAreaView>
    );
  }

  const handleSelectEpisode = (num: number) => {
    const ep = episodes.find((e) => e.episodeNumber === num);
    if (!ep) return;

    setIsSheetVisible(false);

    const isLocked = ep.episodeNumber > 10 && !unlocked.has(ep.episodeNumber);
    if (isLocked) {
      Alert.alert("Қолжетімсіз", "Бұл бөлімді көру үшін төлем жасау қажет. Төменгі тізімнен төлемді жіберіңіз.");
      return;
    }

    router.push({
      pathname: "/watch/[episodeId]",
      params: {
        episodeId: ep.id,
        dramaId: drama.id,
        videoUrl: ep.videoUrl,
        posterUrl: drama.posterUrl,
        title: drama.title,
        subtitle: ep.title,
      },
    });
  };

  return (
    <View className="flex-1 bg-dark-950">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerClassName="pb-24">
        <SafeAreaView edges={["top"]}>
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 ml-3 mt-2 items-center justify-center rounded-full bg-black/30"
          >
            <ArrowLeft size={20} color="#fff" />
          </Pressable>
        </SafeAreaView>

        <View className="flex-row gap-4 px-4 mt-2">
          <View className="w-36 h-52 overflow-hidden rounded-2xl border border-white/10 bg-dark-800">
            {drama.posterUrl ? (
              <Image
                source={{ uri: drama.posterUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Film color="rgba(255,255,255,0.3)" size={32} />
              </View>
            )}
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-start">
              <Text className="text-2xl font-extrabold text-white flex-1" numberOfLines={2}>
                {drama.title}
              </Text>
              <Pressable
                onPress={toggleFavorite}
                className="ml-2 p-2 rounded-full bg-white/5"
              >
                <Heart
                  size={24}
                  color={isFavorite ? "#ef4444" : "#fff"}
                  fill={isFavorite ? "#ef4444" : "transparent"}
                />
              </Pressable>
            </View>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <Badge icon={<Film size={12} color="#fff" />}>
                {drama.totalEpisodes} бөлім
              </Badge>
              {drama.rating > 0 ? (
                <Badge icon={<Star size={12} color="#facc15" fill="#facc15" />}>
                {drama.rating.toFixed(1)}
              </Badge>
              ) : null}
              {drama.views > 0 ? (
                <Badge icon={<Eye size={12} color="#fff" />}>
                {formatNumber(drama.views)}
              </Badge>
              ) : null}
            </View>
            {drama.description ? (
              <Text className="mt-3 text-sm text-white/70">{drama.description}</Text>
            ) : null}
          </View>
        </View>

        <View className="mt-6 px-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-white">Бөлімдер</Text>
            <Pressable
              onPress={() => setIsSheetVisible(true)}
              className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-white/10"
            >
              <LayoutGrid size={14} color="#fff" />
              <Text className="text-xs font-semibold text-white">Тізім</Text>
            </Pressable>
          </View>
          {episodes.length === 0 ? (
            <Text className="text-white/60 text-sm">Әлі бөлімдер қосылмаған.</Text>
          ) : (
            <View className="gap-3">
              {episodes.map((ep) => {
                const isLocked = ep.episodeNumber > 10 && !unlocked.has(ep.episodeNumber);
                if (isLocked) {
                  return (
                    <EpisodePaywall
                      key={ep.id}
                      dramaId={drama.id}
                      episodeNumber={ep.episodeNumber}
                      lockedTitle={ep.title}
                      userEmail={user?.email}
                      userName={user?.name}
                      onUnlocked={() => {
                        setUnlocked((s) => new Set(s).add(ep.episodeNumber));
                      }}
                    />
                  );
                }
                return (
                  <Pressable
                    key={ep.id}
                    onPress={() =>
                      router.push({
                        pathname: "/watch/[episodeId]",
                        params: {
                          episodeId: ep.id,
                          dramaId: drama.id,
                          videoUrl: ep.videoUrl,
                          posterUrl: drama.posterUrl,
                          title: drama.title,
                          subtitle: ep.title,
                        },
                      })
                    }
                    className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3"
                  >
                    <View
                      className="h-9 w-9 rounded-lg items-center justify-center"
                      style={{ backgroundColor: "rgba(236,72,153,0.25)" }}
                    >
                      <Text className="text-sm font-bold text-white">{ep.episodeNumber}</Text>
                    </View>
                    <Text className="text-sm font-semibold text-white flex-1" numberOfLines={1}>
                      {ep.title}
                    </Text>
                    <View
                      className="h-9 w-9 rounded-full items-center justify-center"
                      style={{ backgroundColor: "#ec4899" }}
                    >
                      <Play size={14} color="#fff" fill="#fff" />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <EpisodeSheet
        isVisible={isSheetVisible}
        title={drama.title}
        poster={drama.posterUrl}
        totalEpisodes={drama.totalEpisodes}
        onClose={() => setIsSheetVisible(false)}
        onSelect={handleSelectEpisode}
      />
    </View>
  );
}

function Badge({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5">
      {icon}
      <Text className="text-xs text-white/70">{children}</Text>
    </View>
  );
}
