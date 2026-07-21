"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Film, LogOut, Home, PlusCircle, Users } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Tabs } from "@/components/ui/Tabs";
import { DramasManager } from "@/components/admin/DramasManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/admin/login");
        } else {
          setLoading(false);
        }
      })
      .catch(() => router.push("/admin/login"));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast({ title: "Шықтыңыз", description: "Қайта кездескенше!", variant: "success" });
      router.push("/admin/login");
    } catch {
      toast({ title: "Шығу қатесі", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 border-4 border-white/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-dark-900 to-dark-950 border-r border-white/5 z-40 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">Admin Panel</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Mansur Drama</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm font-medium">🏠 Сайтқа өту</span>
          </a>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-rose-500/10 hover:text-rose-400 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">🚪 Шығу</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-dark-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
            <Film className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold text-white text-sm">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            className="p-2 rounded-lg hover:bg-white/10 text-white"
          >
            <Home className="h-4 w-4" />
          </a>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
              Басқару панелі
            </h1>
            <p className="text-sm text-white/50">Дорамалар мен қолданушыларды басқарыңыз</p>
          </motion.div>

          <StatsOverview />

          <div className="mt-8">
            <Tabs
              tabs={[
                {
                  id: "dramas",
                  label: "Дорамалар",
                  icon: <PlusCircle className="h-4 w-4" />,
                  content: <DramasManager />,
                },
                {
                  id: "users",
                  label: "Қолданушылар",
                  icon: <Users className="h-4 w-4" />,
                  content: <UsersManager />,
                },
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
