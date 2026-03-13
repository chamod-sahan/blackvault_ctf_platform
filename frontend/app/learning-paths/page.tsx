'use client';

import { useEffect, useState } from 'react';
import { 
  Map as MapIcon, 
  ChevronRight, 
  Compass,
  Shield,
  Activity,
  Target,
  Loader2,
  Layers,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { educationApi } from '@/lib/api';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  difficulty: string;
  points: number;
  _count: { modules: number };
  progress?: number;
}

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        setLoading(true);
        const { data } = await educationApi.getPaths();
        const pathsArray = data.paths || [];
        
        // Add random progress for visual consistency
        const pathsWithProgress = pathsArray.map((p: any) => ({
          ...p,
          progress: Math.floor(Math.random() * 100)
        }));
        setPaths(pathsWithProgress);
      } catch (error) {
        console.error('Failed to fetch paths:', error);
        setPaths([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPaths();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-2 lg:px-4">
      {/* Paths Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-transparent rounded-2xl blur-xl opacity-50" />
        <div className="relative bg-htb-card border border-htb-border rounded-2xl p-8 sm:p-10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <MapIcon 
 className="w-48 h-48 text-blue-500" />
          </div>
          <div className="flex items-center gap-3 text-blue-500 font-mono text-sm mb-6">
            <Compass className="w-5 h-5" />
            <span className="tracking-[0.3em] uppercase">Career Paths / Roadmap</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-6 italic uppercase text-blue-500">Global_Roadmaps</h1>
          <p className="text-xl text-muted-foreground max-w-3xl font-medium leading-relaxed">
            Guided technical journeys. Follow structured paths designed to take you from beginner to elite in specific cybersecurity roles.
          </p>
        </div>
      </div>

      {/* Path Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <div className="w-2 h-8 bg-blue-500 rounded-full shadow-glow-blue" />
           <h2 className="text-lg font-black italic tracking-tighter uppercase">Available_Missions</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-blue-500 font-mono text-xs tracking-widest animate-pulse">RECON_IN_PROGRESS...</p>
          </div>
        ) : paths.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
            {paths.map((path, i) => {
              const progress = path.progress || 0;
              
              return (
                <div key={path.id} className="htb-card group relative p-0 overflow-hidden flex flex-col transition-all duration-300 hover:ring-1 hover:ring-blue-500/40 hover:translate-y-[-2px] shadow-xl">
                   {/* Header Visual Area */}
                   <div className="h-32 relative flex items-center justify-center overflow-hidden border-b border-htb-border bg-blue-500/5">
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-htb-border group-hover:scale-110 transition-transform duration-500 shadow-2xl relative z-10 bg-[#0d0e12] overflow-hidden">
                         {path.imageUrl ? (
                           <img src={`${process.env.NEXT_PUBLIC_API_URL}${path.imageUrl}`} className="w-full h-full object-cover" alt="" />
                         ) : (
                           <MapIcon 
 className="w-8 h-8 text-blue-500" />
                         )}
                      </div>
                      <Target className="absolute -bottom-4 -right-4 w-24 h-24 text-blue-500 opacity-[0.03] rotate-12" />
                   </div>

                   {/* Body Area */}
                   <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-base uppercase tracking-tight group-hover:text-blue-500 transition-colors mb-1 italic truncate">
                        {path.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-4">
                         <span className="text-[9px] font-mono font-bold text-blue-400 tracking-widest uppercase">
                           {path.difficulty}
                         </span>
                         <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                         <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                           {path._count.modules} Modules
                         </span>
                      </div>

                      <p className="text-[10px] text-muted-foreground line-clamp-2 mb-4 font-medium leading-relaxed uppercase opacity-60">
                        {path.description}
                      </p>

                      <div className="space-y-2 mt-auto">
                         <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground uppercase tracking-tighter">
                            <span>Completion</span>
                            <span className={progress === 100 ? 'text-primary' : 'text-blue-500'}>{progress}%</span>
                         </div>
                         <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${progress === 100 ? 'bg-primary shadow-glow-green' : 'bg-blue-500 shadow-glow-blue'} transition-all duration-1000`} 
                              style={{ width: `${progress}%` }} 
                            />
                         </div>
                      </div>
                   </div>

                   {/* Footer Area */}
                   <div className="px-5 py-4 bg-muted/10 border-t border-htb-border flex items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-lg font-black text-foreground leading-none tracking-tighter">{path.points}</span>
                         <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Path_Weight</span>
                      </div>
                      <Link 
                        href={`/learning-paths/${path.title.toLowerCase().replace(/ /g, '-')}`}
                        className="text-[9px] font-bold text-blue-500 hover:underline uppercase tracking-[0.2em] flex items-center gap-1 group-hover:gap-2 transition-all"
                      >
                         VIEW_PATH <ChevronRight className="w-3 h-3" />
                      </Link>
                   </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 htb-card border-dashed bg-transparent opacity-50">
             <Layers className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
             <h2 className="text-xl font-bold mb-2 uppercase tracking-widest text-muted-foreground">No_Roadmaps_Found</h2>
             <p className="text-[10px] font-mono uppercase">The roadmap registry is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
