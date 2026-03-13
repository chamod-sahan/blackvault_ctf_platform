'use client';

import { useEffect, useState } from 'react';
import { userApi, submissionApi } from '@/lib/api';
import { 
  ShieldAlert, 
  Users, 
  Flag, 
  Activity, 
  TrendingUp, 
  Terminal, 
  Database, 
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCcw
} from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  users: number;
  challenges: number;
  solves: number;
  expired: number;
}

interface RecentSubmission {
  id: string;
  user: { username: string };
  challenge: { title: string };
  correct: boolean;
  createdAt: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats>({ users: 0, challenges: 0, solves: 0, expired: 0 });
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, subsRes] = await Promise.all([
        userApi.getStats(),
        submissionApi.getAllSubmissions(1)
      ]);

      if (statsRes.data && statsRes.data.stats) {
        setStats(statsRes.data.stats);
      }
      
      if (subsRes.data && subsRes.data.submissions) {
        setRecentSubmissions(subsRes.data.submissions.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-purple-500 font-mono text-xs tracking-widest animate-pulse">QUERYING_SYSTEM_METRICS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-2 sm:px-0">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-purple-500/20 pb-8">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-mono text-[10px] sm:text-xs mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>/root/admin/overview</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic text-purple-500">Command_Center</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl font-medium leading-relaxed">
            System-wide operational oversight. Monitor infrastructure health, operator activity, and engagement metrics.
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="flex-1 md:flex-none px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-500 text-[10px] font-bold font-mono uppercase tracking-widest text-center">
              Uptime: 99.9%
           </div>
           <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-black rounded-lg text-[10px] font-bold font-mono uppercase tracking-widest hover:bg-purple-400 transition-all shadow-lg shadow-purple-500/20"
           >
              <RefreshCcw className="w-3 h-3" /> Sync_Data
           </button>
        </div>
      </div>

      {/* Stats Cards - Responsive Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TOTAL_OPERATORS', value: stats.users, icon: Users, color: 'text-blue-500' },
          { label: 'ACTIVE_LABS', value: stats.challenges, icon: Database, color: 'text-purple-500' },
          { label: 'DEACTIVATE_LABS', value: stats.expired, icon: Flag, color: 'text-red-500' },
          { label: 'SYSTEM_SOLVES', value: stats.solves, icon: TrendingUp, color: 'text-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="htb-card border-purple-500/10 group relative overflow-hidden p-6 hover:translate-y-[-2px] transition-all">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                   <p className="text-3xl sm:text-4xl font-black italic tracking-tighter">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center border border-purple-500/10 transition-colors group-hover:border-purple-500/30 ${stat.color}`}>
                   <stat.icon className="w-7 h-7" />
                </div>
             </div>
             <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Submission Log */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 text-purple-500">
                <Clock className="w-5 h-5" /> Infiltration_Log
              </h2>
              <Link href="/admin/submissions" className="text-[10px] font-mono text-purple-500/60 hover:text-purple-500 uppercase tracking-widest transition-colors font-bold">
                View_Full_History
              </Link>
           </div>

           <div className="htb-card p-0 border-purple-500/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="bg-purple-500/5 border-b border-purple-500/10">
                      <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Operator</th>
                      <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Target</th>
                      <th className="text-center py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Status</th>
                      <th className="text-right py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    {recentSubmissions.length > 0 ? recentSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-purple-500/5 transition-colors group">
                        <td className="py-5 px-6 font-bold text-sm uppercase tracking-tight group-hover:text-purple-500 transition-colors">
                          {sub.user.username}
                        </td>
                        <td className="py-5 px-6">
                          <span className="text-xs text-muted-foreground font-mono">{sub.challenge.title}</span>
                        </td>
                        <td className="py-5 px-6 text-center">
                          {sub.correct ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-bold uppercase tracking-tighter">
                              <CheckCircle2 className="w-3 h-3" /> PWND
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-bold uppercase tracking-tighter">
                              <XCircle className="w-3 h-3" /> FAIL
                            </div>
                          )}
                        </td>
                        <td className="py-5 px-6 text-right text-[10px] font-mono text-muted-foreground uppercase">
                          {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-muted-foreground font-mono text-xs uppercase tracking-[0.3em] opacity-20">
                          No_Infiltration_Data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

        {/* System Health / Alerts */}
        <div className="space-y-8">
           <h2 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 px-2 text-purple-500">
             <Activity className="w-5 h-5" /> Global_Health
           </h2>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <div className="htb-card border-purple-500/10 bg-purple-500/5 p-6">
                 <div className="flex items-center gap-3 mb-5">
                    <AlertCircle className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold text-xs uppercase tracking-widest italic">Live_Alerts</h3>
                 </div>
                 <div className="space-y-4">
                    <div className="text-[10px] font-mono p-4 bg-background/50 border border-purple-500/10 rounded-xl text-muted-foreground leading-relaxed">
                       <span className="text-red-500 font-bold">[WARN]</span> VPN node #42 is experiencing high latency.
                    </div>
                    <div className="text-[10px] font-mono p-4 bg-background/50 border border-purple-500/10 rounded-xl text-muted-foreground leading-relaxed">
                       <span className="text-blue-500 font-bold">[INFO]</span> Database sync successful.
                    </div>
                 </div>
              </div>

              <div className="htb-card border-purple-500/10 p-6">
                 <h3 className="text-[10px] font-black italic tracking-widest text-purple-500 uppercase mb-6 flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Core_Allocation
                 </h3>
                 <div className="space-y-6">
                    <div>
                       <div className="flex justify-between text-[9px] font-mono uppercase mb-2 font-bold">
                          <span>CPU_POWER</span>
                          <span className="text-purple-500">42%</span>
                       </div>
                       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-htb-border">
                          <div className="h-full bg-purple-500 w-[42%] shadow-glow-purple shadow-lg" />
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-[9px] font-mono uppercase mb-2 font-bold">
                          <span>MEM_STATIC</span>
                          <span className="text-purple-500">1.2GB</span>
                       </div>
                       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-htb-border">
                          <div className="h-full bg-purple-500 w-[65%] shadow-glow-purple shadow-lg" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
