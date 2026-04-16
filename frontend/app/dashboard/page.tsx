'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { userApi, submissionApi, educationApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { 
  Trophy, 
  Flag, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  Terminal, 
  Shield, 
  Activity,
  Award,
  ChevronRight,
  Zap,
  Target,
  Loader2,
  Map as MapIcon
} from 'lucide-react';

interface Solve {
  id: string;
  challenge: {
    id: string;
    title: string;
    category: string;
    points: number;
  };
  solvedAt: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [recentSolves, setRecentSolves] = useState<Solve[]>([]);
  const [stats, setStats] = useState({ users: 0, challenges: 0, solves: 0, paths: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        const [solvesRes, statsRes, pathsRes] = await Promise.all([
          submissionApi.getSolves(),
          userApi.getStats(),
          educationApi.getPaths()
        ]);
        
        console.log('Dashboard Data Received:', { 
          solves: solvesRes.data, 
          stats: statsRes.data, 
          paths: pathsRes.data 
        });

        if (solvesRes.data && solvesRes.data.solves) {
          setRecentSolves(solvesRes.data.solves.slice(0, 5));
        }

        const baseStats = statsRes.data?.stats || { users: 0, challenges: 0, solves: 0, expired: 0 };
        const pathCount = pathsRes.data?.paths?.length || 0;

        setStats({
          ...baseStats,
          paths: pathCount
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-mono text-xs tracking-widest animate-pulse">FETCHING_USER_PROFILE_DATA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32 px-4 lg:px-0 max-w-[1400px] mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-htb-border pb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] sm:text-xs mb-3">
            <Terminal className="w-4 h-4" />
            <span>/root/home/{user?.username}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-3 uppercase italic">Terminal_Overview</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl font-medium leading-relaxed">
            Welcome back, Operator. Your current clearance level is <span className="text-primary font-mono bg-primary/5 px-2 py-0.5 rounded border border-primary/10">AUTHORIZED</span>. 
            All intelligence nodes are operational and waiting for deployment.
          </p>
        </div>
        
        <div className="flex items-center gap-3 px-5 py-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary text-[11px] font-black tracking-[0.2em] uppercase shadow-glow-green">
          <Activity className="w-4 h-4 animate-pulse" />
          SESSION_ACTIVE // 10.10.10.42
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        {[
          { label: 'YOUR_CREDITS', value: user?.points || 0, icon: Trophy, color: 'text-primary' },
          { label: 'ACTIVE_ROADMAPS', value: stats.paths, icon: MapIcon, color: 'text-blue-500' },
          { label: 'OBJECTIVES_SECURED', value: recentSolves.length, icon: Flag, color: 'text-green-500' },
          { label: 'TOTAL_OPERATORS', value: stats.users, icon: Users, color: 'text-purple-500' },
          { label: 'GLOBAL_BREAKS', value: stats.solves, icon: TrendingUp, color: 'text-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="htb-card group relative overflow-hidden p-5 lg:p-6 hover:translate-y-[-4px] transition-all duration-300">
             <div className="flex items-center justify-between gap-3">
                <div className="space-y-2 min-w-0 flex-1">
                   <p className="text-[9px] md:text-[10px] 2xl:text-[11px] font-mono text-muted-foreground uppercase tracking-widest font-bold leading-tight">{stat.label}</p>
                   <p className="text-3xl sm:text-4xl 2xl:text-5xl font-black italic tracking-tighter leading-none">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 lg:w-14 lg:h-14 2xl:w-16 2xl:h-16 shrink-0 rounded-2xl bg-muted/30 flex items-center justify-center border border-htb-border group-hover:border-primary/30 transition-colors ${stat.color} shadow-inner`}>
                   <stat.icon className="w-6 h-6 lg:w-7 lg:h-7 2xl:w-8 2xl:h-8" />
                </div>
             </div>
             <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
        {/* Recent Solves */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black uppercase tracking-[0.3em] flex items-center gap-4 italic">
              <Activity className="w-6 h-6 text-primary animate-pulse" /> MISSION_LOG
            </h2>
            <Link href="/challenges" className="text-[11px] font-mono text-primary hover:underline uppercase tracking-widest font-black flex items-center gap-2 group">
              Full_Registry <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="htb-card p-0 overflow-hidden border-htb-border/50 shadow-2xl">
            {recentSolves.length > 0 ? (
              <div className="divide-y divide-htb-border">
                {recentSolves.map((solve) => (
                  <div key={solve.id} className="p-6 sm:p-8 hover:bg-primary/5 transition-all flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-secondary/50 rounded-2xl flex items-center justify-center border border-htb-border group-hover:border-primary/20 transition-colors shadow-inner">
                         <Zap className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg tracking-tight group-hover:text-primary transition-colors uppercase italic">{solve.challenge.title}</h3>
                        <div className="flex items-center gap-4 mt-2">
                           <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg tracking-widest uppercase border border-primary/10">
                             {solve.challenge.category}
                           </span>
                           <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-tighter">
                             Intercepted // {new Date(solve.solvedAt).toLocaleDateString()}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-primary font-black text-3xl tracking-tighter italic">+{solve.challenge.points}</span>
                      <span className="block text-[9px] font-mono text-muted-foreground uppercase leading-none mt-1 tracking-widest">Credits</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-24 text-center text-muted-foreground bg-[#0d0e12]">
                <Terminal className="w-20 h-20 mx-auto mb-8 opacity-5" />
                <p className="text-sm font-mono uppercase tracking-[0.4em] font-bold">No_Infiltration_Data_Interpreted</p>
                <Link href="/challenges" className="htb-button-primary inline-flex mt-10 h-14 text-sm px-10 font-black italic tracking-tighter">
                   INITIALIZE_DEPLOYMENT
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Control */}
        <div className="space-y-8">
          <h2 className="text-lg font-black uppercase tracking-[0.3em] flex items-center gap-4 px-2 italic">
            <Target className="w-6 h-6 text-primary" /> CORE_INTERFACE
          </h2>
          
          <div className="grid grid-cols-1 gap-5">
            {[
              { label: 'ACADEMY_BASE', href: '/academy', icon: Award, desc: 'Technical training nodes' },
              { label: 'LAB_REGISTRY', href: '/challenges', icon: Flag, desc: 'Standalone objectiveSec' },
              { label: 'OPERATOR_RANK', href: '/leaderboard', icon: Trophy, desc: 'Global hierarchy sync' },
              { label: 'TARGET_MACHINES', href: '/machines', icon: Shield, desc: 'Live network targets' },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="htb-card group flex items-center gap-6 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 shadow-xl"
              >
                <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center border border-htb-border group-hover:border-primary/30 transition-colors shadow-inner">
                   <action.icon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-black text-sm tracking-[0.15em] uppercase group-hover:text-primary transition-colors italic">{action.label}</h3>
                  <p className="text-[11px] text-muted-foreground truncate font-mono mt-1 uppercase opacity-50 tracking-tighter">{action.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
              </Link>
            ))}
          </div>

          {/* Efficiency Tracker */}
          <div className="htb-card bg-primary/5 border-primary/20 relative overflow-hidden group p-8 shadow-2xl">
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xs font-black italic tracking-tighter text-primary uppercase">Sync_Efficiency</h3>
                   <Activity className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <div className="flex justify-between items-end mb-4">
                   <span className="text-4xl font-black tracking-tighter italic">820 <span className="text-sm text-muted-foreground font-normal opacity-50">/ 1000</span></span>
                   <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-[0.2em]">Tier_3</span>
                </div>
                <div className="h-2.5 w-full bg-primary/10 rounded-full overflow-hidden border border-primary/10 p-0.5">
                   <div className="h-full bg-primary w-[82%] shadow-glow-green rounded-full" />
                </div>
             </div>
             <Award className="absolute -right-8 -bottom-8 w-40 h-40 text-primary opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
          </div>
        </div>
      </div>
    </div>
  );
}
