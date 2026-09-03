import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Share } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ResizeMode, Video } from "expo-av";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Share2,
} from "lucide-react-native";
import { formatDuration } from "@/lib/utils";
import { watchHistoryApi } from "@/lib/endpoints";
import { useUser } from "@/lib/user-store";

/**
 * Толық экранды бөлім ойнатқышы (TikTok/Reels стилінде).
 * Дорама бетіндегі бөлім карточкасын басқанда осы бетке өтеді —
 * экранда ТЕК видео плеер, артқы фонда ешбір басқа UI жоқ.
 */
export default function WatchScreen() {
  const params = useLocalSearchParams<{
    episodeId: string;
    dramaId?: string;
    videoUrl: string;
    posterUrl?: string;
    title?: string;
    subtitle?: string;
  }>();
  const router = useRouter();
  const { user } = useUser();

  const ref = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const statusRef = useRef<any>({});
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [resumeMillis, setResumeMillis] = useState<number | null>(null);
  // Video компонентін resume позициясы анықталғанша көрсетпей тұрамыз —
  // әйтпесе 0-ден ойнап кетіп, кейін позиция ауыстыру секіріп кетеді.
  const [resumeReady, setResumeReady] = useState(!user);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedAt = useRef(0);

  // Логин болған қолданушы үшін — бөлімді бұрын қайда тоқтатқанын алу.
  useEffect(() => {
    if (!user || !params.episodeId) {
      setResumeReady(true);
      return;
    }
    watchHistoryApi
      .progress(params.episodeId)
      .then((res) => {
        if (res.progress && !res.progress.completed && res.progress.positionSeconds > 5) {
          setResumeMillis(res.progress.positionSeconds * 1000);
        }
      })
      .catch(() => {})
      .finally(() => setResumeReady(true));
  }, [user, params.episodeId]);

  const saveProgress = (positionSeconds: number, durationSeconds: number) => {
    if (!user || !params.episodeId || !params.dramaId || durationSeconds <= 0) return;
    watchHistoryApi
      .save({
        episodeId: params.episodeId,
        dramaId: params.dramaId,
        positionSeconds: Math.floor(positionSeconds),
        durationSeconds: Math.floor(durationSeconds),
      })
      .catch(() => {});
  };

  useEffect(() => {
    return () => {
      // Экраннан шыққанда соңғы позицияны сақтап қалу (ref — stale closure болмас үшін).
      const s = statusRef.current;
      if (s.positionMillis && s.durationMillis) {
        saveProgress(s.positionMillis / 1000, s.durationMillis / 1000);
      }
      ref.current?.unloadAsync().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const togglePlay = async () => {
    if (!ref.current) return;
    if (status.isPlaying) await ref.current.pauseAsync();
    else await ref.current.playAsync();
  };

  const toggleControls = () => {
    setShowControls((s) => !s);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (!status.isPlaying) return;
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: params.title ? `${params.title} — Mansur Drama` : "Mansur Drama",
      });
    } catch {}
  };

  const isPlaying = !!status.isPlaying;
  const isLoading = !resumeReady || status.isBuffering || !status.isLoaded;
  const progress =
    status.durationMillis && status.positionMillis
      ? (status.positionMillis / status.durationMillis) * 100
      : 0;

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable className="absolute inset-0" onPress={toggleControls}>
        {resumeReady ? (
        <Video
          ref={ref}
          source={{ uri: params.videoUrl }}
          posterSource={params.posterUrl ? { uri: params.posterUrl } : undefined}
          usePoster={!!params.posterUrl}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isMuted={muted}
          positionMillis={resumeMillis ?? undefined}
          useNativeControls={false}
          onPlaybackStatusUpdate={(s: any) => {
            setStatus(s);
            statusRef.current = s;
            // Әр ~10 секунд сайын прогресті сақтау (артық сұраныс жібермеу үшін).
            if (s.isLoaded && s.positionMillis && s.durationMillis) {
              const now = Date.now();
              if (now - lastSavedAt.current > 10000) {
                lastSavedAt.current = now;
                saveProgress(s.positionMillis / 1000, s.durationMillis / 1000);
              }
            }
          }}
          style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
        />
        ) : null}
      </Pressable>

      {isLoading ? (
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
          <ActivityIndicator color="#fff" size="large" />
        </View>
      ) : null}

      {!isPlaying && !isLoading && showControls ? (
        <Pressable
          onPress={togglePlay}
          className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-white/15 items-center justify-center"
        >
          <Play size={36} color="#fff" fill="#fff" />
        </Pressable>
      ) : null}

      {/* Артқа қайту */}
      <SafeAreaView edges={["top"]} pointerEvents="box-none" className="absolute top-0 left-0 right-0">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 ml-3 mt-2 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <ArrowLeft size={20} color="#fff" />
        </Pressable>
      </SafeAreaView>

      {/* Оң жақтағы әрекет батырмалары */}
      <View className="absolute right-3 bottom-28 items-center gap-6">
        <Pressable onPress={onShare} className="items-center">
          <View
            className="h-11 w-11 rounded-full items-center justify-center mb-1"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <Share2 size={20} color="#fff" />
          </View>
          <Text className="text-[11px] text-white/90">Бөлісу</Text>
        </Pressable>
      </View>

      {/* Төменгі ақпарат пен басқару */}
      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-16"
        style={{
          backgroundColor: "transparent",
        }}
      >
        <View
          pointerEvents="none"
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        />
        <View className="pr-16">
          {params.title ? (
            <Text className="text-base font-bold text-white" numberOfLines={2}>
              {params.title}
            </Text>
          ) : null}
          {params.subtitle ? (
            <Text className="mt-1 text-sm text-white/70" numberOfLines={2}>
              {params.subtitle}
            </Text>
          ) : null}
        </View>

        {showControls ? (
          <View className="mt-3">
            <View className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden mb-2">
              <View
                className="h-full rounded-full"
                style={{ width: `${progress}%`, backgroundColor: "#ec4899" }}
              />
            </View>
            <View className="flex-row items-center gap-3">
              <Pressable onPress={togglePlay} className="p-1.5">
                {isPlaying ? (
                  <Pause size={18} color="#fff" />
                ) : (
                  <Play size={18} color="#fff" fill="#fff" />
                )}
              </Pressable>
              <Pressable onPress={() => setMuted((m) => !m)} className="p-1.5">
                {muted ? <VolumeX size={18} color="#fff" /> : <Volume2 size={18} color="#fff" />}
              </Pressable>
              <Text className="text-xs text-white/70">
                {formatDuration((status.positionMillis ?? 0) / 1000)} /{" "}
                {formatDuration((status.durationMillis ?? 0) / 1000)}
              </Text>
              <View className="flex-1" />
              <Pressable
                onPress={async () => {
                  if (!ref.current) return;
                  try {
                    await ref.current.presentFullscreenPlayer();
                  } catch {}
                }}
                className="p-1.5"
              >
                <Maximize size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}
