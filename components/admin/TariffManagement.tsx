'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Wallet,
  Save,
  Search,
  CheckCircle2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Tariff {
  id: string;
  name: string;
  price: number;
  paymentPhone?: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  dramaIds?: string[];
  dramaCount?: number;
}

interface Drama {
  id: string;
  title: string;
  posterUrl: string;
}

export function TariffManagement() {
  const [tariffs, setTariffs] = React.useState<Tariff[] | null>(null);
  const [allDramas, setAllDramas] = React.useState<Drama[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dramasLoading, setDramasLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTariff, setEditingTariff] = React.useState<Tariff | null>(null);
  const [saveLoading, setSaveLoading] = React.useState(false);

  // Form State
  const [formData, setFormData] = React.useState({
    name: '',
    price: '',
    paymentPhone: '',
    description: '',
    isActive: true,
    selectedDramaIds: [] as string[],
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = React.useState('');

  const fetchTariffs = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tariffs');
      if (!res.ok) throw new Error('Тарифтерді жүктеу мүмкін болмады');
      const data: Tariff[] = await res.json();
      setTariffs(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDramas = React.useCallback(async () => {
    setDramasLoading(true);
    try {
      const res = await fetch('/api/admin/dramas');
      if (!res.ok) throw new Error('Дорамалар тізімін жүктеу мүмкін болмады');
      const data: Drama[] = await res.json();
      setAllDramas(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Қате орын алды');
    } finally {
      setDramasLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTariffs();
    fetchDramas();
  }, [fetchTariffs, fetchDramas]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Тариф атауын енгізіңіз';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Бағаны енгізіңіз';
    if (!formData.paymentPhone.trim()) newErrors.paymentPhone = 'Телефон нөмірін енгізіңіз';
    if (formData.selectedDramaIds.length === 0) newErrors.dramas = 'Кемінде бір дорама таңдаңыз';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = (tariff?: Tariff) => {
    if (tariff) {
      setEditingTariff(tariff);
      setFormData({
        name: tariff.name,
        price: tariff.price.toString(),
        paymentPhone: tariff.paymentPhone || '',
        description: tariff.description || '',
        isActive: tariff.isActive,
        selectedDramaIds: tariff.dramaIds || [],
      });
    } else {
      setEditingTariff(null);
      setFormData({
        name: '',
        price: '',
        paymentPhone: '',
        description: '',
        isActive: true,
        selectedDramaIds: [],
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaveLoading(true);
    try {
      const method = editingTariff ? 'PATCH' : 'POST';
      const url = editingTariff
        ? `/api/admin/tariffs/${editingTariff.id}`
        : '/api/admin/tariffs';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          isActive: formData.isActive,
          dramaIds: formData.selectedDramaIds,
        }),
      });

      if (!res.ok) throw new Error('Сақтау мүмкін болмады');

      toast.success(editingTariff ? 'Тариф жаңартылды' : 'Тариф сәтті қосылды');
      await fetchTariffs();
      setIsModalOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Қате орын алды, қайталап көріңіз');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Шынымен өшіргіңіз келе ме?')) return;
    try {
      const res = await fetch(`/api/admin/tariffs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Өшіру мүмкін болмады');
      toast.success('Тариф өшірілді');
      await fetchTariffs();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Қате орын алды');
    }
  };

  const handleToggleStatus = async (tariff: Tariff) => {
    try {
      const res = await fetch(`/api/admin/tariffs/${tariff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !tariff.isActive }),
      });
      if (!res.ok) throw new Error('Статусты өзгерту мүмкін болмады');
      toast.success(tariff.isActive ? 'Тариф өшірілді' : 'Тариф қосылды');
      await fetchTariffs();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Қате орын алды');
    }
  };

  const toggleDramaSelection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDramaIds: prev.selectedDramaIds.includes(id)
        ? prev.selectedDramaIds.filter(dId => dId !== id)
        : [...prev.selectedDramaIds, id]
    }));
  };

  const selectAllDramas = () => {
    const filtered = allDramas.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const ids = filtered.map(d => d.id);
    setFormData(prev => ({ ...prev, selectedDramaIds: ids }));
  };

  const clearAllDramas = () => {
    setFormData(prev => ({ ...prev, selectedDramaIds: [] }));
  };

  const filteredDramas = allDramas.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Тарифтерді басқару</h1>
            <p className="text-sm text-white/60">Тарифтерді қосу, өңдеу және өшіру</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 transition shadow-lg shadow-primary-500/20"
        >
          <Plus className="h-4 w-4" />
          Жаңа тариф
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/50">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Жүктелуде…
        </div>
      ) : tariffs === null || tariffs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40 border-2 border-dashed border-white/5 rounded-3xl">
          <Wallet className="h-12 w-12 mb-4 opacity-20" />
          <p>Әлі ешбір тариф қосылмаған</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 text-primary-400 hover:text-primary-300 text-sm font-medium"
          >
            Алғашқы тарифті қосыңыз
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-white/40 bg-white/[0.03]">
              <tr>
                <th className="px-6 py-4 font-medium">Тариф атауы</th>
                <th className="px-6 py-4 font-medium">Бағасы</th>
                <th className="px-6 py-4 font-medium">Телефон</th>
                <th className="px-6 py-4 font-medium">Дорамалар саны</th>
                <th className="px-6 py-4 font-medium">Статусы</th>
                <th className="px-6 py-4 font-medium text-right">Әрекеттер</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tariffs.map((tariff) => (
                <tr key={tariff.id} className="group hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{tariff.name}</td>
                  <td className="px-6 py-4 text-white/90">{tariff.price.toLocaleString('ru-RU')} ₸</td>
                  <td className="px-6 py-4 text-white/90">{tariff.paymentPhone || '—'}</td>
                  <td className="px-6 py-4 text-white/60">{tariff.dramaCount || 0} дорама</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(tariff)}
                      className={cn(
                        'px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight transition-colors',
                        tariff.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      )}
                    >
                      {tariff.isActive ? 'Белсенді' : 'Өшірілген'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(tariff)}
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tariff.id)}
                        className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-dark-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold text-white">
                  {editingTariff ? 'Тарифті өңдеу' : 'Жаңа тариф қосу'}
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTariff(null);
                  }}
                  className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto">
                {/* 1. Name */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60">Тариф атауы</label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className={cn(
                      "w-full px-4 py-2 rounded-xl bg-white/5 border transition",
                      errors.name ? "border-red-500/50 text-red-200" : "border-white/10 text-white"
                    )}
                    placeholder="Мысалы: Толық пакет"
                  />
                  {errors.name && <p className="text-[11px] text-red-400">{errors.name}</p>}
                </div>

                {/* 2. Price */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60">Бағасы (₸)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className={cn(
                      "w-full px-4 py-2 rounded-xl bg-white/5 border transition",
                      errors.price ? "border-red-500/50 text-red-200" : "border-white/10 text-white"
                    )}
                    placeholder="0"
                  />
                  {errors.price && <p className="text-[11px] text-red-400">{errors.price}</p>}
                </div>

                {/* 2.1 Payment Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60">Kaspi телефон нөмірі</label>
                  <input
                    value={formData.paymentPhone}
                    onChange={e => setFormData({...formData, paymentPhone: e.target.value})}
                    className={cn(
                      "w-full px-4 py-2 rounded-xl bg-white/5 border transition",
                      errors.paymentPhone ? "border-red-500/50 text-red-200" : "border-white/10 text-white"
                    )}
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                  {errors.paymentPhone && <p className="text-[11px] text-red-400">{errors.paymentPhone}</p>}
                </div>

                {/* 3. Dramas Multi-select */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/60">Дорамалар тізімі</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllDramas}
                        className="text-[11px] text-primary-400 hover:text-primary-300 transition"
                      >
                        Бәрін таңдау
                      </button>
                      <button
                        type="button"
                        onClick={clearAllDramas}
                        className="text-[11px] text-white/40 hover:text-white transition"
                      >
                        Тазалау
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition"
                      placeholder="Дораманы іздеу..."
                    />
                  </div>

                  <div className="grid gap-2 max-h-60 overflow-y-auto p-2 rounded-xl bg-black/20 border border-white/5">
                    {dramasLoading ? (
                      <div className="flex items-center justify-center py-10 text-white/30 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Жүктелуде...
                      </div>
                    ) : filteredDramas.length === 0 ? (
                      <div className="text-center py-10 text-white/30 text-sm">Дорама табылмады</div>
                    ) : (
                      filteredDramas.map(drama => (
                        <label
                          key={drama.id}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                            formData.selectedDramaIds.includes(drama.id)
                              ? "bg-primary-500/10 text-primary-200"
                              : "hover:bg-white/5 text-white/70"
                          )}
                        >
                          <div className="relative h-10 w-14 rounded overflow-hidden shrink-0 bg-white/10">
                            <img
                              src={drama.posterUrl}
                              alt={drama.title}
                              className="h-full w-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56x80?text=No+Image' }}
                            />
                          </div>
                          <span className="text-sm truncate">{drama.title}</span>
                          <div className="ml-auto">
                            <div className={cn(
                              "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                              formData.selectedDramaIds.includes(drama.id)
                                ? "bg-primary-500 border-primary-500"
                                : "border-white/20"
                            )}>
                              {formData.selectedDramaIds.includes(drama.id) && (
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {errors.dramas && <p className="text-[11px] text-red-400">{errors.dramas}</p>}
                </div>

                {/* 4. Description */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60">Сипаттамасы</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition"
                    placeholder="Тариф туралы қосымша мәлімет..."
                  />
                </div>

                {/* 5. isActive Toggle */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">Белсенді тариф</span>
                    <span className="text-xs text-white/40">Жаңа сатып алуларға қолжетімді</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none",
                      formData.isActive ? "bg-primary-500" : "bg-white/20"
                    )}
                  >
                    <motion.div
                      animate={{ x: formData.isActive ? 20 : 2 }}
                      className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTariff(null);
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white transition"
                  >
                    Болдырмау
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 transition disabled:opacity-50"
                  >
                    {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Сақтау
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
