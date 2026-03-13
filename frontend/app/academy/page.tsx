'use client';

import { useEffect, useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  ChevronRight, 
  Terminal as TerminalIcon,
  Search,
  Loader2,
  Layers,
  FileText,
  Binary
} from 'lucide-react';
import Link from 'next/link';
import { educationApi } from '@/lib/api';

interface AcademyModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  type: string;
  imageUrl?: string | null;
  _count: { questions: number };
}

export default function AcademyPage() {
  const [modules, setModules] = useState<AcademyModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const { data } = await educationApi.getAcademyModules();
        setModules(data.modules);
      } catch (error) {
        console.error('Failed to fetch academy modules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  const getModuleIcon = (type: string) => {
    if (type === 'LAB') return TerminalIcon;
    if (type === 'VIDEO') return Binary;
    return FileText;
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'EASY') return 'bg-htb-green';
    if (diff === 'MEDIUM') return 'bg-warning';
    if (diff === 'HARD') return 'bg-orange-500';
    return 'bg-error';
  };

  const filteredModules = modules.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-2 lg:px-4">
      {/* Academy Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-transparent rounded-2xl blur-xl opacity-50" />
        <div className="relative bg-htb-card border border-htb-border rounded-2xl p-8 sm:p-10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <GraduationCap className="w-48 h-48 text-primary" />
          </div>
          <div className="flex items-center gap-3 text-primary font-mono text-sm mb-6">
            <BookOpen className="w-5 h-5" />
            <span className="tracking-[0.3em] uppercase">HTB Academy / Knowledge_Base</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-6 italic uppercase">Academic_Catalog</h1>
          <p className="text-xl text-muted-foreground max-w-3xl font-medium leading-relaxed">
            Focused standalone training nodes. Deep dive into specific technical domains and validate your knowledge through interactive briefings.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="bg-background/50 border border-htb-border px-6 py-3 rounded-xl flex items-center gap-4">
               <div className="text-2xl font-black text-primary italic">{modules.length}</div>
               <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Nodes<br/>Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-[#0d0e12] border border-htb-border p-4 rounded-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="FILTER_ACADEMY_BY_IDENTITY_OR_DOMAIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background/50 border border-htb-border rounded-lg pl-12 h-12 text-sm font-mono text-primary focus:outline-none focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Module Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-primary font-mono text-xs tracking-widest animate-pulse">RETRIVING_KNOWLEDGE_NODES...</p>
          </div>
        ) : filteredModules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
            {filteredModules.map((mod) => {
              const Icon = getModuleIcon(mod.type);
              const diffColor = getDifficultyColor(mod.difficulty);
              
              return (
                <div key={mod.id} className="htb-card group relative p-0 overflow-hidden flex flex-col transition-all duration-300 hover:ring-1 hover:ring-primary/40 hover:translate-y-[-2px] shadow-xl">
                   {/* Header Visual Area */}
                   <div className="h-32 relative flex items-center justify-center overflow-hidden border-b border-htb-border bg-primary/5">
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                      <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-htb-border group-hover:scale-110 transition-transform duration-500 shadow-2xl relative z-10 bg-[#0d0e12]">
                         {mod.imageUrl ? (
                           <img src={`${process.env.NEXT_PUBLIC_API_URL}${mod.imageUrl}`} className="w-full h-full object-cover rounded-full" alt="" />
                         ) : (
                           <Icon className="w-8 h-8 text-primary" />
                         )}
                      </div>
                      <BookOpen className="absolute -bottom-4 -right-4 w-24 h-24 text-primary opacity-[0.03] rotate-12" />
                   </div>

                   {/* Body Area */}
                   <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-base uppercase tracking-tight group-hover:text-primary transition-colors mb-1 italic truncate">
                        {mod.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-4">
                         <span className="text-[9px] font-mono font-bold text-primary tracking-widest uppercase">
                           {mod.category}
                         </span>
                         <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                         <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                           {mod.type}
                         </span>
                      </div>

                      <p className="text-[10px] text-muted-foreground line-clamp-2 mb-4 font-medium leading-relaxed">
                        {mod.description}
                      </p>

                      <div className="space-y-2 mt-auto">
                         <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground uppercase tracking-tighter">
                            <span>Difficulty</span>
                            <span className="text-primary">{mod.difficulty}</span>
                         </div>
                         <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${diffColor} transition-all duration-1000`} style={{ width: mod.difficulty === 'EASY' ? '25%' : mod.difficulty === 'MEDIUM' ? '50%' : mod.difficulty === 'HARD' ? '75%' : '100%' }} />
                         </div>
                      </div>
                   </div>

                   {/* Footer Area */}
                   <div className="px-5 py-4 bg-muted/10 border-t border-htb-border flex items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-lg font-black text-foreground leading-none tracking-tighter">{mod.points}</span>
                         <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Credits</span>
                      </div>
                      <Link 
                        href={`/academy/module/${mod.id}`}
                        className="text-[9px] font-bold text-primary hover:underline uppercase tracking-[0.2em] flex items-center gap-1 group-hover:gap-2 transition-all"
                      >
                         START_NODE <ChevronRight className="w-3 h-3" />
                      </Link>
                   </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 htb-card border-dashed bg-transparent opacity-50">
             <Layers className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
             <h2 className="text-xl font-bold mb-2 uppercase tracking-widest text-muted-foreground">No_Modules_Detected</h2>
             <p className="text-[10px] font-mono uppercase">The academic library is currently offline or empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
