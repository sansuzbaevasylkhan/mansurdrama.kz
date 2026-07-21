"use client";

import * as React from "react";

export type TabConfig = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

export function Tabs({
  tabs,
  defaultTabId,
}: {
  tabs: TabConfig[];
  defaultTabId?: string;
}) {
  const initial = defaultTabId ?? tabs[0]?.id;
  const [activeId, setActiveId] = React.useState<string>(initial);

  React.useEffect(() => {
    if (!activeId && tabs[0]?.id) setActiveId(tabs[0].id);
  }, [activeId, tabs]);

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const isActive = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className={
                "px-4 py-2 rounded-xl border transition-all text-sm " +
                (isActive
                  ? "border-primary-500/40 bg-primary-500/10 text-white"
                  : "border-white/10 bg-white/0 text-white/70 hover:text-white hover:bg-white/5")
              }
            >
              <span className="inline-flex items-center gap-2">
                {t.icon ? <span className="text-white/80">{t.icon}</span> : null}
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">{active?.content}</div>
    </div>
  );
}

