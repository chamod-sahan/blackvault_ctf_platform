'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { challengeApi } from '@/lib/api';
import { 
  Search, 
  Terminal, 
  CheckCircle2, 
  Globe, 
  Cpu, 
  Key, 
  FileSearch, 
  Code2, 
  Zap,
  Activity,
  Award,
  Loader2,
  Layers,
  ChevronRight
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  points: number;
  solved: boolean;
}

const categoryIcons: Record<string, any> = {
  Web: Globe,
  Pwn: Terminal,
  Crypto: Key,
  Reverse: Code2,
  Forensics: FileSearch,
  Warmup: Zap,
  Default: Cpu
};

const difficultyConfig: Record<string, { color: string, segments: number }> = {
  EASY: { color: 'bg-htb-green', segments: 1 },
  MEDIUM: { color: 'bg-warning', segments: 2 },
  HARD: { color: 'bg-orange-500', segments: 3 },
  EXPERT: { color: 'bg-error', segments: 4 },
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [{ data: challengesData }, { data: categoriesData }] =
          await Promise.all([
            challengeApi.getChallenges(),
            challengeApi.getCategories(),
          ]);
        setChallenges(challengesData.challenges || []);
        setCategories(categoriesData.categories || []);
      } catch (error) {
        console.error('Failed to fetch challenges:', error);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredChallenges = Array.isArray(challenges) 
    ? challenges.filter((c) => {
        if (selectedCategory && c.category !== selectedCategory) return false;
        if (selectedDifficulty && c.difficulty !== selectedDifficulty) return false;
        if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      })
    : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-2 lg:px-4">
      {/* Page Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-xl blur-lg opacity-50" />
        <div className="relative bg-htb-card border border-htb-border rounded-xl p-8 sm:p-10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Activity className="w-32 h-32 text-primary" />
          </div>
          <div className="flex items-center gap-3 text-primary font-mono text-sm mb-4">
            <Terminal className="w-4 h-4" />
            <span className="tracking-[0.2em] uppercase">Modules / Labs</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4 italic uppercase">Standalone_Objectives</h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
            High-value technical challenges. Exploit standalone vulnerabilities across multiple domains to earn points and climb the hierarchy.
          </p>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-[#0d0e12] border border-htb-border p-4 rounded-xl flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="SCAN_OBJECTIVES_BY_NAME..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="htb-input pl-12 h-12 bg-background/50 border-htb-border"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 lg:w-1/2">
          <div className="relative flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="htb-input h-12 appearance-none cursor-pointer border-htb-border bg-background/50 pr-10 text-xs font-bold"
            >
              <option value="">ALL_CATEGORIES</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90" />
          </div>

          <div className="relative flex-1">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="htb-input h-12 appearance-none cursor-pointer border-htb-border bg-background/50 pr-10 text-xs font-bold"
            >
              <option value="">ALL_DIFFICULTIES</option>
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
              <option value="EXPERT">EXPERT</option>
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90" />
          </div>
        </div>
      </div>

      {/* Challenge Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-primary font-mono text-xs tracking-widest animate-pulse">LOCATING_TARGET_NODES...</p>
        </div>
      ) : filteredChallenges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
          {filteredChallenges.map((challenge) => {
            const Icon = categoryIcons[challenge.category] || categoryIcons.Default;
            const diff = difficultyConfig[challenge.difficulty];
            
            return (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.id}`}
                className={`htb-card group relative p-0 overflow-hidden flex flex-col transition-all duration-300 hover:ring-1 hover:ring-primary/40 hover:translate-y-[-2px] shadow-xl ${challenge.solved ? 'opacity-90' : ''}`}
              >
                {/* Header Visual Area */}
                <div className="h-32 relative flex items-center justify-center overflow-hidden border-b border-htb-border bg-primary/5">
                   <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-glow-green" />
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 border-htb-border group-hover:scale-110 transition-transform duration-500 shadow-2xl relative z-10 bg-[#0d0e12]`}>
                      <Icon className={`w-8 h-8 ${challenge.solved ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                   </div>
                   <Icon className="absolute -bottom-4 -right-4 w-24 h-24 text-primary opacity-[0.03] rotate-12" />
                </div>

                {/* Body Area */}
                <div className="p-5 flex-1 flex flex-col">
                   <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-base uppercase tracking-tight group-hover:text-primary transition-colors truncate italic">
                        {challenge.title}
                      </h3>
                      {challenge.solved && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                   </div>
                   
                   <div className="flex items-center gap-2 mb-4">
                      <span className="text-[9px] font-mono font-bold text-primary tracking-widest uppercase">
                        {challenge.category}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                      <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                        Lab_Node
                      </span>
                   </div>

                   <div className="space-y-2 mt-auto">
                      <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground uppercase tracking-tighter">
                         <span>Complexity</span>
                         <span className={challenge.solved ? 'text-primary' : ''}>{challenge.difficulty}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div 
                            key={i} 
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                              i <= diff.segments 
                                ? (challenge.solved ? 'bg-primary shadow-glow-green' : diff.color) 
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
                      <span className="text-lg font-black text-foreground leading-none tracking-tighter italic">{challenge.points}</span>
                      <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Weight</span>
                   </div>
                   <div className="text-[9px] font-bold text-primary hover:underline uppercase tracking-[0.2em] flex items-center gap-1 group-hover:gap-2 transition-all">
                      {challenge.solved ? 'REVIEW' : 'DEPLOY'} <ChevronRight className="w-3 h-3" />
                   </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 htb-card border-dashed bg-transparent opacity-50">
          <Layers className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2 uppercase tracking-widest text-muted-foreground">No_Objectives_Detected</h2>
          <p className="text-[10px] font-mono uppercase">Laboratory registry is empty for this classification.</p>
        </div>
      )}
    </div>
  );
}
