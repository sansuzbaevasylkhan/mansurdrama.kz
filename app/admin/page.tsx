'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar, type Tab } from '@/components/admin/Sidebar';
import { DashboardHome } from '@/components/admin/DashboardHome';
import { DramaManagement } from '@/components/admin/DramaManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { Payments } from '@/components/admin/Payments';
import { TariffManagement } from '@/components/admin/TariffManagement';
import { ToastProvider } from '@/components/ui/toast';
import { Loader2 } from 'lucide-react';

// Remove duplicate Tab declaration
export default function AdminDashboardPage() {
  return (
    <ToastProvider>
      <DashboardInner />
    </ToastProvider>
  );
}

function DashboardInner() {
  const [tab, setTab] = React.useState<Tab>('dashboard');
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error('Stats load error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-black text-white">
      <Sidebar
        tab={tab}
        onTabChange={setTab}
        user={{ name: 'Admin', email: 'admin@mansurdrama.kz' }}
      />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === 'dashboard' ? (
              loading ? (
                <div className="flex items-center justify-center h-full py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : (
                <DashboardHome
                  onOpenDramas={() => setTab('dramas')}
                  onOpenUsers={() => setTab('users')}
                  dramaCount={stats?.totalDramas || 0}
                  userCount={stats?.totalUsers || 0}
                  totalRevenue={stats?.totalRevenue || 0}
                  pendingPayments={stats?.pendingPayments || 0}
                  activeTariffs={stats?.activeTariffs || 0}
                />
              )
            ) : tab === 'dramas' ? (
              <DramaManagement />
            ) : tab === 'payments' ? (
              <div className="h-full">
                <Payments />
              </div>
            ) : tab === 'tariffs' ? (
              <TariffManagement />
            ) : tab === 'users' ? (
              <UserManagement />
            ) : (
              <UserManagement />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
