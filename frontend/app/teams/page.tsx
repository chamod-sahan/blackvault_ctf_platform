'use client';

import { useEffect, useState } from 'react';
import { teamApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useNotificationStore } from '@/lib/store';
import {
  Users,
  Plus,
  LogIn,
  Crown,
  Shield,
  X,
  ChevronRight,
  Terminal,
  Swords,
  Search,
  Star,
  Trophy,
  UserPlus,
  Hash,
  AlertTriangle,
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  totalPoints?: number;
  members: {
    id: string;
    role: string;
    user: {
      id: string;
      username: string;
      points: number;
    };
  }[];
}

interface MyTeam extends Team {
  role: string;
}

export default function TeamsPage() {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<MyTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [joinTeamId, setJoinTeamId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const [{ data: teamsData }, { data: myTeamData }] = await Promise.all([
        teamApi.getTeams(),
        teamApi.getMyTeam().catch(() => ({ data: { team: null } })),
      ]);
      setTeams(teamsData.teams);
      if (myTeamData.team) {
        setMyTeam({ ...myTeamData.team, role: myTeamData.team.members?.[0]?.role || 'MEMBER' });
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await teamApi.createTeam(teamName);
      addNotification({ type: 'success', message: 'Team created successfully!' });
      setShowCreate(false);
      setTeamName('');
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      addNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to create team',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await teamApi.joinTeam(joinTeamId);
      addNotification({ type: 'success', message: 'Successfully joined team!' });
      setShowJoin(false);
      setJoinTeamId('');
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      addNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to join team',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeave = async () => {
    try {
      await teamApi.leaveTeam();
      addNotification({ type: 'success', message: 'You have left the team' });
      setMyTeam(null);
      setShowLeaveConfirm(false);
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      addNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to leave team',
      });
    }
  };

  const filteredTeams = teams
    .filter((t) => !myTeam || t.id !== myTeam.id)
    .filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-primary/20 rounded-full animate-ping absolute inset-0" />
          <div className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-primary font-mono text-xs tracking-widest animate-pulse uppercase mt-4">
          LOADING_OPERATOR_SQUADS...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pt-12 pb-32 px-6 lg:px-12 max-w-[1440px] mx-auto">
      {/* ── Page Header (Tactical Command) ─────────────────────────────────── */}
      <div className="relative border-b border-htb-border/50 pb-12 overflow-hidden">
        {/* Abstract background decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/2 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 text-primary font-mono text-xs mb-4 tracking-widest bg-primary/5 border border-primary/10 w-fit px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              SQUAD_REGISTRY_V2.0.4
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-4 uppercase italic leading-none">
              SQUAD<span className="text-primary not-italic">_</span>NETWORK
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-muted-foreground font-medium">
              <p className="max-w-xl text-lg leading-relaxed">
                Forge alliances with elite operators. Coordinate strikes, share intel, and dominate the digital battlefield.
              </p>
              
              <div className="flex gap-6 border-l border-htb-border pl-8 py-2 hidden sm:flex">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1">Active_Units</div>
                  <div className="text-2xl font-black text-foreground italic">{teams.length}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1">Global_Ops</div>
                  <div className="text-2xl font-black text-foreground italic">{teams.reduce((acc, t) => acc + t.members.length, 0)}</div>
                </div>
              </div>
            </div>
          </div>

          {!myTeam && (
            <div className="flex items-center gap-4 flex-shrink-0 mb-2">
              <button
                id="join-team-btn"
                onClick={() => setShowJoin(true)}
                className="htb-button-secondary group relative overflow-hidden px-8 py-4 border-htb-border hover:border-primary/50 transition-all"
              >
                <div className="relative z-10 flex items-center gap-3">
                  <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-bold">SIGN_IN SQUAD</span>
                </div>
              </button>
              
              <button
                id="create-team-btn"
                onClick={() => setShowCreate(true)}
                className="htb-button-primary group relative overflow-hidden px-8 py-4 shadow-glow-green hover:shadow-glow-green-lg transition-all"
              >
                <div className="relative z-10 flex items-center gap-3">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="font-bold">DEPLOY_NEW_UNIT</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── My Team: Tactical Dashboard ──────────────────────────────────── */}
      {myTeam && (
        <div className="animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.4em] flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-lg border border-primary/10">
              <Shield className="w-4 h-4" /> 
              ACTIVE_COMM_LINK: <span className="text-foreground">{myTeam.name.toUpperCase()}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Team Identity & Stats */}
            <div className="lg:col-span-4 space-y-6">
              <div className="htb-card bg-secondary/30 border-primary/20 p-8 h-full flex flex-col justify-between relative group">
                {/* Visual Glitch Accent */}
                <div className="absolute top-4 right-4 text-[10px] font-mono text-primary/30 select-none">ID://{myTeam.id.slice(0,8)}</div>
                
                <div>
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-glow-green relative">
                      <Swords className="w-10 h-10 text-primary" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background border border-primary/20 rounded-lg flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-2">
                        {myTeam.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        {myTeam.role === 'LEADER' ? (
                          <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded uppercase">
                            <Crown className="w-3 h-3" /> SQUAD_LEADER
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-primary/60 bg-primary/5 border border-primary/10 px-2 py-0.5 rounded uppercase">
                            <Shield className="w-3 h-3" /> OPERATIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-background/50 border border-htb-border">
                      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">SQUAD_CREDITS</p>
                      <p className="text-3xl font-black text-primary italic tracking-tight">
                        {myTeam.totalPoints ?? 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-background/50 border border-htb-border">
                      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">OPERATIVES</p>
                      <p className="text-3xl font-black text-foreground italic tracking-tight">
                        {myTeam.members.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2 border-b border-htb-border pb-2">
                    <Terminal className="w-3 h-3" /> SQUAD_ACTIONS
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setShowLeaveConfirm(true)}
                      className="w-full htb-button bg-error/5 hover:bg-error/10 text-error/80 hover:text-error border border-error/10 hover:border-error/30 text-xs py-3 transition-all rounded-xl font-bold"
                    >
                      TERMINATE_CONNECTION
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Member Manifest */}
            <div className="lg:col-span-8">
              <div className="htb-card bg-background/20 border-htb-border/50 p-6 h-full">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-htb-border/50">
                  <h3 className="text-sm font-mono font-bold text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                    <Users className="w-4 h-4" /> OPERATOR_MANIFEST
                  </h3>
                  <div className="text-[10px] font-mono text-muted-foreground/50 italic">
                    SYNC_STATUS: 100% OK
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[360px] pr-2 custom-scrollbar">
                  {myTeam.members.sort((a,b) => b.user.points - a.user.points).map((member, idx) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-htb-border hover:border-primary/30 hover:bg-primary/5 transition-all group/member relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover/member:opacity-100 transition-opacity" />
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-background border border-htb-border flex items-center justify-center text-[10px] font-black font-mono text-muted-foreground group-hover/member:text-primary transition-colors">
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold tracking-tight text-foreground group-hover/member:text-primary transition-colors">
                              {member.user.username}
                            </span>
                            {member.user.id === user?.id && (
                              <span className="text-[9px] font-mono text-primary/60 border border-primary/20 px-1.5 rounded uppercase">SELF</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {member.role === 'LEADER' && (
                              <span className="flex items-center gap-1 text-[8px] font-mono font-bold text-yellow-400/80 uppercase">
                                <Crown className="w-2.5 h-2.5" /> Lead
                              </span>
                            )}
                            <span className="text-[8px] font-mono text-muted-foreground/60 uppercase">
                              Active_Now
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right relative z-10">
                        <p className="text-[8px] font-mono text-muted-foreground/50 uppercase mb-0.5">Credits</p>
                        <p className="text-lg font-black font-mono text-primary italic leading-none">
                          {member.user.points.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── All Squads: Global Registry ───────────────────────────────────── */}
      <div className="pt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-htb-border/30">
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase italic flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" /> GLOBAL_REGISTRY
            </h2>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-1">
              SCANNING_ENCRYPTED_SIGNATURES... {filteredTeams.length} UNITS_DETECTED
            </p>
          </div>

          {/* Tactical Search */}
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-0 bg-primary/5 rounded-xl blur-lg group-focus-within:bg-primary/10 transition-all" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
            <input
              type="text"
              placeholder="FILTER_BY_DESIGNATION..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="htb-input pl-11 py-4 text-xs font-mono tracking-widest relative z-10 bg-background/80 backdrop-blur-sm border-htb-border/50 focus:border-primary/50 transition-all rounded-xl"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">
              [CMD+F]
            </div>
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="htb-card py-32 flex flex-col items-center justify-center text-center bg-secondary/10 border-dashed border-htb-border/50">
            <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-muted-foreground/20" />
            </div>
            <p className="font-mono text-sm text-muted-foreground uppercase tracking-[0.3em]">
              {searchQuery ? 'NO_MATCHING_SIGNATURES_FOUND' : 'ZERO_ACTIVE_UNITS_DETECTED'}
            </p>
            {!myTeam && !searchQuery && (
              <button
                onClick={() => setShowCreate(true)}
                className="htb-button-primary mt-10 px-10"
              >
                <Plus className="w-5 h-5" /> INITIALIZE_FIRST_UNIT
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTeams.map((team) => {
              const topMember = team.members.reduce(
                (best, m) => (m.user.points > (best?.user.points ?? 0) ? m : best),
                team.members[0]
              );
              return (
                <div
                  key={team.id}
                  className="htb-card group relative flex flex-col gap-6 p-7 hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-500 bg-secondary/20 overflow-hidden"
                >
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -translate-y-1/2 translate-x-1/2 rotate-45 group-hover:bg-primary/10 transition-colors" />
                  
                  {/* Team Designation */}
                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-background border border-htb-border group-hover:border-primary/30 group-hover:shadow-glow-green transition-all flex items-center justify-center flex-shrink-0">
                        <Shield className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl tracking-tighter group-hover:text-primary transition-colors uppercase italic leading-tight">
                          {team.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 uppercase tracking-tighter">
                            {team.members.length} OPERATIVES
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-tighter">
                            Active_Sec
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-0.5">SCORE</p>
                      <p className="text-2xl font-black text-primary tracking-tighter italic leading-none">
                        {(team.totalPoints ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Operative Roster Preview */}
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-htb-border/30 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {team.members.slice(0, 4).map((m) => (
                          <div
                            key={m.id}
                            className="w-8 h-8 rounded-lg bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-black uppercase text-muted-foreground group-hover:border-primary/20 transition-colors"
                            title={m.user.username}
                          >
                            {m.user.username.charAt(0)}
                          </div>
                        ))}
                        {team.members.length > 4 && (
                          <div className="w-8 h-8 rounded-lg bg-muted border-2 border-background flex items-center justify-center text-[10px] font-black text-muted-foreground group-hover:border-primary/20 transition-colors">
                            +{team.members.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {topMember && (
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-1">Top_Operator</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground">
                          <Star className="w-3 h-3 text-yellow-400 group-hover:animate-spin transition-all" />
                          {topMember.user.username}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deployment Trigger */}
                  {!myTeam && (
                    <button
                      onClick={async () => {
                        try {
                          await teamApi.joinTeam(team.id);
                          addNotification({ type: 'success', message: `Successfully deployed to ${team.name}!` });
                          fetchData();
                        } catch (error: unknown) {
                          const err = error as { response?: { data?: { error?: string } } };
                          addNotification({
                            type: 'error',
                            message: err.response?.data?.error || 'DEPLOIMENT_FAILURE',
                          });
                        }
                      }}
                      className="htb-button-secondary w-full py-4 flex items-center justify-center gap-3 text-xs font-bold mt-auto group/btn transition-all hover:bg-primary/10 hover:border-primary/30 relative overflow-hidden"
                    >
                      <UserPlus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      REQUEST_DEPLOYMENT
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
                    </button>
                  )}
                  
                  {/* Subtle background designation ID */}
                  <div className="absolute -bottom-2 -left-2 text-[40px] font-black italic text-foreground/[0.03] select-none pointer-events-none uppercase">
                    {team.name.slice(0, 3)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Team Modal: Deployment ────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div
            className="htb-card border-primary/30 max-w-lg w-full relative overflow-hidden shadow-2xl shadow-primary/5 animate-in zoom-in-95 duration-300 bg-card/95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top scanning line animation */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-primary animate-pulse shadow-[0_0_15px_rgba(159,239,0,0.8)] z-20" />
            
            <div className="p-8">
              {/* Header */}
              <div className="mb-8 relative">
                <div className="flex items-center gap-3 text-primary font-mono text-[10px] mb-4 tracking-[0.3em] bg-primary/5 w-fit px-3 py-1 rounded border border-primary/10">
                  <Terminal className="w-4 h-4" />
                  <span>SQUAD_INIT_PROTOCOL_V4</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-3">
                  INITIALIZE_UNIT
                </h2>
                <div className="h-1 w-20 bg-primary mb-4" />
                <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
                  Register a new tactical designation in the global registry and recruit elite operators.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    DESIGNATION_NAME
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-primary/5 rounded-xl blur group-focus-within:bg-primary/10 transition-all" />
                    <input
                      id="create-team-name-input"
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="ENTER_SQUAD_NAME..."
                      className="htb-input py-5 text-base font-bold tracking-tight relative z-10 bg-background/50 border-htb-border/50 focus:border-primary/50 transition-all rounded-xl"
                      maxLength={32}
                      required
                      autoFocus
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground/30 z-10">
                      {teamName.length}/32
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); setTeamName(''); }}
                    className="flex-1 htb-button-secondary py-5 rounded-xl border-erb-border/50 hover:bg-error/5 hover:text-error hover:border-error/20 transition-all font-bold"
                  >
                    ABORT
                  </button>
                  <button
                    id="create-team-submit-btn"
                    type="submit"
                    disabled={submitting || !teamName.trim()}
                    className="flex-[2] htb-button-primary py-5 rounded-xl shadow-glow-green hover:shadow-glow-green-lg transition-all font-black text-base italic"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-3 justify-center">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        INITIALIZING...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3 justify-center">
                        <Plus className="w-5 h-5" />
                        DEPLOY_UNIT
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Bottom visual accent */}
            <div className="h-1.5 w-full bg-primary/5 flex items-center px-8 gap-1">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="h-[2px] w-full bg-primary/10 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Join Team Modal: Access ──────────────────────────────────────── */}
      {showJoin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div
            className="htb-card border-primary/30 max-w-lg w-full relative overflow-hidden shadow-2xl shadow-primary/5 animate-in zoom-in-95 duration-300 bg-card/95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-primary animate-pulse shadow-[0_0_15px_rgba(159,239,0,0.8)] z-20" />

            <div className="p-8">
              {/* Header */}
              <div className="mb-8 relative">
                <div className="flex items-center gap-3 text-primary font-mono text-[10px] mb-4 tracking-[0.3em] bg-primary/5 w-fit px-3 py-1 rounded border border-primary/10">
                  <Terminal className="w-4 h-4" />
                  <span>ACCESS_OVERRIDE_AUTH</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-3">
                  JOIN_UNIT
                </h2>
                <div className="h-1 w-20 bg-primary mb-4" />
                <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
                  Enter a valid squad signature ID to request deployment to an existing unit.
                </p>
              </div>

              <form onSubmit={handleJoin} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    UNIT_SIGNATURE_ID
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-primary/5 rounded-xl blur group-focus-within:bg-primary/10 transition-all" />
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50 group-focus-within:text-primary transition-colors z-10" />
                    <input
                      id="join-team-id-input"
                      type="text"
                      value={joinTeamId}
                      onChange={(e) => setJoinTeamId(e.target.value)}
                      placeholder="PASTE_SIGNATURE_HASH..."
                      className="htb-input pl-12 py-5 text-base font-mono relative z-10 bg-background/50 border-htb-border/50 focus:border-primary/50 transition-all rounded-xl"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowJoin(false); setJoinTeamId(''); }}
                    className="flex-1 htb-button-secondary py-5 rounded-xl border-erb-border/50 hover:bg-error/5 hover:text-error hover:border-error/20 transition-all font-bold"
                  >
                    ABORT
                  </button>
                  <button
                    id="join-team-submit-btn"
                    type="submit"
                    disabled={submitting || !joinTeamId.trim()}
                    className="flex-[2] htb-button-primary py-5 rounded-xl shadow-glow-green hover:shadow-glow-green-lg transition-all font-black text-base italic"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-3 justify-center">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        AUTHENTICATING...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3 justify-center">
                        <LogIn className="w-5 h-5" />
                        ACCESS_SQUAD
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Leave Confirm Modal: Termination ──────────────────────────────── */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div
            className="htb-card border-error/50 max-w-md w-full relative overflow-hidden shadow-2xl shadow-error/10 animate-in zoom-in-95 duration-300 bg-card/95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning scanning line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-error animate-pulse shadow-[0_0_15px_rgba(255,75,75,0.8)] z-20" />

            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-error/10 border border-error/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,75,75,0.1)] relative">
                <AlertTriangle className="w-10 h-10 text-error" />
                <div className="absolute inset-0 rounded-3xl animate-ping border border-error/20 opacity-20" />
              </div>
              
              <div className="space-y-4 mb-10">
                <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none animate-pulse text-error">
                  WARNING_ABANDONMENT
                </h2>
                <div className="h-1 w-20 bg-error mx-auto" />
                <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                  Are you absolutely certain you want to terminate your connection with <span className="text-primary font-black uppercase italic">{myTeam?.name}</span>?
                </p>
                <div className="p-4 rounded-xl bg-error/5 border border-error/10 text-xs font-mono text-error/70 tracking-tighter">
                  SIGNAL_LOSS_IS_IRREVERSIBLE
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 htb-button-secondary py-5 rounded-xl border-erb-border/50 hover:bg-foreground/5 transition-all font-bold"
                >
                  STAY_SYNCED
                </button>
                <button
                  id="confirm-leave-btn"
                  onClick={handleLeave}
                  className="flex-1 htb-button bg-error/10 hover:bg-error/20 text-error border border-error/30 hover:shadow-[0_0_20px_rgba(255,75,75,0.2)] py-5 rounded-xl transition-all font-black text-sm italic"
                >
                  ABANDON_UNIT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
