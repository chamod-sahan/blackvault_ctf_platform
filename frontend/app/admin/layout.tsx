'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { BackButton } from '@/app/components/BackButton';
import { usePathname, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  Shield,
  LayoutDashboard,
  Flag,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Terminal,
  ChevronRight,
  Database,
  History,
  Settings,
  AlertTriangle,
  Cpu,
  Map as MapIcon,
  GraduationCap,
  Trophy,
  FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';

const adminNavItems = [
  { href: '/admin', label: 'OVERVIEW', icon: LayoutDashboard },
  { href: '/admin/labs', label: 'MANAGE LABS', icon: Database },
  { href: '/admin/academy', label: 'ACADEMY', icon: GraduationCap },
  { href: '/admin/learning-paths', label: 'LEARNING PATHS', icon: MapIcon },
  { href: '/admin/ctf', label: 'CTF EVENTS', icon: Trophy },
  { href: '/admin/writeups', label: 'UPLOAD WRITEUPS', icon: FileText },
  { href: '/admin/users', label: 'OPERATORS', icon: Users },
  { href: '/admin/submissions', label: 'SUBMISSIONS', icon: History },
  { href: '/admin/settings', label: 'SYSTEM SETTINGS', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      router.push('/auth/login');
    } catch (error) {
      logout();
      router.push('/auth/login');
    }
  };

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 text-purple-500 animate-pulse" />
          <p className="text-purple-500 font-mono tracking-widest animate-pulse">AUTHORIZING_ADMIN_SESSION...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">
      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d0e12] border-r border-purple-500/20 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center px-6 border-b border-purple-500/20 bg-purple-500/5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tighter text-xl leading-none text-purple-500 uppercase">Elite_Ops</span>
              <span className="text-[10px] text-purple-500/60 font-mono tracking-widest uppercase text-xs">Admin_v5</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-2 text-muted-foreground hover:text-purple-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col h-[calc(100vh-80px)]">
          <nav className="space-y-1">
            <div className="px-4 py-2 text-[10px] font-bold text-purple-500/40 tracking-[0.2em] uppercase">Control_Center</div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    isActive 
                      ? 'bg-purple-500/10 text-purple-500 border-r-2 border-purple-500 rounded-r-none' 
                      : 'text-muted-foreground hover:text-purple-400 hover:bg-purple-500/5'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs tracking-wider">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}

            <div className="px-4 py-4 text-[10px] font-bold text-purple-500/40 tracking-[0.2em] uppercase">Environment</div>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
            >
              <Terminal className="w-5 h-5" />
              <span className="text-xs tracking-wider uppercase">Switch_to_User</span>
            </Link>
          </nav>

          <div className="mt-auto pt-4">
            <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm truncate uppercase tracking-tight text-purple-500">{user.username}</span>
                  <span className="text-purple-500/60 text-[10px] font-mono leading-none tracking-tighter uppercase font-bold">Privileged</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500 text-purple-500 hover:text-white rounded-lg transition-all duration-200 border border-purple-500/20 group"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen bg-[#08090d]">
        <header className="bg-[#0d0e12]/80 backdrop-blur-xl border-b border-purple-500/10 h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-muted-foreground hover:text-purple-500 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Shield className="w-6 h-6 text-purple-500" />
          </div>

          <div className="flex items-center gap-2 text-purple-500/60 font-mono text-[10px] tracking-widest bg-purple-500/5 px-4 py-2 rounded-full border border-purple-500/10 uppercase font-bold">
             <AlertTriangle className="w-3 h-3 text-purple-500 animate-pulse" />
             Privileged_Access_Session_Logged
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-muted-foreground hover:text-purple-500 hover:bg-purple-500/5 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50"></span>
            </button>
            
            <div className="h-8 w-px bg-purple-500/10 mx-1"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {user.username[0].toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold leading-none text-purple-500 tracking-tight uppercase">Root</span>
                <span className="text-[10px] text-purple-500/40 font-mono leading-none mt-1 uppercase tracking-tighter">SID: {user.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 lg:px-16 py-10 max-w-[1600px] mx-auto w-full">
          <BackButton />
          {children}
        </main>
        
        <footer className="px-10 py-6 border-t border-purple-500/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-purple-500/30">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-purple-500/50 shadow-lg"></span>
            System_Status: <span className="text-purple-500/60">Fully_Synchronized</span>
          </div>
          <div className="text-[10px] font-mono tracking-widest uppercase">
            © 2024 BLACKVAULT_SECURITY // ADMIN_UI_V5
          </div>
        </footer>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
