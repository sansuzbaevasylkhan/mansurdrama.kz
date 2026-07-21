"use client";

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="rounded-2xl border border-white/10 bg-dark-800/50 p-4">
        <div className="text-white/60 text-sm">Дорамалар</div>
        <div className="text-white text-2xl font-bold mt-2">—</div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-dark-800/50 p-4">
        <div className="text-white/60 text-sm">Эпизодтар</div>
        <div className="text-white text-2xl font-bold mt-2">—</div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-dark-800/50 p-4">
        <div className="text-white/60 text-sm">Пайдаланушылар</div>
        <div className="text-white text-2xl font-bold mt-2">—</div>
      </div>
    </div>
  );
}

