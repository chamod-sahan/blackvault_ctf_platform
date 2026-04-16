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
  Trophy,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Terminal,
  User as UserIcon,
  ChevronRight,
  Monitor,
  Cpu,
  Server,
  GraduationCap,
  Map,
  Award,
  FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { href: '/academy', label: 'ACADEMY', icon: GraduationCap },
  { href: '/learning-paths', label: 'LEARNING PATHS', icon: Map },
  { href: '/challenges', label: 'LABS', icon: Flag },
  { href: '/machines', label: 'MACHINES', icon: Server },
  { href: '/ctf', label: 'CTF EVENTS', icon: Trophy },
  { href: '/leaderboard', label: 'LEADERBOARD', icon: Award },
  { href: '/writeups', label: 'WRITEUPS', icon: FileText },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!useAuthStore.getState().isAuthenticated) {
        router.push('/auth/login');
      } else if (user?.role === 'ADMIN') {
        router.push('/admin');
      }
    }
  }, [router, isLoading, user]);

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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Terminal className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-primary font-mono tracking-widest animate-pulse">INITIALIZING_SYSTEM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-htb-card border-r border-htb-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center px-6 border-b border-htb-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tighter text-xl leading-none uppercase">BlackVault</span>
              <span className="text-[10px] text-primary font-mono tracking-widest uppercase">Security</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col h-[calc(100vh-80px)]">
          <nav className="space-y-1">
            <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">Navigation</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs tracking-wider">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}

            {user.role === 'ADMIN' && (
              <>
                <div className="px-4 py-4 text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">Management</div>
                <Link
                  href="/admin"
                  className={pathname.startsWith('/admin') ? 'sidebar-link-active' : 'sidebar-link'}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Shield className="w-5 h-5" />
                  <span className="text-xs tracking-wider">ADMIN PANEL</span>
                </Link>
              </>
            )}
          </nav>

          <div className="mt-auto pt-4">
            <div className="bg-muted/30 rounded-xl p-4 border border-htb-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center text-primary-foreground font-bold shadow-glow-green">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm truncate uppercase tracking-tight">{user.username}</span>
                  <span className="text-primary text-[10px] font-mono leading-none">{user.points} POINTS</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-all duration-200 border border-border group"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="glass-header h-20 flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Shield className="w-6 h-6 text-primary" />
          </div>

          <div className="hidden md:flex items-center gap-2 bg-muted/50 border border-border px-4 py-2 rounded-xl w-96 group focus-within:border-primary/50 transition-all">
            <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search challenges, users, teams..." 
              className="bg-transparent border-none outline-none text-sm w-full font-mono placeholder:text-muted-foreground/50"
            />
            <div className="hidden sm:flex items-center gap-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border text-muted-foreground">
              <span className="font-mono">CTRL</span>
              <span className="font-mono">K</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all border border-transparent hover:border-border">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full shadow-glow-green animate-pulse"></span>
            </button>
            
            <div className="h-8 w-px bg-border mx-1"></div>

            <Link
              href="/profile"
              className="flex items-center gap-3 bg-secondary/50 border border-border pl-1 pr-4 py-1 rounded-full hover:bg-secondary transition-all hover:border-primary/30"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs shadow-glow-green">
                {user.username[0].toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold leading-none tracking-tight">{user.username}</span>
                <span className="text-[10px] text-muted-foreground font-mono leading-none">Rank #12</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-8 lg:px-16 py-10 max-w-[1600px] mx-auto w-full">
          <BackButton />
          {children}
        </main>
        
        {/* Footer */}
        <footer className="px-10 py-6 border-t border-htb-border flex flex-col sm:flex-row justify-between items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-glow-green"></span>
            SYSTEM_STATUS: <span className="text-primary">OPERATIONAL</span>
          </div>
          <div className="text-[10px] font-mono tracking-widest uppercase">
            © 2024 BLACKVAULT_SECURITY // SECURE_ACCESS_GRANTED
          </div>
        </footer>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
