import React, { useState } from "react";
import { View, Text, Image, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

type AuthMode = "login" | "register";

export default function AuthScreen() {
  const router = useRouter();
  const { login, register, isLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (mode === "register") {
      if (!name.trim()) return "Атыңызды енгізіңіз";
      if (!email.includes("@")) return "Email дұрыс емес";
      if (password.length < 6) return "Құпиясөз кемінде 6 таңба болуы керек";
      if (password !== confirmPassword) return "Құпиясөздер сәйкес емес";
    } else {
      if (!email.includes("@")) return "Email дұрыс емес";
      if (!password) return "Құпиясөз енгізіңіз";
    }
    return null;
  };

  const onSubmit = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (mode === "login") {
        const res = await login(email.trim(), password);
        if (!res.success) setError(res.error);
        else router.back();
      } else {
        const res = await register(name.trim(), email.trim(), password);
        if (!res.success) setError(res.error);
        else router.back();
      }
    } catch (e: any) {
      setError(e?.message ?? "Қате орын алды");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1 px-6"
        >
          <View className="items-center mt-10 mb-8">
            <Image
              source={require("@/assets/md.png")}
              className="w-20 h-20 rounded-2xl"
              resizeMode="contain"
            />
            <Text className="mt-4 text-2xl font-extrabold text-white">Mansur Drama</Text>
          </View>

          <View className="flex-row mb-8 bg-[#17171F] rounded-2xl p-1">
            <TouchableOpacity
              onPress={() => { setMode("login"); setError(null); }}
              className={`flex-1 py-3 rounded-xl ${mode === "login" ? "bg-[#8B5CF6] shadow-lg" : ""}`}
            >
              <Text className={`text-center font-bold ${mode === "login" ? "text-white" : "text-white/50"}`}>
                Кіру
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setMode("register"); setError(null); }}
              className={`flex-1 py-3 rounded-xl ${mode === "register" ? "bg-[#8B5CF6] shadow-lg" : ""}`}
            >
              <Text className={`text-center font-bold ${mode === "register" ? "text-white" : "text-white/50"}`}>
                Тіркелу
              </Text>
            </TouchableOpacity>
          </View>

          <View className="gap-5">
            {mode === "register" && (
              <View>
                <Text className="text-xs text-white/60 mb-2 ml-1">Атыңыз</Text>
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="Мансур..."
                  autoCapitalize="words"
                />
              </View>
            )}

            <View>
              <Text className="text-xs text-white/60 mb-2 ml-1">Email</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="example@mail.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-xs text-white/60 mb-2 ml-1">Құпиясөз</Text>
              <View className="relative">
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder="******"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#8B5CF6"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {mode === "register" && (
              <View>
                <Text className="text-xs text-white/60 mb-2 ml-1">Құпиясөзді қайталау</Text>
                <Input
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="******"
                  secureTextEntry={!showPassword}
                />
              </View>
            )}

            {error && (
              <Text className="text-sm text-red-400 text-center">{error}</Text>
            )}

            <LinearGradient
              colors={["#EC4899", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl overflow-hidden mt-4"
            >
              <Button
                title={mode === "login" ? "Кіру" : "Тіркелу"}
                onPress={onSubmit}
                loading={isLoading}
                disabled={isLoading}
                className="w-full py-4 bg-transparent"
              />
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
