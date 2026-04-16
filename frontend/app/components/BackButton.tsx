'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

// Pages where back button should NOT appear (root-level pages)
const ROOT_PAGES = ['/dashboard', '/admin'];

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on root-level pages
  if (ROOT_PAGES.includes(pathname)) return null;

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1.5 mb-6 group w-fit
        px-3 py-1.5 rounded-lg
        border border-htb-border bg-htb-card/50
        text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5
        transition-all duration-200 text-[11px] font-bold tracking-widest uppercase font-mono"
    >
      <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
      Back
    </button>
  );
}
