'use client';

import { useEffect, useState } from 'react';
import {
  Trophy,
  ChevronRight,
  Flag,
  Globe,
  Award,
  Zap,
  Activity,
  Loader2,
  Clock,
  Layers,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { ctfApi } from '@/lib/api';

interface CtfEvent {
  id: string;
  title: string;
  description: string;
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
  prize?: string;
  difficulty: string;
  startTime: string;
  endTime: string;
  bannerUrl?: string;
}

export default function CTFEventsPage() {
  const [events, setEvents] = useState<CtfEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await ctfApi.getEvents();
        setEvents(data.events);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getEventIcon = (index: number) => {
    const icons = [Globe, Award, Zap, Trophy];
    return icons[index % icons.length];
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-2 lg:px-4">
      {/* CTF Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-transparent rounded-2xl blur-xl opacity-50" />
        <div className="relative bg-htb-card border border-htb-border rounded-2xl p-8 sm:p-10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Trophy className="w-48 h-48 text-primary" />
          </div>
          <div className="flex items-center gap-3 text-primary font-mono text-sm mb-6">
            <Flag className="w-5 h-5" />
            <span className="tracking-[0.3em] uppercase">Competitions / Operations</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-6 italic uppercase text-primary">Global_Warfare</h1>
          <p className="text-xl text-muted-foreground max-w-3xl font-medium leading-relaxed">
            High-intensity time-limited hacking competitions. Join active engagements, solve exclusive challenges, and compete for prestige.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-8 bg-primary rounded-full shadow-glow-green" />
          <h2 className="text-lg font-black italic tracking-tighter uppercase">Active_Operations</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-primary font-mono text-xs tracking-widest animate-pulse">INTERCEPTING_SIGNAL_DATA...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
            {events.map((event, i) => {
              const Icon = getEventIcon(i);
              const IsLive = event.status === 'LIVE';

              return (
                <Link key={event.id} href={`/ctf/${event.id}`} className={`htb-card group relative p-0 overflow-hidden flex flex-col transition-all duration-300 hover:ring-1 hover:translate-y-[-2px] shadow-xl ${IsLive ? 'hover:ring-primary/40' : 'hover:ring-blue-500/40 opacity-90'}`}>
                  {/* Header Visual Area */}
                  <div className={`h-40 relative flex items-center justify-center overflow-hidden border-b border-htb-border ${IsLive ? 'bg-primary/5' : 'bg-blue-500/5'}`}>
                    <div className={`absolute top-0 left-0 w-full h-1 z-20 ${IsLive ? 'bg-primary shadow-glow-green animate-pulse' : 'bg-blue-500'}`} />

                    {event.bannerUrl ? (
                      <img
                        src={event.bannerUrl}
                        alt={event.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-htb-border group-hover:scale-110 transition-transform duration-500 shadow-2xl relative z-10 bg-[#0d0e12]">
                        <Icon className={`w-8 h-8 ${IsLive ? 'text-primary' : 'text-blue-500'}`} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Trophy className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-[0.03] rotate-12 ${IsLive ? 'text-primary' : 'text-blue-500'} z-0`} />
                  </div>

                  {/* Body Area */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold text-base uppercase tracking-tight transition-colors mb-1 italic truncate ${IsLive ? 'group-hover:text-primary' : 'group-hover:text-blue-500'}`}>
                        {event.title}
                      </h3>
                      {IsLive && <Activity className="w-4 h-4 text-primary animate-pulse shrink-0" />}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${IsLive ? 'text-primary' : 'text-blue-400'}`}>
                        {event.status}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                      <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                        {event.difficulty}
                      </span>
                    </div>

                    <p className="text-[10px] text-muted-foreground line-clamp-2 mb-4 font-medium leading-relaxed uppercase opacity-60">
                      {event.description}
                    </p>

                    <div className="space-y-2 mt-auto">
                      <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground uppercase tracking-tighter">
                        <span>Timeline</span>
                        <span className={IsLive ? 'text-primary' : ''}>{IsLive ? 'LIVE_NOW' : 'SCHEDULED'}</span>
                      </div>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${IsLive ? 'bg-primary animate-pulse' : 'bg-blue-500'} transition-all duration-1000`} style={{ width: IsLive ? '100%' : '0%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Footer Area */}
                  <div className="px-5 py-4 bg-muted/10 border-t border-htb-border flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-foreground leading-none tracking-tighter">{event.prize || 'PRO_V'}</span>
                      <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Rewards</span>
                    </div>
                    <div className={`text-[9px] font-bold hover:underline uppercase tracking-[0.2em] flex items-center gap-1 group-hover:gap-2 transition-all ${IsLive ? 'text-primary' : 'text-blue-500'}`}>
                      {IsLive ? 'JOIN_OPS' : 'PRE_REG'} <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 htb-card border-dashed bg-transparent opacity-50">
            <Trophy className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
            <h2 className="text-xl font-bold mb-2 uppercase tracking-widest text-muted-foreground">No_Operations_Logged</h2>
            <p className="text-[10px] font-mono uppercase">Competition schedule is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
