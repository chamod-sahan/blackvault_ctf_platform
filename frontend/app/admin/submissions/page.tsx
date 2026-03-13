'use client';

import { useEffect, useState } from 'react';
import { submissionApi } from '@/lib/api';
import { 
  History, 
  Search, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Terminal, 
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface Submission {
  id: string;
  user: { username: string };
  challenge: { title: string; category: string };
  submittedFlag: string;
  correct: boolean;
  createdAt: string;
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setPages] = useState(1);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data } = await submissionApi.getAllSubmissions(page);
      setSubmissions(data.submissions);
      setPages(data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page]);

  const filteredSubmissions = submissions.filter(s => 
    s.user.username.toLowerCase().includes(search.toLowerCase()) ||
    s.challenge.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>/root/admin/submission_logs</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-purple-500">Infiltration_History</h1>
          <p className="text-muted-foreground max-w-2xl font-medium">
            Complete audit trail of all exploitation attempts. Monitor real-time flag submissions across the entire infrastructure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            placeholder="SCAN_BY_OPERATOR_OR_TARGET..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d0e12] border border-purple-500/10 rounded-xl pl-12 h-12 text-sm font-mono text-purple-500 focus:outline-none focus:border-purple-500/30 transition-all"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#0d0e12] border border-purple-500/10 rounded-xl px-4 h-12 text-xs font-bold text-purple-500/60 uppercase tracking-widest appearance-none cursor-pointer focus:border-purple-500/30 focus:text-purple-500 outline-none"
          >
            <option value="ALL">All_Statuses</option>
            <option value="CORRECT">Correct_Only</option>
            <option value="WRONG">Failed_Attempts</option>
          </select>
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/20 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-purple-500 font-mono text-xs tracking-widest animate-pulse">PARSING_LOG_FILES...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="htb-card p-0 overflow-hidden border-purple-500/10 shadow-2xl">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-500/5 border-b border-purple-500/10">
                  <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Operator</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Target_Infiltration</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Captured_Flag</th>
                  <th className="text-center py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Status</th>
                  <th className="text-right py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-purple-500/5 transition-colors group">
                    <td className="py-4 px-6">
                       <div className="font-bold text-sm uppercase tracking-tight group-hover:text-purple-500 transition-colors">{sub.user.username}</div>
                    </td>
                    <td className="py-4 px-6">
                       <div className="text-xs font-bold uppercase">{sub.challenge.title}</div>
                       <div className="text-[10px] font-mono text-muted-foreground uppercase">{sub.challenge.category}</div>
                    </td>
                    <td className="py-4 px-6">
                       <div className="max-w-[200px] truncate font-mono text-[10px] bg-muted/30 px-2 py-1 rounded border border-htb-border text-muted-foreground group-hover:text-foreground group-hover:border-purple-500/20 transition-all">
                          {sub.submittedFlag}
                       </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                       {sub.correct ? (
                         <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-bold uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PWND
                         </div>
                       ) : (
                         <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-bold uppercase">
                            <XCircle className="w-3.5 h-3.5" /> FAIL
                         </div>
                       )}
                    </td>
                    <td className="py-4 px-6 text-right">
                       <div className="text-[10px] font-mono text-muted-foreground uppercase">{new Date(sub.createdAt).toLocaleDateString()}</div>
                       <div className="text-[10px] font-mono text-purple-500/60 uppercase">{new Date(sub.createdAt).toLocaleTimeString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSubmissions.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                 <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                 <p className="font-mono text-xs uppercase tracking-widest">NO_SUBMISSION_PACKETS_INTERCEPTED</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-2">
             <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Page {page} of {totalPages} // Total Records Intercepted
             </div>
             <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 htb-card hover:border-purple-500/50 disabled:opacity-20"
                >
                   <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 htb-card hover:border-purple-500/50 disabled:opacity-20"
                >
                   <ChevronRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
