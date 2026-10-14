import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Upload, RefreshCcw, ChevronRight } from "lucide-react-native";
import { paymentsApi } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

interface Payment {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  drama: { title: string };
  tariff: { name: string; price: number };
  rejectReason?: string | null;
}

export default function PaymentsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPayments = async () => {
    try {
      const res = await paymentsApi.my();
      setPayments(res.payments || []);
    } catch (e) {
      Alert.alert("Қате", "Төлемдерді жүктеу мүмкін болмады");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPayments();
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A0A0F] items-center justify-center px-6">
        <Text className="text-white/60 text-center mb-4">Төлемдерді көру үшін кіру қажет</Text>
        <Button title="Кіру" onPress={() => router.push("/auth/login")} />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A0A0F] items-center justify-center">
        <ActivityIndicator size="large" color="#ec4899" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-950" edges={["top"]}>
      <ScrollView
        contentContainerClassName="px-4 pt-3 pb-24"
        refreshControl={
          <RefreshCcw
            onRefresh={onRefresh}
            refreshing={refreshing}
            color="#ec4899"
          />
        }
      >
        <Text className="text-xl font-bold text-white mb-4">Төлем тарихы</Text>

        {payments.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-white/40 text-center">Төлемдер табылмады</Text>
          </View>
        ) : (
          <View className="gap-3">
            {payments.map((p) => (
              <PaymentCard
                key={p.id}
                payment={p}
                onResubmit={() => router.push({
                  pathname: "/payments/resubmit",
                  params: { paymentId: p.id }
                })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PaymentCard({ payment, onResubmit }: { payment: Payment; onResubmit: () => void }) {
  const isApproved = payment.status === "APPROVED";
  const isPending = payment.status === "PENDING";
  const isRejected = payment.status === "REJECTED";

  const statusConfig = {
    PENDING: { label: "Тексерілуде", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30" },
    APPROVED: { label: "Расталды", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30" },
    REJECTED: { label: "Қабылданбады", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" },
  };

  const config = statusConfig[payment.status];

  return (
    <View className={`rounded-2xl border p-4 ${config.border} bg-white/[0.02]`}>
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-sm font-bold text-white" numberOfLines={1}>
            {payment.drama.title}
          </Text>
          <Text className="text-xs text-white/50 mt-0.5">
            {payment.tariff.name} • {payment.tariff.price} ₸
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-lg ${config.bg}`}>
          <Text className={`text-[10px] font-bold ${config.color}`}>
            {config.label}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-[11px] text-white/40">
          {new Date(payment.createdAt).toLocaleDateString('kk-KZ')}
        </Text>

        {isRejected && (
          <Pressable
            onPress={onResubmit}
            className="flex-row items-center gap-1"
          >
            <Upload size={12} color="#ec4899" />
            <Text className="text-xs font-semibold text-pink-400">Қайта жіберу</Text>
          </Pressable>
        )}
      </View>

      {isRejected && payment.rejectReason && (
        <View className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <Text className="text-xs text-red-300 leading-4">
            Себебі: {payment.rejectReason}
          </Text>
        </View>
      )}
    </View>
  );
}
