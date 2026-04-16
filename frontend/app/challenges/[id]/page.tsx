'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { challengeApi } from '@/lib/api';
import { useNotificationStore } from '@/lib/store';
import { getAssetUrl } from '@/lib/utils';
import {
  Download,
  Lock,
  CheckCircle2,
  Terminal,
  ArrowLeft,
  Shield,
  Activity,
  Award,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  Zap,
  KeyRound
} from 'lucide-react';

interface ChallengeDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  difficulty: string;
  points: number;
  solved: boolean;
  isDynamic?: boolean;
  userFlag?: string;
  dockerImage?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

const difficultyConfig: Record<string, { color: string, segments: number }> = {
  EASY: { color: 'bg-htb-green', segments: 1 },
  MEDIUM: { color: 'bg-warning', segments: 2 },
  HARD: { color: 'bg-orange-500', segments: 3 },
  EXPERT: { color: 'bg-error', segments: 4 },
};

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedFlag, setCopiedFlag] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const { data } = await challengeApi.getChallenge(params.id as string);
        setChallenge(data.challenge);
      } catch (error) {
        console.error('Failed to fetch challenge:', error);
        router.push('/challenges');
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await challengeApi.submitFlag(params.id as string, flag);

      if (data.correct) {
        addNotification({
          type: 'success',
          message: `EXPLOIT_SUCCESSFUL: +${data.points} points`,
        });
        setChallenge((prev) => (prev ? { ...prev, solved: true } : null));
        setFlag('');
      } else {
        addNotification({
          type: 'error',
          message: 'EXPLOIT_FAILED: INCORRECT_FLAG_HASH',
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'SYSTEM_ERROR: SUBMISSION_TIMEOUT',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 animate-in fade-in">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-mono text-xs tracking-widest animate-pulse">DECRYPTING_CHALLENGE_DATA...</p>
      </div>
    );
  }

  if (!challenge) return null;

  const diff = difficultyConfig[challenge.difficulty];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-mono text-xs tracking-widest uppercase"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        /root/return_to_labs
      </button>

      {/* Main Challenge Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-xl blur-lg opacity-50" />
        <div className="relative htb-card p-0 border-htb-border overflow-hidden">
          <div className="p-8 border-b border-htb-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center border border-htb-border shadow-inner">
                <Terminal className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
                  <Activity className="w-3 h-3" /> CATEGORY // {challenge.category}
                </div>
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">{challenge.title}</h1>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <span className="block text-4xl font-black text-primary leading-none tracking-tighter">{challenge.points}</span>
                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em]">Weight Points</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-htb-border">
            <div className="p-6 flex flex-col gap-3">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Complexity</div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${i <= diff.segments ? diff.color : 'bg-htb-border/30'}`}
                  />
                ))}
              </div>
              <span className={`text-[10px] font-bold font-mono ${diff.color.replace('bg-', 'text-')} uppercase`}>{challenge.difficulty}</span>
            </div>

            <div className="p-6 flex flex-col gap-3">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lab Status</div>
              <div className="flex items-center gap-2">
                {challenge.solved ? (
                  <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest bg-primary/10 px-3 py-1 rounded border border-primary/20">
                    <CheckCircle2 className="w-4 h-4" />
                    System Pwnd
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest bg-muted/20 px-3 py-1 rounded border border-htb-border">
                    <Activity className="w-4 h-4 animate-pulse" />
                    Active Node
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 flex flex-col gap-3">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Info</div>
              <div className="text-xs font-mono text-primary/80 truncate">
                ID: {challenge.id.slice(0, 8)}...<br />
                IP: 10.10.10.{Math.floor(Math.random() * 254) + 1}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Description & Assets */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-htb-card border border-htb-border rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-secondary/50 border-b border-htb-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="text-xs text-muted-foreground font-mono ml-2 tracking-widest">MISSION_BRIEFING.txt</span>
              </div>
              <Terminal className="w-4 h-4 text-primary opacity-50" />
            </div>
            <div className="p-8">
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-foreground/90 font-sans leading-relaxed text-lg">
                  {challenge.description}
                </div>
              </div>

              {challenge.attachmentUrl && (
                <div className="mt-8 pt-8 border-t border-htb-border">
                  <a
                    href={getAssetUrl(challenge.attachmentUrl)}
                    download={challenge.attachmentName}
                    className="htb-button-secondary inline-flex items-center gap-3 w-auto group shadow-glow-green"
                  >
                    <Download className="w-5 h-5 text-primary group-hover:animate-bounce" />
                    DOWNLOAD_ASSETS
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flag Submission */}
        <div className="space-y-6">

          {/* Dynamic Flag Display — only shown for dynamic challenges */}
          {challenge.isDynamic && challenge.userFlag && (
            <div className="htb-card border-primary/30 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Animated top border */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />

              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 relative">
                  <KeyRound className="w-5 h-5 text-primary" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold tracking-tight uppercase text-sm flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    Your_Unique_Flag
                  </h3>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                    Dynamic_Flag_Protocol // Unique Per Operator
                  </p>
                </div>
              </div>

              {/* Terminal flag display */}
              <div className="bg-black/60 rounded-xl border border-primary/15 overflow-hidden mb-4">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-primary/10 bg-primary/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-[9px] font-mono text-primary/40 uppercase tracking-widest">
                    operator_flag.txt
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between gap-3 group">
                  <code className="font-mono text-sm text-primary font-bold tracking-wider flex-1 break-all">
                    {challenge.userFlag}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(challenge.userFlag!);
                      setFlag(challenge.userFlag!);
                      setCopiedFlag(true);
                      setTimeout(() => setCopiedFlag(false), 2000);
                    }}
                    title="Copy flag to clipboard"
                    className="flex-shrink-0 p-2.5 rounded-lg border transition-all duration-200
                      border-primary/20 bg-primary/5 text-primary/60
                      hover:bg-primary/20 hover:border-primary/50 hover:text-primary
                      active:scale-95"
                  >
                    {copiedFlag
                      ? <Check className="w-4 h-4 text-primary" />
                      : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider leading-relaxed">
                ⚡ This flag is cryptographically derived from your operator ID. Sharing it will not help others — their flag is different.
              </p>
            </div>
          )}

          <div className="htb-card border-primary/20 bg-primary/5 shadow-glow-green">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-glow-green">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold tracking-tight uppercase">Submit_Flag</h3>
            </div>

            {challenge.solved ? (
              <div className="p-6 bg-primary/10 border border-primary/20 rounded-xl space-y-4 text-center">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto shadow-glow-green-lg">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-primary font-black text-xl italic uppercase tracking-tighter">EXPLOIT_RESOLVED</h4>
                  <p className="text-[10px] text-primary/80 font-mono tracking-widest uppercase">Points successfully credited</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Lock className="w-3 h-3 text-primary" /> FLAG_HASH
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                      placeholder="HTB{fL4g_h3r3}"
                      className="htb-input h-14 pl-6 text-lg tracking-wider"
                      disabled={submitting}
                    />
                    <div className="absolute inset-0 rounded-lg bg-primary opacity-0 group-focus-within:opacity-5 transition-opacity pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !flag.trim()}
                  className="w-full htb-button-primary h-14 text-base relative group overflow-hidden"
                >
                  {submitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      DEPLOY_EXPLOIT <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="htb-card bg-htb-card/50">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4">
              <Shield className="w-4 h-4 text-muted-foreground" /> Engagement_Rules
            </div>
            <ul className="space-y-3">
              {[
                'Bypassing submission limits is prohibited',
                'Flag sharing is not allowed',
                'Respect the infrastructure'
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground font-mono uppercase tracking-tight">
                  <span className="text-primary mt-0.5 tracking-tighter">0{i + 1}</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
