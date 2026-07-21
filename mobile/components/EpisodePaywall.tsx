import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Lock, Upload, CheckCircle2, LogIn } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { paymentsApi } from "@/lib/endpoints";
import { useUser } from "@/lib/user-store";
import { Button } from "@/components/ui/Button";

const KASPI_NUMBER = "+7 776 010 9510";

interface Props {
  dramaId: string;
  episodeNumber: number;
  lockedTitle?: string;
  userEmail?: string;
  userName?: string;
  onUnlocked?: () => void;
}

export function EpisodePaywall({
  dramaId,
  episodeNumber,
  lockedTitle,
  userEmail,
  userName,
  onUnlocked,
}: Props) {
  const router = useRouter();
  const user = useUser((s) => s.user);
  const [email, setEmail] = useState(userEmail ?? "");
  const [fullName, setFullName] = useState(userName ?? "");
  const [phone, setPhone] = useState("");
  const [receipt, setReceipt] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [type, setType] = useState<"SINGLE_EPISODE" | "FULL_PACKAGE">("SINGLE_EPISODE");

  const singlePrice = 1500;
  const fullPrice = 3000;

  const pickReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Рұқсат керек", "Галереяға кіру үшін рұқсат беріңіз.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      const a = res.assets[0];
      setReceipt({
        uri: a.uri,
        name: a.fileName ?? `receipt-${Date.now()}.jpg`,
        type: a.mimeType ?? "image/jpeg",
      });
    }
  };

  const submit = async () => {
    if (!email) return Alert.alert("Қате", "Email енгізіңіз");
    if (!fullName) return Alert.alert("Қате", "Аты-жөніңізді енгізіңіз");
    if (!phone) return Alert.alert("Қате", "Телефон нөмірін енгізіңіз");
    if (!receipt) return Alert.alert("Қате", "Чек файлды таңдаңыз");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("email", email);
      fd.append("fullName", fullName);
      fd.append("phone", phone);
      fd.append("dramaId", dramaId);
      fd.append("type", type);
      if (type === "SINGLE_EPISODE") fd.append("episodeNumber", String(episodeNumber));
      // @ts-expect-error RN FormData accepts blob-like
      fd.append("receipt", {
        uri: receipt.uri,
        name: receipt.name,
        type: receipt.type,
      });
      await paymentsApi.submit(fd);
      setSent(true);
      Alert.alert(
        "Төлем жіберілді",
        "Әкімші тексеріп, ашады. Email-ге жауап келеді.",
        [{ text: "OK", onPress: () => onUnlocked?.() }],
      );
    } catch (e: any) {
      Alert.alert("Қате", e?.message ?? "Төлем жіберілмеді");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 rounded-xl items-center justify-center bg-rose-500/15">
          <Lock size={20} color="#fda4af" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-white">
            Құлыпталған: {lockedTitle ?? `Бөлім ${episodeNumber}`}
          </Text>
          <Text className="mt-1 text-xs text-white/60">
            1-10 серия тегін. 11+ үшін қолмен төлем қажет.
          </Text>

          {!user ? (
            <Pressable
              onPress={() => router.push("/auth/login")}
              className="mt-3 h-10 rounded-xl flex-row items-center justify-center gap-2"
              style={{ backgroundColor: "rgba(236,72,153,0.10)", borderWidth: 1, borderColor: "rgba(236,72,153,0.30)" }}
            >
              <LogIn size={14} color="#f472b6" />
              <Text className="text-xs font-semibold text-pink-300">
                Тезірек төлеу үшін кіріңіз
              </Text>
            </Pressable>
          ) : null}

          <View className="mt-3 flex-row gap-2">
            <PriceCard
              title="1 серия"
              price={singlePrice}
              active={type === "SINGLE_EPISODE"}
              onPress={() => setType("SINGLE_EPISODE")}
            />
            <PriceCard
              title="Толық пакет"
              price={fullPrice}
              active={type === "FULL_PACKAGE"}
              onPress={() => setType("FULL_PACKAGE")}
            />
          </View>

          <View className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <Text className="text-xs text-white/60">Kaspi нөмірі</Text>
            <Text className="mt-1 text-base font-bold text-white">{KASPI_NUMBER}</Text>
            <Text className="mt-1 text-[11px] text-white/50">
              Көрсетілген соманы жіберіп, чек скриншотын жүктеңіз.
            </Text>
          </View>

          <View className="mt-3 gap-3">
            <FormField
              label="Аты-жөніңіз"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Иванов Иван"
            />
            <FormField
              label="Телефон"
              value={phone}
              onChangeText={setPhone}
              placeholder="+7 700 000 0000"
              keyboardType="phone-pad"
            />
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View>
              <Text className="text-xs text-white/60 mb-1.5">Чек скриншоты</Text>
              <Pressable
                onPress={pickReceipt}
                className="flex-row items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
              >
                <Upload size={16} color="rgba(255,255,255,0.7)" />
                <Text className="text-sm text-white/70" numberOfLines={1}>
                  {receipt ? receipt.name : "Файл таңдаңыз"}
                </Text>
              </Pressable>
            </View>
          </View>

          {loading ? (
            <View className="mt-3 flex-row items-center gap-2">
              <ActivityIndicator color="#ec4899" />
              <Text className="text-xs text-white/60">Жіберілуде…</Text>
            </View>
          ) : (
            <Button
              title={sent ? "Жіберілді ✓" : "Төлемді жіберу"}
              onPress={submit}
              disabled={sent}
              className="mt-4 w-full"
            />
          )}
        </View>
      </View>
    </View>
  );
}

function PriceCard({
  title,
  price,
  active,
  onPress,
}: {
  title: string;
  price: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-xl border p-3"
      style={{
        backgroundColor: active ? "rgba(236,72,153,0.10)" : "rgba(255,255,255,0.03)",
        borderColor: active ? "rgba(236,72,153,0.50)" : "rgba(255,255,255,0.10)",
      }}
    >
      <Text className="text-xs text-white/60">{title}</Text>
      <Text className="text-lg font-bold text-white">{price} ₸</Text>
    </Pressable>
  );
}

function FormField({
  label,
  ...rest
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View>
      <Text className="text-xs text-white/60 mb-1.5">{label}</Text>
      <TextInput
        placeholderTextColor="rgba(255,255,255,0.4)"
        className="h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-white"
        {...rest}
      />
    </View>
  );
}
