"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input'; // Note: verify path if it differs
import { Card } from '@/components/ui/card'; // Note: verify path if it differs
import { toast } from 'sonner';

export default function TariffsPage() {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTariff, setNewTariff] = useState({ name: '', price: '', description: '' });

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
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTariff(e: React.FormEvent) {
    e.preventDefault();
    if (!newTariff.name || !newTariff.price) {
      toast.error('Атау және баға міндетті');
      return;
    }

    try {
      const res = await fetch('/api/tariffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTariff),
      });

      if (res.ok) {
        toast.success('Тариф сәтті қосылды');
        setNewTariff({ name: '', price: '', description: '' });
        fetchTariffs();
      } else {
        toast.error('Қосу кезінде қате кетті');
      }
    } catch (error) {
      toast.error('Сервермен байланыс үзілді');
    }
  }

  if (loading) return <div className="p-6">Жүктелуде...</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Тарифтерді басқару</h1>

      <Card className="p-6 max-w-md space-y-4">
        <h2 className="text-lg font-semibold">Жаңа тариф қосу</h2>
        <form onSubmit={handleAddTariff} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Тариф атауы</label>
            <Input
              value={newTariff.name}
              onChange={(e) => setNewTariff({...newTariff, name: e.target.value})}
              placeholder="Мысалы: Толық пакет"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Бағасы (₸)</label>
            <Input
              type="number"
              value={newTariff.price}
              onChange={(e) => setNewTariff({...newTariff, price: e.target.value})}
              placeholder="1000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Сипаттамасы</label>
            <Input
              value={newTariff.description}
              onChange={(e) => setNewTariff({...newTariff, description: e.target.value})}
              placeholder="Барлық серияларды ашу"
            />
          </div>
          <Button type="submit" className="w-full">Қосу</Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tariffs.map((t: any) => (
          <Card key={t.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-bold">{t.name}</p>
              <p className="text-sm text-gray-500">{t.price} ₸</p>
              <p className="text-xs text-gray-400">{t.description}</p>
            </div>
            <div className="flex gap-2">
              {/* Delete button could be added here */}
            </div>
          </Card>
        ))}
        {tariffs.length === 0 && <p className="text-gray-500">Әзірше тарифтер жоқ</p>}
      </div>
    </div>
  );
}
