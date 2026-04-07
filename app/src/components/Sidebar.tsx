import { useAppStore } from '@/store/appStore';
import { getSupabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Target,
  Users,
  Sparkles,
  Send,
  CreditCard,
  Settings,
  Zap,
  Menu,
  X,
  Shield,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: 'dashboard' },
  { label: 'Campaigns', icon: Target, href: 'campaigns' },
  { label: 'Leads', icon: Users, href: 'leads' },
  { label: 'Enrichment', icon: Sparkles, href: 'enrichment' },
  { label: 'Outreach', icon: Send, href: 'outreach' },
  { label: 'Credits', icon: CreditCard, href: 'credits' },
  { label: 'Settings', icon: Settings, href: 'settings' },
  { label: 'Admin (demo)', icon: Shield, href: 'admin' },
];

export function Sidebar() {
  const { user, currentPage, setCurrentPage, sidebarOpen, toggleSidebar, setUser } =
    useAppStore();

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('landing');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              "fixed left-0 top-0 z-40 h-screen w-[280px]",
              "bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/60",
              "flex flex-col"
            )}
          >
            {/* Logo */}
            <div className="p-6 border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Leadii</h1>
                  <p className="text-xs text-slate-400">AI Lead Generation</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.href;
                
                return (
                  <button
                    key={item.href}
                    onClick={() => setCurrentPage(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      "text-slate-400 hover:text-white hover:bg-slate-800/50",
                      isActive && "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive && "text-cyan-400")} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 w-1 h-8 bg-cyan-500 rounded-r-full"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User & Credits */}
            <div className="p-4 border-t border-slate-800/60 space-y-3">
              {/* Credit Balance */}
              <div className="glass-card p-3 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Credit Balance</span>
                  <span className="text-xs text-cyan-400 font-medium">{user?.credits.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: '65%' }}
                  />
                </div>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  {user?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
