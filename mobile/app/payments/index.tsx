import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@/components/ui/Button";

type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Payment {
  id: string;
  status: PaymentStatus;
  rejectReason: string | null;
  createdAt: string;
  tariffName: string;
  dramaTitle: string;
  amount: number;
  refundStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  refundComment?: string | null;
}

export default function PaymentsScreen() {
  const { user, isAuthenticated } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/payments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Replace with proper auth storage if needed
        }
      });
      const data = await res.json();
      if (data.payments) {
        setPayments(data.payments);
      }
    } catch (e) {
      console.error("Payments fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function requestRefund(paymentId: string) {
    Alert.prompt(
      "Төлемді қайтару",
      "Қайтару себебін жазыңыз",
      async (reason) => {
        if (!reason) return;

        try {
          const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/refunds`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ paymentId, reason })
          });

          if (res.ok) {
            Alert.alert("Сәтті", "Қайтару өтініші жіберілді. Әкімші қарап, жауап береді.");
            fetchPayments();
          } else {
            const err = await res.json();
            Alert.alert("Қате", err.error || "Өтініш жіберілмеді");
          }
        } catch (e) {
          Alert.alert("Қате", "Сервермен байланыс үзілді");
        }
      }
    );
  }

  async function handleReupload(paymentId: string) {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets[0]) return;

      setUploadingId(paymentId);
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('receipt', {
        uri: file.uri,
        name: `receipt_${paymentId}.jpg`,
        type: 'image/jpeg',
      } as any);

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/payments/${paymentId}/receipt`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (res.ok) {
        Alert.alert("Сәтті", "Чек сәтті жаңартылды!");
        fetchPayments();
      } else {
        const err = await res.json();
        Alert.alert("Қате", err.error || "Жаңарту мүмкін болмады");
      }
    } catch (e) {
      Alert.alert("Қате", "Файлды таңдау кезінде қате кетті");
    } finally {
      setUploadingId(null);
    }
  }

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Тексерілуде', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' };
      case 'APPROVED':
        return { text: 'Расталды', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' };
      case 'REJECTED':
        return { text: 'Қабылданбады', color: 'bg-red-500/20 text-red-500 border-red-500/30' };
    }
  };

  if (!isAuthenticated) return null;

  return (
    <SafeAreaView className="flex-1 bg-dark-950" edges={["top"]}>
      <ScrollView contentContainerClassName="px-4 pt-6 pb-10">
        <Text className="text-2xl font-bold text-white mb-6">Менің төлемдерім</Text>

        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#ec4899" />
            <Text className="text-white/50 mt-4">Жүктелуде...</Text>
          </View>
        ) : payments.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <FileText size={48} color="rgba(255,255,255,0.1)" />
            <Text className="text-white/40 mt-4 text-center">Төлемдер табылмады</Text>
          </View>
        ) : (
          <View className="gap-4">
            {payments.map((p) => {
              const badge = getStatusBadge(p.status);
              return (
                <View
                  key={p.id}
                  className="p-4 rounded-2xl border border-white/10 bg-white/5"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-base" numberOfLines={1}>
                        {p.dramaTitle}
                      </Text>
                      <Text className="text-white/50 text-xs mt-1">
                        {p.tariffName} · {p.amount} ₸
                      </Text>
                    </View>
                    <View className={`px-2 py-1 rounded-md border ${badge.color}`}>
                      <Text className="text-[10px] font-bold uppercase">{badge.text}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2 mb-3">
                    <Clock size={12} color="rgba(255,255,255,0.3)" />
                    <Text className="text-white/40 text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString('kk-KZ')}
                    </Text>
                  </View>

                  {p.status === 'REJECTED' && p.rejectReason && (
                    <View className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-3">
                      <View className="flex-row items-center gap-2 mb-1">
                        <AlertCircle size={14} color="#ef4444" />
                        <Text className="text-red-400 text-xs font-bold">Қабылдамау себебі:</Text>
                      </View>
                      <Text className="text-red-300/80 text-xs leading-4">
                        {p.rejectReason}
                      </Text>
                    </View>
                  )}

                  {p.refundStatus && (
                    <View className={`p-3 rounded-xl border mb-3 ${
                      p.refundStatus === 'PENDING' ? 'bg-yellow-500/10 border-yellow-500/20' :
                      p.refundStatus === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20' :
                      'bg-red-500/10 border-red-500/20'
                    }`}>
                      <View className="flex-row items-center gap-2 mb-1">
                        <Clock size={14} color="rgba(255,255,255,0.7)" />
                        <Text className="text-white/80 text-xs font-bold">
                          Қайтару мәртебесі: {
                            p.refundStatus === 'PENDING' ? 'Қаралуда' :
                            p.refundStatus === 'APPROVED' ? 'Мақұлданды' : 'Қабылданбады'
                          }
                        </Text>
                      </View>
                      {p.refundComment && (
                        <Text className="text-white/60 text-xs leading-4">
                          {p.refundComment}
                        </Text>
                      )}
                    </View>
                  )}

                  {p.status === 'REJECTED' && (
                    <Pressable
                      onPress={() => handleReupload(p.id)}
                      className="w-full py-3 rounded-xl bg-white/10 border border-white/20 items-center"
                    >
                      <Text className="text-white text-xs font-semibold">Чекті қайта жүктеу</Text>
                    </Pressable>
                  )}

                  {p.status === 'APPROVED' && !p.refundStatus && (
                    <Pressable
                      onPress={() => requestRefund(p.id)}
                      className="w-full py-3 rounded-xl bg-rose-500/20 border border-rose-500/30 items-center"
                    >
                      <Text className="text-rose-300 text-xs font-semibold">Төлемді қайтаруды сұрау</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
