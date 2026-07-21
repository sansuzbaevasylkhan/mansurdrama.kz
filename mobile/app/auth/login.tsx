import { View, Text, KeyboardAvoidingView, Platform, Pressable, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Mail, User, Loader2 } from "lucide-react-native";
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
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    try {
      await login(email.trim(), name.trim() || undefined);
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
            <View
              className="h-14 w-14 rounded-2xl items-center justify-center mb-3"
              style={{ backgroundColor: "#ec4899" }}
            >
              <User size={22} color="#fff" />
            </View>
            <Text className="text-2xl font-bold text-white">Кіру</Text>
            <Text className="mt-1 text-sm text-white/60 text-center">
              Email-іңізді енгізіңіз — автоматты тіркелу
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-xs text-white/60 mb-2">Аты-жөніңіз (міндетті емес)</Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Иван Иванов"
                autoFocus={false}
              />
            </View>
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

          <Text className="mt-6 text-center text-[11px] text-white/40">
            Тіркелгіңіз автоматты жасалады. Құпиясөз қажет емес.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
