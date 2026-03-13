'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { challengeApi } from '@/lib/api';
import { 
  Search, 
  Terminal, 
  CheckCircle2, 
  Monitor,
  Cpu,
  Server,
  Activity,
  ChevronRight,
  Loader2,
  Layers,
  Award,
  Zap
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  category: string;
  type: string;
  os: string;
  difficulty: string;
  points: number;
  solved: boolean;
}

const difficultyConfig: Record<string, { color: string, segments: number }> = {
  EASY: { color: 'bg-htb-green', segments: 1 },
  MEDIUM: { color: 'bg-warning', segments: 2 },
  HARD: { color: 'bg-orange-500', segments: 3 },
  EXPERT: { color: 'bg-error', segments: 4 },
};

export default function MachinesPage() {
  const [machines, setMachines] = useState<Challenge[]>([]);
  const [search, setSearch] = useState('');
  const [selectedOS, setSelectedOS] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await challengeApi.getChallenges();
        const allChallenges = data.challenges || [];
        const machineList = allChallenges.filter((c: any) => c.type === 'MACHINE' || c.os);
        setMachines(machineList);
      } catch (error) {
        console.error('Failed to fetch machines:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMachines = machines.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchesOS = selectedOS === 'ALL' || m.os === selectedOS;
    return matchesSearch && matchesOS;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-2 lg:px-4">
      {/* Page Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-xl blur-lg opacity-50" />
        <div className="relative bg-htb-card border border-htb-border rounded-xl p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Server className="w-32 h-32 text-primary" />
          </div>
          <div className="flex items-center gap-3 text-primary font-mono text-sm mb-4">
            <Terminal className="w-4 h-4" />
            <span className="tracking-[0.2em] uppercase">Modules / Machines</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4 italic uppercase">Target_Infiltration</h1>
          <p className="text-muted-foreground max-w-2xl font-medium leading-relaxed">
            Authorized infiltration nodes. Select an enterprise target and deploy your exploit methodology to secure the flag.
          </p>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex bg-[#0d0e12] border border-htb-border p-1 rounded-xl w-full lg:w-fit">
          {[
            { id: 'ALL', label: 'ALL', icon: Layers },
            { id: 'LINUX', label: 'LINUX', icon: Cpu },
            { id: 'WINDOWS', label: 'WINDOWS', icon: Monitor },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedOS(tab.id)}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${
                selectedOS === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-glow-green' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="FILTER_BY_IDENTITY..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="htb-input pl-12 h-12 bg-[#0d0e12] border-htb-border focus:bg-background"
          />
        </div>
      </div>

      {/* Machine Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-primary font-mono text-xs tracking-widest animate-pulse">PROBING_SUBNETS...</p>
        </div>
      ) : filteredMachines.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
          {filteredMachines.map((machine) => {
            const diff = difficultyConfig[machine.difficulty];
            const IsWindows = machine.os === 'WINDOWS';
            
            return (
              <Link
                key={machine.id}
                href={`/challenges/${machine.id}`}
                className={`htb-card group relative p-0 overflow-hidden flex flex-col transition-all duration-300 hover:ring-1 hover:ring-primary/40 hover:translate-y-[-2px] shadow-xl ${machine.solved ? 'opacity-90' : ''}`}
              >
                {/* Header Avatar Area */}
                <div className={`h-32 relative flex items-center justify-center overflow-hidden border-b border-htb-border ${IsWindows ? 'bg-blue-500/5' : 'bg-orange-500/5'}`}>
                   <div className={`absolute top-0 left-0 w-full h-1 ${IsWindows ? 'bg-blue-500' : 'bg-orange-500'}`} />
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 border-htb-border group-hover:scale-110 transition-transform duration-500 shadow-2xl relative z-10 bg-[#0d0e12]`}>
                      {IsWindows ? <Monitor className="w-8 h-8 text-blue-500" /> : <Cpu className="w-8 h-8 text-orange-500" />}
                   </div>
                   {/* Background Decorative Icon */}
                   {IsWindows ? <Monitor className="absolute -bottom-4 -right-4 w-24 h-24 text-blue-500 opacity-[0.03] rotate-12" /> : <Cpu className="absolute -bottom-4 -right-4 w-24 h-24 text-orange-500 opacity-[0.03] rotate-12" />}
                </div>

                {/* Body Area */}
                <div className="p-5 flex-1 flex flex-col">
                   <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-base uppercase tracking-tight group-hover:text-primary transition-colors truncate italic">
                        {machine.title}
                      </h3>
                      {machine.solved && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                   </div>
                   
                   <div className="flex items-center gap-2 mb-4">
                      <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${IsWindows ? 'text-blue-400' : 'text-orange-400'}`}>
                        {machine.os}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                      <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">{machine.category}</span>
                   </div>

                   <div className="space-y-2 mt-auto">
                      <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground uppercase tracking-tighter">
                         <span>Complexity</span>
                         <span className={machine.solved ? 'text-primary' : ''}>{machine.difficulty}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div 
                            key={i} 
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                              i <= diff.segments 
                                ? (machine.solved ? 'bg-primary' : diff.color) 
                                : 'bg-htb-border/30'
                            }`} 
                          />
                        ))}
                      </div>
                   </div>
                </div>

                {/* Footer Area */}
                <div className="px-5 py-4 bg-muted/10 border-t border-htb-border flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-lg font-black text-foreground leading-none tracking-tighter">{machine.points}</span>
                      <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Weight</span>
                   </div>
                   <div className="text-[9px] font-bold text-primary hover:underline uppercase tracking-[0.2em] flex items-center gap-1 group-hover:gap-2 transition-all">
                      {machine.solved ? 'REVIEW' : 'EXPLOIT'} <ChevronRight className="w-3 h-3" />
                   </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 htb-card border-dashed bg-transparent opacity-50">
          <Server className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2 uppercase tracking-widest text-muted-foreground">No_Targets_Acquired</h2>
          <p className="text-[10px] font-mono uppercase">System registry is empty for this subnet.</p>
        </div>
      )}
    </div>
  );
}
