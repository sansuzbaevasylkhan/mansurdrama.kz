'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '@/components/admin/Sidebar';
import { DashboardHome } from '@/components/admin/DashboardHome';
import { DramaManagement } from '@/components/admin/DramaManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { Payments } from '@/components/admin/Payments';
import { ToastProvider } from '@/components/ui/toast';

type Tab = 'dashboard' | 'dramas' | 'users' | 'payments';

export default function AdminDashboardPage() {
  return (
    <ToastProvider>
      <DashboardInner />
    </ToastProvider>
  );
}

function DashboardInner() {
  const [tab, setTab] = React.useState<Tab>('dashboard');
  const [dramaCount, setDramaCount] = React.useState(0);
  const [userCount, setUserCount] = React.useState(0);

  // Fetch counts for the dashboard home. We re-poll lightly so the cards
  // stay roughly in sync as the user switches between tabs.
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [dramas, users] = await Promise.all([
          fetch('/api/dramas?admin=1', { cache: 'no-store' }).then((r) =>
            r.ok ? r.json() : [],
          ),
          fetch('/api/users', { cache: 'no-store' }).then((r) =>
            r.ok ? r.json() : [],
          ),
        ]);
        if (cancelled) return;
        setDramaCount(Array.isArray(dramas) ? dramas.length : 0);
        setUserCount(Array.isArray(users) ? users.length : 0);
      } catch {
        // silent
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [tab]);

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
              <DashboardHome
                onOpenDramas={() => setTab('dramas')}
                onOpenUsers={() => setTab('users')}
                dramaCount={dramaCount}
                userCount={userCount}
              />
            ) : tab === 'dramas' ? (
              <DramaManagement />
            ) : tab === 'payments' ? (
              <div className="h-full">
                <Payments />
              </div>
            ) : (
              <UserManagement />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
