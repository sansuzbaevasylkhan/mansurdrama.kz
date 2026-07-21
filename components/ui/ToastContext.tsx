"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error";

type Toast = {
  id: string;
  type: ToastType;
  title?: string;
  message?: string;
};

type ToastContextValue = {
  toast: Toast | null;
  success: (title?: string, message?: string) => void;
  error: (title?: string, message?: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const clear = useCallback(() => setToast(null), []);

  const show = useCallback((type: ToastType, title?: string, message?: string) => {
    setToast({
      id: `${Date.now()}`,
      type,
      title,
      message,
    });
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title?: string, message?: string) => show("success", title, message),
      error: (title?: string, message?: string) => show("error", title, message),
      clear,
    }),
    [clear, show, toast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  const { toast, success, error, clear } = ctx;

  // Provide same API shape the app expects: toast.success/toast.error
  return {
    toast,
    success,
    error,
    clear,
  };
}

// Optional: a small renderer that other code can reuse if needed
export function ToastRenderer({
  className = "",
}: {
  className?: string;
}) {
  const { toast, clear } = useToast();

  if (!toast) return null;

  const colors =
    toast.type === "success"
      ? "bg-emerald-500/15 border-emerald-400/30"
      : "bg-rose-500/15 border-rose-400/30";

  return (
    <div className={`fixed right-4 bottom-4 z-[100] max-w-sm rounded-xl border ${colors} ${className}`}
      onClick={clear}
    >
      <div className="p-4">
        {toast.title ? <div className="font-semibold text-white">{toast.title}</div> : null}
        {toast.message ? <div className="mt-1 text-sm text-white/70">{toast.message}</div> : null}
      </div>
    </div>
  );
}

