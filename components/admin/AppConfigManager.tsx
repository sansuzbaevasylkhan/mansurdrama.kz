import React, { useState, useEffect } from "react";
import { Settings, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AppConfigManager() {
  const [config, setConfig] = useState({
    latestVersion: "",
    minimumSupportedVersion: "",
    forceUpdate: false,
    storeUrl: "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/admin/app-config'); // Adjusted endpoint
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/app-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        toast.success("Конфигурация сақталды");
      } else {
        throw new Error("Save failed");
      }
    } catch (e) {
      toast.error("Сақтау мүмкін болмады");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="p-6 bg-dark-900 rounded-2xl border border-white/5 text-white">
      <h2 className="text-2xl font-bold mb-6">App Version Config</h2>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-white/60 text-sm">Latest Version (e.g. 1.2.0)</label>
          <Input
            className="bg-white/5 border-white/10 text-white"
            value={config.latestVersion}
            onChange={(e) => setConfig({...config, latestVersion: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-white/60 text-sm">Min Supported Version</label>
          <Input
            className="bg-white/5 border-white/10 text-white"
            value={config.minimumSupportedVersion}
            onChange={(e) => setConfig({...config, minimumSupportedVersion: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-white/60 text-sm">Store URL (APK link)</label>
          <Input
            className="bg-white/5 border-white/10 text-white"
            value={config.storeUrl}
            onChange={(e) => setConfig({...config, storeUrl: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-white/60 text-sm">Update Message</label>
          <textarea
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white min-h-[100px]"
            value={config.message}
            onChange={(e) => setConfig({...config, message: e.target.value})}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
          <span className="text-white text-sm">Force Update (Mandatory)</span>
          <button
            onClick={() => setConfig({...config, forceUpdate: !config.forceUpdate})}
            className={`w-12 h-6 rounded-full transition-colors relative ${config.forceUpdate ? 'bg-emerald-500' : 'bg-gray-500'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.forceUpdate ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full py-6 text-lg font-bold bg-primary-600 hover:bg-primary-700 text-white"
        >
          {saving ? "Сақталуде..." : "Сақтау"}
        </Button>
      </div>
    </div>
  );
}
