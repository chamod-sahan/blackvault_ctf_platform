'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Shield, Terminal, Lock, Mail, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.login({ email, password });
      setUser(data.user);
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'AUTHENTICATION_FAILED: INVALID_CREDENTIALS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-dots-pattern">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-[440px] relative">
        {/* Logo Section */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link href="/" className="inline-flex flex-col items-center group">
            <div className="w-16 h-16 bg-htb-card border border-htb-border rounded-2xl flex items-center justify-center mb-4 group-hover:border-primary/50 transition-all duration-500 shadow-xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <Shield className="w-8 h-8 text-primary relative z-10" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter">SECURE_<span className="text-primary">LOGIN</span></h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] uppercase mt-1">Authorized Personnel Only</p>
          </Link>
        </div>

        {/* Login Card */}
        <div className="htb-card shadow-2xl animate-in fade-in zoom-in-95 duration-500 delay-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="mb-8">
            <h2 className="text-xl font-bold tracking-tight mb-1 uppercase">Authentication</h2>
            <p className="text-xs text-muted-foreground font-mono">Enter your credentials to access the terminal.</p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-[11px] font-mono p-4 rounded-lg mb-6 flex items-start gap-3 animate-in shake duration-500">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail className="w-3 h-3 text-primary" /> EMAIL_ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@ctf.platform"
                className="htb-input h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Lock className="w-3 h-3 text-primary" /> PASSWORD
                </label>
                <Link href="#" className="text-[10px] font-mono text-primary/60 hover:text-primary transition-colors uppercase">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="htb-input h-12"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full htb-button-primary h-12 mt-4 relative group overflow-hidden"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-2">
                    ESTABLISH_CONNECTION <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-htb-border text-center">
            <p className="text-xs text-muted-foreground font-mono">
              NEW_OPERATOR?{' '}
              <Link href="/auth/register" className="text-primary font-bold hover:underline transition-all">
                REQUEST_ACCESS
              </Link>
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
           <div className="flex items-center gap-1.5 text-[9px] font-mono">
              <Shield className="w-3 h-3" /> AES_256
           </div>
           <div className="flex items-center gap-1.5 text-[9px] font-mono">
              <Terminal className="w-3 h-3" /> SSH_READY
           </div>
           <div className="flex items-center gap-1.5 text-[9px] font-mono">
              <Lock className="w-3 h-3" /> SSL_ENCRYPTED
           </div>
        </div>
      </div>
    </div>
  );
}
