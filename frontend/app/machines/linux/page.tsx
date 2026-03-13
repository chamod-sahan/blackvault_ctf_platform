'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { challengeApi } from '@/lib/api';
import { 
  Search, 
  Terminal, 
  Filter, 
  CheckCircle2, 
  Cpu,
  Activity,
  ChevronRight,
  Loader2
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

export default function LinuxMachinesPage() {
  const [machines, setMachines] = useState<Challenge[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await challengeApi.getChallenges();
        const allChallenges = data.challenges || [];
        const linuxMachines = allChallenges.filter((c: any) => c.os === 'LINUX');
        setMachines(linuxMachines);
      } catch (error) {
        console.error('Failed to fetch machines:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMachines = machines.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-transparent rounded-xl blur-lg opacity-50" />
        <div className="relative bg-htb-card border border-htb-border rounded-xl p-8 overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Cpu className="w-32 h-32 text-orange-500" />
          </div>
          <div className="flex items-center gap-3 text-orange-500 font-mono text-sm mb-4">
            <Terminal className="w-4 h-4" />
            <span className="tracking-[0.2em] uppercase">Target / Linux</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4 italic uppercase text-orange-500">Linux_Machines</h1>
          <p className="text-muted-foreground max-w-2xl font-medium leading-relaxed">
            Exploit vulnerabilities in Unix-based systems. Perform kernel exploitation, bypass SELinux, and escalate privileges to root.
          </p>
        </div>
      </div>

      <div className="bg-htb-card/50 border border-htb-border p-4 rounded-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="SEARCH_LINUX_TARGETS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="htb-input pl-10 h-11 border-transparent bg-background/50 focus:bg-background focus:ring-orange-500/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          <p className="text-orange-500 font-mono text-xs tracking-widest animate-pulse">PROBING_HOSTS...</p>
        </div>
      ) : filteredMachines.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMachines.map((machine) => {
            const diff = difficultyConfig[machine.difficulty];
            return (
              <Link
                key={machine.id}
                href={`/challenges/${machine.id}`}
                className="htb-card group relative p-0 overflow-hidden flex flex-col transition-all duration-300 hover:ring-2 hover:ring-orange-500/20"
              >
                <div className="p-6 pb-4 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-htb-border group-hover:border-orange-500/30 transition-colors">
                      <Cpu className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-orange-500 transition-colors uppercase truncate max-w-[180px]">
                        {machine.title}
                      </h3>
                      <div className="text-[10px] font-mono text-muted-foreground tracking-widest mt-0.5 uppercase">
                        Kernel v5.x
                      </div>
                    </div>
                  </div>
                  {machine.solved && (
                    <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold bg-primary/10 px-2 py-1 rounded-md border border-primary/20 uppercase">
                      <CheckCircle2 className="w-3 h-3" />
                      Pwnd
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 flex flex-col gap-2 bg-muted/20">
                  <div className="flex justify-between items-center text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-tighter">
                    <span>Complexity</span>
                    <span className={machine.solved ? 'text-primary' : ''}>{machine.difficulty}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 flex-1 rounded-full ${
                          i <= diff.segments 
                            ? (machine.solved ? 'bg-primary' : diff.color) 
                            : 'bg-htb-border/50'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="p-6 pt-4 mt-auto flex items-center justify-between border-t border-htb-border">
                  <div>
                    <span className="text-xl font-black text-foreground leading-none">{machine.points}</span>
                    <span className="block text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Weight</span>
                  </div>
                  <div className="htb-button-secondary py-1.5 px-4 h-auto text-[10px] border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all uppercase">
                    Launch_Exploit
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 htb-card border-dashed bg-transparent border-orange-500/20">
          <Cpu className="w-16 h-16 text-orange-500/20 mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2 uppercase tracking-widest text-muted-foreground">No Linux Targets</h2>
          <p className="text-sm text-muted-foreground/60">No systems matching your signature were detected.</p>
        </div>
      )}
    </div>
  );
}
