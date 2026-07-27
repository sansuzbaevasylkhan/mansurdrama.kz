import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { ResizeMode, Video } from "expo-av";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/utils";

interface Props {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  onLocked?: boolean;
}

export function VideoPlayer({ videoUrl, posterUrl, title, onLocked }: Props) {
  const ref = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [muted, setMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      ref.current?.unloadAsync().catch(() => {});
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
    if (!status.isPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const onSeek = async (e: any) => {
    if (!ref.current || !status.duration) return;
    const x = e.nativeEvent.locationX;
    const seekStatus = await ref.current.getStatusAsync();
    const width = seekStatus.isLoaded ? seekStatus.positionMillis : 1;
    // Өте қарапайым: percentage-ке байланысты емес, тек x/duration.
    // Нақты өлшем үшін onLayout + measure қажет — Expo-av өз progressBar-ын қолданады.
  };

  const isPlaying = !!status.isPlaying;
  const isLoading = status.isBuffering || (!status.isLoaded && !onLocked);

  return (
    <Pressable
      onPress={toggleControls}
      className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black"
    >
      <Video
        ref={ref}
        source={{ uri: videoUrl }}
        posterSource={posterUrl ? { uri: posterUrl } : undefined}
        usePoster={!!posterUrl}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}
        isMuted={muted}
        useNativeControls={false}
        onPlaybackStatusUpdate={(s) => setStatus(s)}
        style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
      />

      {isLoading ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <ActivityIndicator color="#fff" />
        </View>
      ) : null}

      {!isPlaying && !isLoading ? (
        <Pressable
          onPress={togglePlay}
          className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-white/15 items-center justify-center"
        >
          <Play size={28} color="#fff" fill="#fff" />
        </Pressable>
      ) : null}

      {showControls ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 bottom-0 pt-6 pb-2 px-3"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          {title ? (
            <Text className="text-xs text-white/80 mb-1.5" numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {/* Progress */}
          <View className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden mb-1.5">
            <View
              className="h-full rounded-full"
              style={{
                width: `${status.durationMillis ? (status.positionMillis / status.durationMillis) * 100 : 0}%`,
                backgroundColor: "#ec4899",
              }}
            />
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable onPress={togglePlay} className="p-1.5">
              {isPlaying ? <Pause size={18} color="#fff" /> : <Play size={18} color="#fff" fill="#fff" />}
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
    </Pressable>
  );
}
