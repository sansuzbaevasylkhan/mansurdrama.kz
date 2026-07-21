import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Search, X, Film } from "lucide-react-native";
import { Image } from "expo-image";
import { dramasApi } from "@/lib/endpoints";
import type { Drama } from "@/lib/types";
import { EmptyState, Skeleton } from "@/components/ui/Skeleton";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await dramasApi.list(query);
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  return (
    <SafeAreaView className="flex-1 bg-dark-950" edges={["top"]}>
      <View className="px-4 pt-3">
        <View className="flex-row items-center rounded-2xl bg-white/5 border border-white/10 px-3 h-12">
          <Search size={16} color="rgba(255,255,255,0.5)" />
          <TextInput
            className="flex-1 ml-2 text-white"
            placeholder="Дорама іздеу…"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoFocus
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} className="p-1">
              <X size={16} color="rgba(255,255,255,0.5)" />
            </Pressable>
          ) : null}
        </View>
      </View>
      <FlatList
        data={results}
        keyExtractor={(d) => d.id}
        numColumns={2}
        columnWrapperClassName="gap-3 px-4 mt-4"
        contentContainerClassName="pb-24"
        renderItem={({ item }) => (
          <Link href={`/drama/${item.slug}`} asChild>
            <Pressable className="flex-1 mb-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <View className="aspect-[2/3] w-full bg-dark-800">
                {item.posterUrl ? (
                  <Image
                    source={{ uri: item.posterUrl }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Film size={40} color="rgba(255,255,255,0.3)" />
                  </View>
                )}
              </View>
              <View className="p-2">
                <Text className="text-sm font-semibold text-white" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-xs text-white/50">
                  {item.totalEpisodes} бөлім
                </Text>
              </View>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          loading ? (
            <View className="px-4 mt-4 flex-row gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} className="flex-1">
                  <Skeleton className="aspect-[2/3] w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </View>
              ))}
            </View>
          ) : query ? (
            <EmptyState title="Ештеңе табылмады" description="Басқа сөзбен іздеп көріңіз" />
          ) : (
            <EmptyState
              icon={<Search size={48} color="rgba(255,255,255,0.2)" />}
              title="Іздеу үшін сөз енгізіңіз"
              description="Дорама атауы немесе сипаттамасы"
            />
          )
        }
      />
    </SafeAreaView>
  );
}
