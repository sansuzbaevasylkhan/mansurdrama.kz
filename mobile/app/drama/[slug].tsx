import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { ArrowLeft, Star, Eye, Film } from "lucide-react-native";
import { dramasApi } from "@/lib/endpoints";
import type { Drama, Episode } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EpisodePaywall } from "@/components/EpisodePaywall";
import { useUser } from "@/lib/user-store";

export default function DramaPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const user = useUser((s) => s.user);

  const [drama, setDrama] = useState<Drama | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));

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

        // Егер user кірген болса, бұрыннан ашылған эпизодтарды тексереміз
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
            <Text className="text-2xl font-extrabold text-white">{drama.title}</Text>
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
          <Text className="text-lg font-bold text-white mb-3">Бөлімдер</Text>
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
                  <View
                    key={ep.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-3"
                  >
                    <View className="flex-row items-center gap-2 mb-2">
                      <View
                        className="h-9 w-9 rounded-lg items-center justify-center"
                        style={{ backgroundColor: "rgba(236,72,153,0.25)" }}
                      >
                        <Text className="text-sm font-bold text-white">{ep.episodeNumber}</Text>
                      </View>
                      <Text className="text-sm font-semibold text-white flex-1" numberOfLines={1}>
                        {ep.title}
                      </Text>
                    </View>
                    <VideoPlayer
                      videoUrl={ep.videoUrl}
                      posterUrl={drama.posterUrl}
                      title={`${drama.title} — ${ep.title}`}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
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
