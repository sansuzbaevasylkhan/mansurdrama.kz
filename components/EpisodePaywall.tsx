"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileText, CreditCard, AlertCircle } from 'lucide-react';

interface EpisodePaywallProps {
  dramaId: string;
  userId: string;
  currentEpisode: number;
  freeEpisodesCount: number;
  onClose?: () => void;
}

interface Tariff {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export default function EpisodePaywall({ dramaId, userId, currentEpisode, freeEpisodesCount, onClose }: EpisodePaywallProps) {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hasStartedPayment, setHasStartedPayment] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTariffs();
  }, []);

  async function fetchTariffs() {
    try {
      const res = await fetch('/api/tariffs');
      const data = await res.json();
      setTariffs(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Тарифтерді жүктеу кезінде қате кетті');
    }
  }

  async function handleUploadReceipt() {
    if (!receiptFile || !selectedTariff) {
      toast.error('Тарифті таңдап, PDF чекті жүктеңіз');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('dramaId', dramaId);
    formData.append('tariffId', selectedTariff.id);
    formData.append('type', selectedTariff.name.toLowerCase().includes('толық') ? 'FULL_PACKAGE' : 'SINGLE_EPISODE');
    formData.append('episodeNumber', currentEpisode.toString());
    formData.append('receipt', receiptFile);
    formData.append('email', 'user@example.com'); // This should come from auth context

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success('Чек сәтті жіберілді! Админ растаған соң сериялар ашылады');
        setHasStartedPayment(false);
        setSelectedTariff(null);
        setReceiptFile(null);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Қате кетті');
      }
    } catch (error) {
      toast.error('Сервермен байланыс үзілді');
    } finally {
      setUploading(false);
    }
  }

  if (currentEpisode <= freeEpisodesCount) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="bg-white text-black w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-red-600 p-6 text-white text-center">
          <h2 className="text-2xl font-bold">Серияны ашу</h2>
          <p className="text-sm opacity-90 mt-1">Бұл серияны көру үшін тарифті таңдаңыз</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning Message */}
          {!hasStartedPayment && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Сіз әлі төлемей жатыр екенсіз. Келесі серияны қарау үшін төлем жасаңыз.</p>
            </div>
          )}

          {/* Tariff Selection */}
          {!hasStartedPayment ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {tariffs.map((tariff: any) => (
                  <div
                    key={tariff.id}
                    onClick={() => {
                      setSelectedTariff(tariff);
                      setHasStartedPayment(true);
                    }}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedTariff?.id === tariff.id ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{tariff.name}</p>
                        <p className="text-sm text-gray-500">{tariff.description}</p>
                      </div>
                      <p className="text-xl font-black text-red-600">{tariff.price} ₸</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {/* Payment Details */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-3">
                <p className="text-sm text-gray-600">Төлем жасау үшін нөмір:</p>
                <p className="text-2xl font-mono font-bold text-black">+7 776 010 9510</p>

                {/* Kaspi Red Button */}
                <a
                  href="https://kaspi.kz/pay?phone=+77760109510" // Example link
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[#E30613] text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-colors shadow-lg"
                >
                  <CreditCard className="w-6 h-6" />
                  Kaspi арқылы төлеу
                </a>
              </div>

              {/* PDF Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="w-4 h-4" />
                  <span>Төлем чегін жүктеңіз (PDF)</span>
                </div>

                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 transition-colors">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      {receiptFile ? `Файл: ${receiptFile.name}` : 'PDF файлын таңдаңыз немесе сүйреп әкеліңіз'}
                    </p>
                    {!receiptFile && <p className="text-xs text-gray-400">Тек PDF форматы қабылданады</p>}
                  </div>
                </div>

                <Button
                  onClick={handleUploadReceipt}
                  disabled={uploading || !receiptFile}
                  className="w-full py-6 text-lg font-bold bg-black text-white hover:bg-gray-800"
                >
                  {uploading ? 'Жіберілуде...' : 'Төлемді растау'}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setHasStartedPayment(false)}
                  className="w-full text-gray-500"
                >
                  Тарифті өзгерту
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
