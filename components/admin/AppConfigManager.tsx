'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppConfigManager() {
  const [config, setConfig] = React.useState({
    latestVersion: '',
    minimumSupportedVersion: '',
    forceUpdate: false,
    storeUrl: '',
    message: '',
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const fetchConfig = React.useCallback(async () => {
    try {
      const res = await fetch('/api/app-version');
      if (!res.ok) throw new Error('Жүктеу мүмкін болмады');
      const data = await res.json();
      setConfig(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/app-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Сақтау мүмкін болмады');
      alert('Сәтті сақталды!');
    } catch (e) {
      alert('Қате кетті');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60">Соңғы нұсқа (Latest Version)</label>
            <input
              type="text"
              value={config.latestVersion}
              onChange={(e) => setConfig({ ...config, latestVersion: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-primary-500 transition"
              placeholder="Мысалы: 1.2.1"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60">Ең төменгі қолдау нұсқасы (Min Version)</label>
            <input
              type="text"
              value={config.minimumSupportedVersion}
              onChange={(e) => setConfig({ ...config, minimumSupportedVersion: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-primary-500 transition"
              placeholder="Мысалы: 1.1.0"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className={cn("h-5 w-5", config.forceUpdate ? "text-red-500" : "text-white/40")} />
            <div>
              <p className="text-sm font-medium text-white">Міндетті жаңарту (Force Update)</p>
              <p className="text-xs text-white/50">Қосылса, ескі нұсқаларды қолдану мүмкін емес болады</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.forceUpdate}
            onChange={(e) => setConfig({ ...config, forceUpdate: e.target.checked })}
            className="h-5 w-5 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Store сілтемесі</label>
          <input
            type="text"
            value={config.storeUrl}
            onChange={(e) => setConfig({ ...config, storeUrl: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-primary-500 transition"
            placeholder="https://play.google.com/..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Жаңарту хабарламасы</label>
          <textarea
            value={config.message}
            onChange={(e) => setConfig({ ...config, message: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-primary-500 transition h-24 resize-none"
            placeholder="Қолданушыға көрсетілетін хабарлама..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Конфигурацияны сақтау
        </button>
      </div>
    </div>
  );
}
