'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ctfApi, teamApi } from '@/lib/api';
import {
    Trophy,
    Calendar,
    Clock,
    Award,
    ChevronLeft,
    Activity,
    Globe,
    ShieldCheck,
    Zap,
    Loader2,
    Share2,
    Twitter,
    Linkedin,
    Facebook,
    Link as LinkIcon,
    User,
    Users as UsersIcon,
    CheckCircle2
} from 'lucide-react';
import { useNotificationStore, useAuthStore } from '@/lib/store';

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

export default function CtfDetailClient() {
    const { id } = useParams();
    const router = useRouter();
    const { addNotification } = useNotificationStore();
    const { user } = useAuthStore();
    const [event, setEvent] = useState<CtfEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState<{ isRegistered: boolean; type: string | null; registration?: any } | null>(null);
    const [myTeams, setMyTeams] = useState<any[]>([]);
    const [showRegModal, setShowRegModal] = useState(false);
    const [regType, setRegType] = useState<'SOLO' | 'TEAM'>('SOLO');
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data } = await ctfApi.getEvents();
                const found = data.events.find((e: CtfEvent) => e.id === id);
                if (found) {
                    setEvent(found);
                    // Fetch registration status if logged in
                    if (user) {
                        try {
                            const [statusRes, teamsRes] = await Promise.all([
                                ctfApi.getRegistrationStatus(id as string),
                                teamApi.getMyTeam().catch(() => ({ data: { team: null } }))
                            ]);
                            setRegistrationStatus(statusRes.data);
                            if (teamsRes.data?.team) {
                                setMyTeams([teamsRes.data.team]);
                                setSelectedTeamId(teamsRes.data.team.id);
                            }
                        } catch (err) {
                            console.error('Failed to fetch user data:', err);
                        }
                    }
                } else {
                    addNotification({ type: 'error', message: 'EVENT_NOT_FOUND: Registry record missing.' });
                    router.push('/ctf');
                }
            } catch (error) {
                console.error('Failed to fetch event:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id, router, addNotification, user]);

    const handleRegister = async () => {
        if (!user) {
            addNotification({ type: 'error', message: 'AUTHENTICATION_REQUIRED: Access denied.' });
            return;
        }

        try {
            setRegistering(true);
            await ctfApi.register(id as string, {
                type: regType,
                teamId: regType === 'TEAM' ? selectedTeamId : undefined
            });
            addNotification({ type: 'success', message: 'REGISTRATION_SUCCESSFUL: Entry record created.' });
            setShowRegModal(false);
            // Refresh status
            const statusRes = await ctfApi.getRegistrationStatus(id as string);
            setRegistrationStatus(statusRes.data);
        } catch (error: any) {
            addNotification({
                type: 'error',
                message: error.response?.data?.error || 'REGISTRATION_FAILED: System rejection.'
            });
        } finally {
            setRegistering(false);
        }
    };

    const shareOnSocial = (platform: string) => {
        if (!event) return;
        const url = window.location.href;
        const text = `Join the ${event.title} CTF event! Prize: ${event.prize || 'Glory'}. Difficulty: ${event.difficulty}`;

        let shareUrl = '';
        switch (platform) {
            case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`; break;
            case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
            case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`; break;
            case 'copy':
                navigator.clipboard.writeText(`${text}\n${url}`);
                addNotification({ type: 'info', message: 'LINK_COPIED: Registry path saved to clipboard.' });
                return;
        }
        if (shareUrl) window.open(shareUrl, '_blank', 'noreferrer');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-primary font-mono text-xs tracking-widest animate-pulse">DECRYPTING_EVENT_DATA...</p>
            </div>
        );
    }

    if (!event) return null;

    const isActive = event.status === 'LIVE';

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
            {/* Navigation */}
            <button
                onClick={() => router.push('/ctf')}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-mono text-xs uppercase tracking-widest group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back_To_Operations
            </button>

            {/* Main Header Card */}
            <div className="htb-card p-0 overflow-hidden border-htb-border shadow-2xl bg-htb-card">
                {/* Banner Area */}
                <div className="relative h-[300px] md:h-[450px] w-full bg-muted/10 overflow-hidden">
                    {event.bannerUrl ? (
                        <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-transparent">
                            <Trophy className="w-32 h-32 text-primary/10" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e12] via-[#0d0e12]/40 to-transparent" />

                    <div className="absolute bottom-8 left-8 right-8">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${isActive ? 'bg-primary/20 border-primary text-primary animate-pulse' : 'bg-muted border-htb-border text-muted-foreground'}`}>
                                Status: {event.status}
                            </span>
                            <span className="px-3 py-1 rounded border border-htb-border bg-black/40 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                Difficulty: {event.difficulty}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white drop-shadow-2xl">
                            {event.title}
                        </h1>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-htb-border">
                    <div className="p-8 space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Calendar className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Activation_Window</span>
                        </div>
                        <p className="font-mono text-sm uppercase">{new Date(event.startTime).toLocaleString()}</p>
                    </div>
                    <div className="p-8 space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Clock className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Termination_Window</span>
                        </div>
                        <p className="font-mono text-sm uppercase">{new Date(event.endTime).toLocaleString()}</p>
                    </div>
                    <div className="p-8 space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Award className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reward_Pool</span>
                        </div>
                        <p className="text-2xl font-black italic tracking-tighter text-white uppercase">{event.prize || 'PRO_V'}</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="htb-card p-8 bg-htb-card border-htb-border">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3 text-primary">
                            <ShieldCheck className="w-6 h-6" /> Mission_Briefing
                        </h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="htb-card p-6 bg-htb-card border-htb-border flex items-center gap-4 group hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                <Globe className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-tighter text-xs text-muted-foreground">Engagement_Scope</h4>
                                <p className="font-bold text-white uppercase italic">Global Access</p>
                            </div>
                        </div>
                        <div className="htb-card p-6 bg-htb-card border-htb-border flex items-center gap-4 group hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-tighter text-xs text-muted-foreground">Operation_Type</h4>
                                <p className="font-bold text-white uppercase italic">Capture The Flag</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="htb-card p-8 bg-htb-card border-htb-border">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-primary">Mission_Status</h3>
                        {registrationStatus?.isRegistered ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="font-black uppercase tracking-tighter text-xs text-primary">Registered_As</p>
                                        <p className="font-bold text-white uppercase italic text-[10px]">
                                            {registrationStatus.type === 'SOLO' ? 'Solo Operator' : `Team: ${registrationStatus.registration?.team?.name || 'Unit'}`}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className={`w-full py-6 rounded-xl font-black uppercase italic tracking-[0.2em] shadow-2xl transition-all ${isActive ? 'bg-primary text-black hover:bg-primary/90 shadow-primary/20' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                                    disabled={!isActive}
                                >
                                    {isActive ? 'Deploy_To_Engagement' : 'Awaiting_Activation'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-xs text-muted-foreground font-mono uppercase leading-relaxed">
                                    Registration is required for engagement participation and reward eligibility.
                                </p>
                                <button
                                    onClick={() => setShowRegModal(true)}
                                    className="w-full py-6 bg-primary text-black rounded-xl font-black uppercase italic tracking-[0.2em] hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all font-bold"
                                >
                                    Initialize_Registration
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="htb-card p-8 bg-htb-card border-htb-border">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-primary">Broadcasting_Unit</h3>
                        <div className="space-y-4">
                            <button
                                onClick={() => shareOnSocial('twitter')}
                                className="w-full flex items-center gap-4 p-4 bg-muted/5 border border-htb-border rounded-xl hover:bg-blue-400/10 hover:border-blue-400/50 transition-all group"
                            >
                                <Twitter className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                <span className="font-bold uppercase tracking-widest text-[10px]">Share to Twitter</span>
                            </button>
                            <button
                                onClick={() => shareOnSocial('linkedin')}
                                className="w-full flex items-center gap-4 p-4 bg-muted/5 border border-htb-border rounded-xl hover:bg-blue-600/10 hover:border-blue-600/50 transition-all group"
                            >
                                <Linkedin className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                                <span className="font-bold uppercase tracking-widest text-[10px]">Share to LinkedIn</span>
                            </button>
                            <button
                                onClick={() => shareOnSocial('facebook')}
                                className="w-full flex items-center gap-4 p-4 bg-muted/5 border border-htb-border rounded-xl hover:bg-blue-500/10 hover:border-blue-500/50 transition-all group"
                            >
                                <Facebook className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                <span className="font-bold uppercase tracking-widest text-[10px]">Share to Facebook</span>
                            </button>
                            <button
                                onClick={() => shareOnSocial('copy')}
                                className="w-full flex items-center gap-4 p-4 bg-muted/5 border border-htb-border rounded-xl hover:bg-primary/10 hover:border-primary/50 transition-all group"
                            >
                                <LinkIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                <span className="font-bold uppercase tracking-widest text-[10px]">Copy Deployment URL</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Modal */}
            {showRegModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="htb-card max-w-md w-full bg-htb-card border-htb-border p-8 animate-in zoom-in-95 duration-200 shadow-2xl shadow-primary/10">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-white">Entry_Protocol</h2>
                        <p className="text-muted-foreground font-mono text-[10px] mb-8 uppercase tracking-widest">Select participation mode for {event.title}</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button
                                onClick={() => setRegType('SOLO')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${regType === 'SOLO' ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/5 border-htb-border text-muted-foreground hover:border-muted-foreground/50'}`}
                            >
                                <User className="w-6 h-6" />
                                <span className="font-black uppercase tracking-tighter text-[10px]">Solo_Operator</span>
                            </button>
                            <button
                                onClick={() => setRegType('TEAM')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${regType === 'TEAM' ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/5 border-htb-border text-muted-foreground hover:border-muted-foreground/50'}`}
                            >
                                <UsersIcon className="w-6 h-6" />
                                <span className="font-black uppercase tracking-tighter text-[10px]">Team_Unit</span>
                            </button>
                        </div>

                        {regType === 'TEAM' && (
                            <div className="space-y-2 mb-8 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select_Team</label>
                                {myTeams.length > 0 ? (
                                    <select
                                        value={selectedTeamId}
                                        onChange={(e) => setSelectedTeamId(e.target.value)}
                                        className="w-full bg-black/50 border border-htb-border rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-colors text-white"
                                    >
                                        {myTeams.map(team => (
                                            <option key={team.id} value={team.id}>{team.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">No_Active_Teams_Found</p>
                                        <button
                                            onClick={() => router.push('/teams')}
                                            className="text-[10px] text-white underline mt-1 uppercase hover:text-primary transition-colors"
                                        >
                                            Create_A_Team
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowRegModal(false)}
                                className="flex-1 py-4 border border-htb-border rounded-xl font-black uppercase italic tracking-widest text-[10px] hover:bg-muted/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRegister}
                                disabled={registering || (regType === 'TEAM' && !selectedTeamId)}
                                className="flex-1 py-4 bg-primary text-black rounded-xl font-black uppercase italic tracking-widest text-[10px] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {registering ? 'Processing...' : 'Confirm_Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
