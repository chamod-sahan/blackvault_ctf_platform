'use client';

import { useEffect, useState } from 'react';
import { userApi, externalApi } from '@/lib/api';
import { onLeaderboardUpdate } from '@/lib/socket';
import { 
  Trophy, 
  Users, 
  Crown, 
  Terminal, 
  ChevronRight, 
  Activity, 
  Target,
  Award,
  Zap,
  Star,
  Search,
  Loader2,
  Globe,
  Flag,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

interface LeaderboardEntry {
  id: string;
  username?: string;
  name?: string;
  points: number;
  memberCount?: number;
  country?: string;
}

interface CountryData {
  cca2: string;
  name: { common: string };
  flags: { svg: string; png: string };
}

export default function LeaderboardPage() {
  const [type, setType] = useState<'users' | 'teams'>('users');
  const [region, setRegion] = useState<string>('GLOBAL');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const fetchCountries = async () => {
    try {
      const { data } = await externalApi.getCountries();
      const sorted = data.sort((a: any, b: any) => a.name.common.localeCompare(b.name.common));
      setCountries(sorted);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data } = await userApi.getLeaderboard(type, region);
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const unsubscribe = onLeaderboardUpdate(() => fetchLeaderboard());
    return () => unsubscribe();
  }, [type, region]);

  const filteredCountries = countries.filter(c => 
    c.name.common.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedCountryData = countries.find(c => c.cca2 === region);

  const filteredLeaderboard = leaderboard.filter(entry => 
    (entry.username || entry.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const topThree = filteredLeaderboard.slice(0, 3);
  const others = filteredLeaderboard.slice(3);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 px-6 md:px-10 py-8">
      {/* Header Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-transparent rounded-2xl blur-xl opacity-50" />
        <div className="relative htb-card p-10 overflow-hidden border-htb-border">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Trophy className="w-48 h-48 text-primary" />
          </div>
          <div className="flex items-center gap-3 text-primary font-mono text-sm mb-6">
            <Award className="w-5 h-5" />
            <span className="tracking-[0.3em] uppercase">Global Rankings / Hall of Fame</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-6 italic uppercase">Elite_Operators</h1>
          <p className="text-xl text-muted-foreground max-w-3xl font-medium leading-relaxed">
            The hierarchy of power. Track the progress of the world&apos;s most skilled security researchers as they compete for dominance.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex bg-htb-card border border-htb-border p-1 rounded-xl w-fit">
            <button
              onClick={() => setType('users')}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${
                type === 'users' ? 'bg-primary text-primary-foreground shadow-glow-green' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4" /> INDIVIDUALS
            </button>
            <button
              onClick={() => setType('teams')}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${
                type === 'teams' ? 'bg-primary text-primary-foreground shadow-glow-green' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="w-4 h-4" /> UNITS
            </button>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="LOCATE_OPERATOR_BY_NAME..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="htb-input pl-12 h-full min-h-[52px] bg-htb-card/50 border-htb-border"
            />
          </div>
        </div>

        {/* Regional Filter */}
        <div className="space-y-3 relative">
           <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
              <Globe className="w-3 h-3" /> Regional_Filter
           </div>
           
           <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setRegion('GLOBAL')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase border transition-all ${
                  region === 'GLOBAL' 
                    ? 'bg-primary/10 border-primary/50 text-primary' 
                    : 'bg-htb-card border-htb-border text-muted-foreground hover:border-primary/20 hover:text-foreground'
                }`}
              >
                <Globe className="w-3 h-3" /> Global
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase border transition-all ${
                    region !== 'GLOBAL' 
                      ? 'bg-primary/10 border-primary/50 text-primary' 
                      : 'bg-htb-card border-htb-border text-muted-foreground hover:border-primary/20 hover:text-foreground'
                  }`}
                >
                  {selectedCountryData ? (
                    <>
                      <img src={selectedCountryData.flags.svg} alt="" className="w-4 h-3 object-cover rounded-sm" />
                      {selectedCountryData.name.common}
                    </>
                  ) : (
                    <>
                      <Flag className="w-3 h-3" /> Filter_By_Country
                    </>
                  )}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-htb-card border border-htb-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-htb-border bg-muted/30">
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full bg-background border border-htb-border rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-primary/50"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {filteredCountries.map((c) => (
                        <button
                          key={c.cca2}
                          onClick={() => {
                            setRegion(c.cca2);
                            setShowCountryDropdown(false);
                            setCountrySearch('');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors text-left border-b border-htb-border/50 last:border-0"
                        >
                          <img src={c.flags.svg} alt="" className="w-4 h-3 object-cover rounded-sm" />
                          {c.name.common}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-primary font-mono text-xs tracking-widest animate-pulse">SYNCHRONIZING_RANKINGS...</p>
        </div>
      ) : (
        <div className="space-y-12 pb-20">
          {/* Top 3 Podium */}
          {topThree.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topThree.map((entry, index) => {
                const colors = [
                  { border: 'border-yellow-500/50', icon: 'text-yellow-500', glow: 'shadow-yellow-500/20', bg: 'bg-yellow-500/5' },
                  { border: 'border-slate-400/50', icon: 'text-slate-400', glow: 'shadow-slate-400/20', bg: 'bg-slate-400/5' },
                  { border: 'border-amber-700/50', icon: 'text-amber-700', glow: 'shadow-amber-700/20', bg: 'bg-amber-700/5' },
                ];
                const theme = colors[index];
                
                return (
                  <div key={entry.id} className={`htb-card p-0 overflow-hidden relative border-2 ${theme.border} ${theme.bg} ${theme.glow} shadow-2xl`}>
                    <div className="p-8 flex flex-col items-center text-center space-y-4">
                       <div className="relative">
                          <div className={`w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 ${theme.border} text-3xl font-black italic`}>
                             {(entry.username || entry.name || '?')[0].toUpperCase()}
                          </div>
                          <div className={`absolute -top-4 -right-2 ${theme.icon} rotate-12`}>
                             {index === 0 ? <Crown className="w-10 h-10 fill-current" /> : <Star className="w-10 h-10 fill-current" />}
                          </div>
                       </div>
                       
                       <div className="space-y-1">
                          <h3 className="text-2xl font-black tracking-tighter uppercase italic">{entry.username || entry.name}</h3>
                          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Rank #{index + 1} // {region}</div>
                       </div>

                       <div className="pt-4 w-full flex items-center justify-between border-t border-htb-border/50">
                          <div className="text-left">
                             <span className="block text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Score</span>
                             <span className="text-2xl font-black text-primary leading-none tracking-tighter">{entry.points}</span>
                          </div>
                          <div className="text-right">
                             <span className="block text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Status</span>
                             <span className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase italic">
                                <Activity className="w-3 h-3 animate-pulse" /> Elite
                             </span>
                          </div>
                       </div>
                    </div>
                    {/* Background number */}
                    <span className="absolute -bottom-10 -left-10 text-[120px] font-black text-white opacity-[0.03] italic leading-none pointer-events-none">
                      {index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 htb-card border-dashed bg-transparent">
               <Target className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
               <h2 className="text-xl font-bold mb-2 uppercase tracking-widest text-muted-foreground">Region_Clean</h2>
               <p className="text-sm text-muted-foreground/60">No operators matching your signature were detected in this region.</p>
            </div>
          )}

          {/* Ranking Table */}
          {others.length > 0 && (
            <div className="htb-card p-0 overflow-hidden border-htb-border">
              <div className="bg-secondary/50 border-b border-htb-border px-8 py-4 grid grid-cols-12 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                 <div className="col-span-1">Rank</div>
                 <div className="col-span-7 md:col-span-8">Operator</div>
                 <div className="col-span-4 md:col-span-3 text-right">Points / Weight</div>
              </div>
              
              <div className="divide-y divide-htb-border">
                {others.map((entry, index) => (
                  <div key={entry.id} className="px-8 py-5 grid grid-cols-12 items-center hover:bg-muted/30 transition-colors group">
                     <div className="col-span-1 text-lg font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors">
                        #{index + 4}
                     </div>
                     <div className="col-span-7 md:col-span-8 flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center border border-htb-border text-sm font-bold group-hover:border-primary/30 transition-colors">
                           {(entry.username || entry.name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                           <h4 className="font-bold text-base uppercase tracking-tight group-hover:text-primary transition-colors">
                             {entry.username || entry.name}
                           </h4>
                           <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                              <Activity className="w-3 h-3 text-primary/50" /> Fully_Active
                           </div>
                        </div>
                     </div>
                     <div className="col-span-4 md:col-span-3 text-right">
                        <span className="text-xl font-black tracking-tighter text-primary">{entry.points}</span>
                        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-2">PTS</span>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
