'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Terminal, Shield, Trophy, Flag, ChevronRight, Lock, Server, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const fullText = 'INITIALIZING_SYSTEM...';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-htb-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tighter text-xl leading-none">CTF</span>
              <span className="text-[10px] text-primary font-mono tracking-widest uppercase">Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="htb-button-primary"
              >
                <Terminal className="w-4 h-4" />
                DASHBOARD
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="htb-button-ghost font-mono text-xs"
                >
                  // LOGIN
                </Link>
                <Link
                  href="/auth/register"
                  className="htb-button-primary"
                >
                  <ChevronRight className="w-4 h-4" />
                  JOIN_NOW
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative border-b border-htb-border bg-dots-pattern">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 py-24 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  SYSTEM_ONLINE
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                  MASTER <span className="text-primary">CYBER</span>
                  <br />
                  SECURITY
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Join the elite community of hackers. Practice on real-world scenarios, climb the leaderboard, and prove your skills.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/auth/register"
                    className="htb-button-primary h-12 px-8 text-base"
                  >
                    START_HACKING
                  </Link>
                  <Link
                    href="/challenges"
                    className="htb-button-secondary h-12 px-8 text-base"
                  >
                    VIEW_CHALLENGES
                  </Link>
                </div>
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold font-mono">50+</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Challenges</span>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold font-mono">10k+</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Hackers</span>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold font-mono">24/7</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Uptime</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-20" />
                <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
                  <div className="bg-muted/50 border-b border-border p-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    <div className="ml-2 text-xs text-muted-foreground font-mono">root@kali:~</div>
                  </div>
                  <div className="p-6 font-mono text-sm space-y-2">
                    <div className="flex gap-2">
                      <span className="text-primary">➜</span>
                      <span className="text-blue-400">~</span>
                      <span className="typing-effect">{text}<span className="animate-pulse">_</span></span>
                    </div>
                    <div className="text-muted-foreground opacity-50 pt-2">
                      [+] Target acquired: 10.10.10.25<br/>
                      [+] Scanning ports...<br/>
                      [+] Found open port: 80 (HTTP)<br/>
                      [+] Found open port: 22 (SSH)<br/>
                      [+] Initiating exploit sequence...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="htb-card group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Flag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Diverse Challenges</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                From Web Exploitation to Reverse Engineering. Test your skills across multiple domains.
              </p>
            </div>
            <div className="htb-card group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Server className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Labs</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Spin up isolated Docker containers instantly. Practice in safe, sandboxed environments.
              </p>
            </div>
            <div className="htb-card group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Global Rankings</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Compete with hackers worldwide. Earn points, unlock achievements, and climb the ranks.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-htb-border py-12 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wider">CTF_PLATFORM</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Status</Link>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            v1.0.0-beta // BUILD_2024
          </div>
        </div>
      </footer>
    </div>
  );
}
