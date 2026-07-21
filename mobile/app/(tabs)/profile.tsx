import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LogOut, Mail, User as UserIcon, Tv, Clock, Heart } from "lucide-react-native";
import { useUser } from "@/lib/user-store";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useUser((s) => s.user);
  const logout = useUser((s) => s.logout);
  const hydrated = useUser((s) => s.hydrated);

  if (!hydrated) return null;

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-dark-950 items-center justify-center px-6" edges={["top"]}>
        <View
          className="h-16 w-16 rounded-2xl items-center justify-center mb-4"
          style={{ backgroundColor: "rgba(236,72,153,0.20)" }}
        >
          <UserIcon size={28} color="#f472b6" />
        </View>
        <Text className="text-xl font-bold text-white">Кіру қажет</Text>
        <Text className="mt-1 text-sm text-white/60 text-center">
          11+ серияларды ашу үшін аккаунт жасаңыз
        </Text>
        <Pressable
          onPress={() => router.push("/auth/login")}
          className="mt-5 h-12 px-6 rounded-2xl items-center justify-center"
          style={{ backgroundColor: "#ec4899" }}
        >
          <Text className="text-white font-semibold">Email-мен кіру</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const onLogout = () => {
    Alert.alert("Шығу", "Аккаунттан шығасыз ба?", [
      { text: "Болдырмау", style: "cancel" },
      {
        text: "Шығу",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-950" edges={["top"]}>
      <ScrollView contentContainerClassName="px-4 pt-3 pb-24">
        <Text className="text-xl font-bold text-white mb-4">Профиль</Text>

        {/* Header card */}
        <View
          className="rounded-3xl p-5 border border-white/10 flex-row items-center gap-4"
          style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        >
          <View
            className="h-16 w-16 rounded-2xl items-center justify-center"
            style={{ backgroundColor: "#ec4899" }}
          >
            <Text className="text-2xl font-bold text-white">
              {user.name?.charAt(0)?.toUpperCase() ?? "U"}
            </Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-lg font-bold text-white" numberOfLines={1}>
              {user.name}
            </Text>
            <View className="flex-row items-center gap-1 mt-1">
              <Mail size={12} color="rgba(255,255,255,0.5)" />
              <Text className="text-xs text-white/50" numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats placeholder */}
        <View className="mt-4 flex-row gap-3">
          <StatBox icon={<Tv size={14} color="#ec4899" />} label="Ашылған" value="—" />
          <StatBox icon={<Heart size={14} color="#f472b6" />} label="Таңдаулы" value="—" />
          <StatBox icon={<Clock size={14} color="#a78bfa" />} label="Қараған" value="—" />
        </View>

        {/* Info */}
        <View className="mt-5 rounded-2xl border border-white/10 p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
          <Text className="text-sm font-semibold text-white mb-1">Қалай жұмыс істейді?</Text>
          <Text className="text-xs text-white/60 leading-5">
            · 1-10 сериялар — тегін, аккаунтсыз{"\n"}
            · 11+ серия үшін Kaspi-мен қолмен төлем{"\n"}
            · Адміністратор чекті растағанда — серия ашылады
          </Text>
        </View>

        {/* Logout */}
        <Pressable
          onPress={onLogout}
          className="mt-5 h-12 rounded-2xl flex-row items-center justify-center gap-2 border"
          style={{ backgroundColor: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.30)" }}
        >
          <LogOut size={16} color="#fda4af" />
          <Text className="text-sm font-semibold text-red-300">Шығу</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View
      className="flex-1 rounded-2xl border border-white/10 p-3"
      style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
    >
      <View className="flex-row items-center gap-1.5">
        {icon}
        <Text className="text-[11px] text-white/50">{label}</Text>
      </View>
      <Text className="mt-1 text-xl font-bold text-white">{value}</Text>
    </View>
  );
}
