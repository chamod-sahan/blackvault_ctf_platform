'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Shield, User, Mail, Lock, ChevronRight, AlertCircle, Loader2, Cpu } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.register({ username, email, password });
      setUser(data.user);
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error;
      if (Array.isArray(errorMsg)) {
        setError(errorMsg[0]?.message || 'REGISTRATION_FAILED: VALIDATION_ERROR');
      } else {
        setError(errorMsg || 'REGISTRATION_FAILED: SERVER_REJECTED_REQUEST');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-dots-pattern">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-[480px] relative">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link href="/" className="inline-flex flex-col items-center group">
            <div className="w-16 h-16 bg-htb-card border border-htb-border rounded-2xl flex items-center justify-center mb-4 group-hover:border-primary/50 transition-all duration-500 shadow-xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <Cpu className="w-8 h-8 text-primary relative z-10" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter">JOIN_<span className="text-primary">FORCE</span></h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] uppercase mt-1">Create your hacker profile</p>
          </Link>
        </div>

        {/* Register Card */}
        <div className="htb-card shadow-2xl animate-in fade-in zoom-in-95 duration-500 delay-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight mb-1 uppercase">New Operator</h2>
            <p className="text-xs text-muted-foreground font-mono">Initialize your account on the classified network.</p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-[11px] font-mono p-4 rounded-lg mb-6 flex items-start gap-3 animate-in shake duration-500">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                <User className="w-3 h-3 text-primary" /> USER_IDENTIFIER
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="shadow_stalker"
                className="htb-input h-11"
                required
                minLength={3}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail className="w-3 h-3 text-primary" /> SECURE_EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@ctf.platform"
                className="htb-input h-11"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock className="w-3 h-3 text-primary" /> ACCESS_KEY
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="htb-input h-11"
                required
                minLength={6}
              />
              <div className="flex gap-1 mt-1.5 px-1">
                <div className={`h-1 flex-1 rounded-full ${password.length > 0 ? (password.length > 8 ? 'bg-primary' : 'bg-yellow-500') : 'bg-border'}`} />
                <div className={`h-1 flex-1 rounded-full ${password.length > 8 ? 'bg-primary' : 'bg-border'}`} />
                <div className={`h-1 flex-1 rounded-full ${password.length > 12 ? 'bg-primary' : 'bg-border'}`} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full htb-button-primary h-12 mt-6 relative group overflow-hidden"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  INITIALIZE_PROFILE <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-htb-border text-center">
            <p className="text-xs text-muted-foreground font-mono">
              ALREADY_REGISTERED?{' '}
              <Link href="/auth/login" className="text-primary font-bold hover:underline transition-all">
                BYPASS_TO_LOGIN
              </Link>
            </p>
          </div>
        </div>

        {/* Security Info */}
        <p className="mt-8 text-[9px] text-center text-muted-foreground font-mono uppercase tracking-[0.2em] leading-relaxed">
           Your data is encrypted using military-grade protocols.<br/>
           By initializing, you agree to the <span className="text-foreground underline">Standard_Engagement_Protocols</span>.
        </p>
      </div>
    </div>
  );
}
