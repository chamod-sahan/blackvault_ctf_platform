'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Terminal, 
  Flag, 
  Monitor, 
  Cpu, 
  GraduationCap, 
  Map, 
  X,
  Command,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { challengeApi } from '@/lib/api';

export default function CommandSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle Search
  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await challengeApi.getChallenges();
        const filtered = (data.challenges || []).filter((c: any) => 
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);
        setResults(filtered);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const navigateTo = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:pt-32">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="w-full max-w-2xl bg-htb-card border border-primary/20 rounded-2xl shadow-[0_0_50px_rgba(159,239,0,0.15)] overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        {/* Search Input Area */}
        <div className="p-5 border-b border-htb-border flex items-center gap-4 bg-primary/5">
          <Search className="w-6 h-6 text-primary animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            placeholder="EXECUTE_GLOBAL_SEARCH_QUERY..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-lg font-mono text-primary placeholder:text-primary/30"
          />
          <div className="flex items-center gap-1.5 px-2 py-1 bg-background border border-htb-border rounded text-[10px] font-mono text-muted-foreground">
            <span className="font-bold">ESC</span>
          </div>
        </div>

        {/* Results Area */}
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 flex flex-col items-center gap-4">
               <Loader2 className="w-8 h-8 text-primary animate-spin" />
               <p className="text-[10px] font-mono text-primary/60 tracking-[0.3em] uppercase">Scanning_Registry...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2 space-y-1">
               <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Target_Matches</div>
               {results.map((res) => (
                 <button
                  key={res.id}
                  onClick={() => navigateTo(`/challenges/${res.id}`)}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-primary/10 group transition-all text-left border border-transparent hover:border-primary/20"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center border border-htb-border group-hover:border-primary/30 transition-colors">
                          {res.type === 'MACHINE' ? <Monitor className="w-5 h-5 text-blue-500" /> : <Flag className="w-5 h-5 text-primary" />}
                       </div>
                       <div>
                          <div className="font-bold text-sm uppercase group-hover:text-primary transition-colors">{res.title}</div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
                             <span className="text-primary/60">{res.category}</span>
                             <span className="w-1 h-1 rounded-full bg-border" />
                             <span>{res.difficulty}</span>
                          </div>
                       </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                 </button>
               ))}
            </div>
          ) : query ? (
            <div className="p-16 text-center text-muted-foreground">
               <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p className="font-mono text-xs uppercase tracking-widest">No_Results_Matching_Signature</p>
            </div>
          ) : (
            <div className="p-8 grid grid-cols-2 gap-4">
               {[
                 { label: 'Labs', path: '/challenges', icon: Flag },
                 { label: 'Machines', path: '/machines', icon: Monitor },
                 { label: 'Academy', path: '/academy', icon: GraduationCap },
                 { label: 'Roadmaps', path: '/learning-paths', icon: Map },
               ].map((cat) => (
                 <button
                  key={cat.label}
                  onClick={() => navigateTo(cat.path)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-htb-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                 >
                    <cat.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest group-hover:text-primary">{cat.label}</span>
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/20 border-t border-htb-border flex items-center justify-between text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
           <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><ChevronDown className="w-3 h-3 rotate-180" /> <ChevronDown className="w-3 h-3" /> Navigate</span>
              <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3 rotate-[270deg]" /> Select</span>
           </div>
           <div className="flex items-center gap-1">
              <Command className="w-3 h-3" /> + K to Toggle
           </div>
        </div>
      </div>
    </div>
  );
}
