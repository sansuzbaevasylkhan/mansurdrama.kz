import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react-native";
import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/utils";

interface Props {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  onLocked?: boolean;
}

export function VideoPlayer({ videoUrl, posterUrl, title, onLocked }: Props) {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.muted = true;
  });

  const [showControls, setShowControls] = useState(true);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  const togglePlay = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const toggleControls = () => {
    setShowControls((s) => !s);
  };

  const isPlaying = player.playing;
  const isLoading = player.status === 'loading';

  return (
    <Pressable
      onPress={toggleControls}
      className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-white/10 bg-black"
    >
      <VideoView
        player={player}
        contentFit="cover"
        poster={posterUrl ? { uri: posterUrl } : undefined}
        style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
        nativeControls={false}
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
                width: `${(player.currentTime / (player.duration || 1)) * 100}%`,
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
              {formatDuration(player.currentTime)} /{" "}
              {formatDuration(player.duration)}
            </Text>
            <View className="flex-1" />
            <Pressable
              onPress={() => {
                // expo-video handle fullscreen automatically or via player
                player.presentFullscreenPlayer();
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
