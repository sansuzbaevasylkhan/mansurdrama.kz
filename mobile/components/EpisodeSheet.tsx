import React from "react";
import { View, Text, Pressable, ScrollView, Modal, Dimensions } from "react-native";
import { X } from "lucide-react-native";
import { Image } from "expo-image";

interface EpisodeSheetProps {
  title: string;
  poster: string;
  totalEpisodes: number;
  currentEpisode?: number;
  onSelect: (episodeNumber: number) => void;
  onClose: () => void;
  isVisible: boolean;
}

export function EpisodeSheet({
  title,
  poster,
  totalEpisodes,
  currentEpisode,
  onSelect,
  onClose,
  isVisible,
}: EpisodeSheetProps) {
  const { width } = Dimensions.get("window");
  const isLargeScreen = width > 480;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
        />

        <View
          className={`bg-dark-950 rounded-t-[24px] border-t border-white/10 ${
            isLargeScreen ? "self-center mb-10 rounded-3xl" : "w-full"
          }`}
          style={{
            maxWidth: isLargeScreen ? 480 : "100%",
            maxHeight: "70%",
          }}
        >
          {/* Drag Handle */}
          <View className="w-12 h-1.5 bg-white/20 rounded-full self-center my-3" />

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pb-4 border-b border-white/5">
            <View className="flex-row items-center gap-3">
              <Image
                source={{ uri: poster }}
                className="w-12 h-16 rounded-md"
                contentFit="cover"
              />
              <View>
                <Text className="text-white text-lg font-semibold" numberOfLines={1}>
                  {title}
                </Text>
                <Text className="text-gray-400 text-sm">
                  Барлығы {totalEpisodes} бөлім
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} className="p-2 bg-white/5 rounded-full">
              <X size={20} color="#fff" />
            </Pressable>
          </View>

          {/* Episodes Grid */}
          <ScrollView
            className="p-5"
            contentContainerClassName="pb-10"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row flex-wrap justify-between gap-y-5">
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((num) => {
                const isActive = num === currentEpisode;
                return (
                  <Pressable
                    key={num}
                    onPress={() => onSelect(num)}
                    className={`w-[14%] aspect-square items-center justify-center rounded-full transition-all ${
                      isActive
                      ? "bg-rose-500 border-2 border-rose-300 shadow-lg shadow-rose-500/50"
                      : "bg-transparent border border-white/10"
                    }`}
                  >
                    <Text
                      className={`text-lg font-bold ${
                        isActive ? "text-white" : "text-white/80"
                      }`}
                    >
                      {num}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
