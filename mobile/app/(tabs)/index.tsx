import { View, Text, Image, Pressable, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Play, Sparkles, Film, Tv } from "lucide-react-native";
import { LinearGradient } from "expo-image";
import { dramasApi } from "@/lib/endpoints";
import type { Drama } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/Skeleton";
import { formatNumber } from "@/lib/utils";

export default function CatalogScreen() {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await dramasApi.list();
      setDramas(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Қате");
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-dark-950" edges={["top"]}>
      <FlatList
        data={dramas}
        keyExtractor={(d) => d.id}
        numColumns={2}
        columnWrapperClassName="gap-3 px-4"
        contentContainerClassName="pb-24"
        ListHeaderComponent={
          <View className="mb-4">
            <Hero count={dramas.length} />
            <View className="px-4 mt-4 mb-3 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-white">Каталог</Text>
              <Text className="text-sm text-white/50">
                {loading ? "Жүктелуде…" : `${dramas.length} дорама`}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <DramaCard drama={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load(true);
            }}
            tintColor="#ec4899"
          />
        }
        ListEmptyComponent={
          loading ? (
            <View className="px-4">
              <View className="flex-row gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <View key={i} className="flex-1">
                    <Skeleton className="aspect-[2/3] w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </View>
                ))}
              </View>
            </View>
          ) : error ? (
            <EmptyState
              icon={<Film color="#fff" size={40} />}
              title="Қате"
              description={error}
              action={
                <Pressable
                  onPress={() => load()}
                  className="h-10 px-4 rounded-xl bg-white/10 items-center justify-center"
                >
                  <Text className="text-white">Қайта көру</Text>
                </Pressable>
              }
            />
          ) : (
            <EmptyState
              icon={<Film color="#fff" size={48} />}
              title="Әлі дорама жоқ"
              description="Админ панелі арқылы қосыңыз"
            />
          )
        }
      />
    </SafeAreaView>
  );
}

function Hero({ count }: { count: number }) {
  return (
    <View className="overflow-hidden">
      <LinearGradient
        colors={["rgba(236,72,153,0.10)", "transparent", "rgba(139,92,246,0.10)"]}
        style={{ position: "absolute", inset: 0 }}
      />
      <View className="px-6 pt-12 pb-8 items-center">
        <View className="flex-row items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1">
          <Sparkles size={12} color="#ec4899" />
          <Text className="text-xs text-white/80">Жаңа маусым · {count}+ дорама</Text>
        </View>
        <Text className="mt-5 text-4xl font-extrabold text-center text-white">
          Қысқа драмалар
        </Text>
        <Text className="mt-2 text-base text-center text-primary-400 font-bold">
          әлеміне қош келдіңіз
        </Text>
        <Text className="mt-3 text-sm text-center text-white/60 px-2">
          HD сапада, кез-келген құрылғыда. Тегін көру.
        </Text>
        <Link
          href="/search"
          className="mt-6 h-12 px-6 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 flex-row items-center gap-2"
          style={{ backgroundColor: "#ec4899" }}
        >
          <Play size={16} color="#fff" fill="#fff" />
          <Text className="text-white font-semibold">Көруді бастау</Text>
        </Link>
      </View>
    </View>
  );
}

function DramaCard({ drama }: { drama: Drama }) {
  return (
    <Link href={`/drama/${drama.slug}`} asChild>
      <Pressable className="flex-1 mb-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <View className="aspect-[2/3] w-full bg-dark-800 relative">
          {drama.posterUrl ? (
            <Image
              source={{ uri: drama.posterUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Film color="rgba(255,255,255,0.3)" size={40} />
            </View>
          )}
          <View
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          />
          {drama.views > 0 ? (
            <View className="absolute right-2 top-2 flex-row items-center gap-1 rounded-full bg-black/60 px-2 py-0.5">
              <Play size={10} color="#fff" fill="#fff" />
              <Text className="text-[11px] font-medium text-white">
                {formatNumber(drama.views)}
              </Text>
            </View>
          ) : null}
          <View className="absolute inset-x-0 bottom-0 p-3">
            <Text
              className="text-sm font-semibold text-white"
              numberOfLines={2}
            >
              {drama.title}
            </Text>
            <View className="mt-1 flex-row items-center gap-1.5">
              <Tv size={11} color="rgba(255,255,255,0.7)" />
              <Text className="text-xs text-white/70">
                {drama.totalEpisodes} бөлім
              </Text>
              {drama.rating > 0 ? (
                <Text className="text-xs text-amber-400">★ {drama.rating.toFixed(1)}</Text>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
