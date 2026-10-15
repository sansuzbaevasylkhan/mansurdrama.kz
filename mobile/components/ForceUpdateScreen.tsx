import React from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { AlertCircle } from "lucide-react-native";

interface ForceUpdateScreenProps {
  message: string;
  storeUrl: string;
}

export function ForceUpdateScreen({ message, storeUrl }: ForceUpdateScreenProps) {
  const handleUpdate = async () => {
    try {
      await Linking.openURL(storeUrl);
    } catch (e) {
      console.error("Failed to open store URL:", e);
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: '#0a0a10',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
      }}
    >
      <View className="items-center justify-center w-full max-w-sm">
        <View className="h-20 w-20 rounded-full bg-rose-500/10 items-center justify-center mb-6">
          <AlertCircle size={40} color="#f43f5e" />
        </View>

        <Text className="text-2xl font-bold text-white text-center mb-4">
          Қосымшаны жаңартыңыз
        </Text>

        <Text className="text-white/60 text-center text-base mb-8 leading-6">
          {message || "Жаңа мүмкіндіктер мен түзетулерді алу үшін қосымшаның соңғы нұсқасын жүктеп алыңыз."}
        </Text>

        <Pressable
          onPress={handleUpdate}
          className="w-full py-4 rounded-2xl bg-rose-500 items-center justify-center"
        >
          <Text className="text-white font-bold text-lg">Жаңарту</Text>
        </Pressable>
      </View>
    </View>
  );
}
