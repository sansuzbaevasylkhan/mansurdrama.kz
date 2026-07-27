import { View, Text, Image, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/lib/user-store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

/**
 * Пайдаланушы email-мен кіру (мобиль).
 * Сервер-де /api/auth/user-login автоматты тіркеледі.
 */
export default function UserLoginScreen() {
  const router = useRouter();
  const login = useUser((s) => s.login);
  const loading = useUser((s) => s.loading);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    try {
      await login(email.trim());
      router.back();
    } catch (e: any) {
      setError(e?.message ?? "Кіру мүмкін болмады");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 items-center justify-center px-6"
      >
        <View
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-30"
          style={{ backgroundColor: "rgba(236,72,153,0.30)" }}
        />
        <View
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-30"
          style={{ backgroundColor: "rgba(139,92,246,0.30)" }}
        />

        <View
          className="w-full max-w-md rounded-3xl border border-white/10 p-7"
          style={{ backgroundColor: "rgba(19,19,22,0.7)" }}
        >
          <View className="items-center mb-6">
            <Image
              source={require("@/assets/md.png")}
              style={{ width: 72, height: 72, borderRadius: 18 }}
              resizeMode="contain"
            />
            <Text className="mt-3 text-xl font-extrabold text-white">Mansur Drama</Text>
            <Text className="mt-2 text-2xl font-bold text-white text-center">
              Қош келіпсіздер!
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-xs text-white/60 mb-2">Email</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
              {error ? <Text className="mt-2 text-sm text-red-400">{error}</Text> : null}
            </View>

            <Button
              title="Кіру"
              onPress={onSubmit}
              loading={loading}
              disabled={!email}
              className="w-full mt-2"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
