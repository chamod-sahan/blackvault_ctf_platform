'use client';

import { useEffect, useState } from 'react';
import { challengeApi } from '@/lib/api';
import { useNotificationStore } from '@/lib/store';
import { 
  FileText, 
  Search, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  AlertTriangle,
  FolderLock,
  Trash2
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  category: string;
  writeupUrl?: string;
  writeupName?: string;
}

export default function AdminWriteupsPage() {
  const { addNotification } = useNotificationStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const { data } = await challengeApi.getChallenges();
      setChallenges(data.challenges);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleUploadWriteup = async (challengeId: string, file: File) => {
    try {
      setUploadingId(challengeId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('challengeId', challengeId);
      
      await challengeApi.uploadWriteup(formData);
      addNotification({ type: 'success', message: 'INTEL_REPORT_SECURED: Writeup distributed.' });
      await fetchChallenges();
    } catch (error) {
      addNotification({ type: 'error', message: 'UPLOAD_FAILED: Connection to core rejected.' });
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteWriteup = async (challengeId: string) => {
    if (!window.confirm('TERMINATION_CONFIRMATION: Delete this intelligence report?')) return;
    
    try {
      setUploadingId(challengeId);
      await challengeApi.deleteWriteup(challengeId);
      addNotification({ type: 'success', message: 'REPORT_TERMINATED: Intel purged from registry.' });
      await fetchChallenges();
    } catch (error) {
      addNotification({ type: 'error', message: 'TERMINATION_FAILED: Failed to purge report.' });
    } finally {
      setUploadingId(null);
    }
  };

  const filteredChallenges = Array.isArray(challenges)
    ? challenges.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) || 
        c.category.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-2">
            <FolderLock className="w-4 h-4" />
            <span>/root/admin/intel_library</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-purple-500">Intel_Distribution</h1>
          <p className="text-muted-foreground max-w-2xl font-medium">
            Manage classified after-action reports and exploitation walkthroughs. Uploading intel files here automatically grants operators secure viewing access.
          </p>
        </div>
      </div>

      <div className="relative group max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40 group-focus-within:text-purple-500 transition-colors" />
        <input
          type="text"
          placeholder="SCAN_TARGET_REGISTRY..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0d0e12] border border-purple-500/10 rounded-xl pl-12 h-12 text-sm font-mono text-purple-500 focus:outline-none focus:border-purple-500/30 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-purple-500 font-mono text-xs tracking-widest animate-pulse">SYNCHRONIZING_REGISTRY...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="htb-card p-0 overflow-hidden border-purple-500/10 shadow-2xl">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-500/5 border-b border-purple-500/10">
                  <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Target_Identifier</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Classification</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Current_Intel_Status</th>
                  <th className="text-right py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Deploy_Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {filteredChallenges.map((challenge) => (
                  <tr key={challenge.id} className="hover:bg-purple-500/5 transition-colors group">
                    <td className="py-4 px-6">
                       <div className="font-bold text-sm uppercase tracking-tight group-hover:text-purple-500 transition-colors">{challenge.title}</div>
                    </td>
                    <td className="py-4 px-6">
                       <div className="text-[10px] font-mono font-bold text-purple-500/60 uppercase">{challenge.category}</div>
                    </td>
                    <td className="py-4 px-6">
                       {challenge.writeupUrl ? (
                         <div className="flex items-center gap-2">
                           <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-bold uppercase shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" /> ONLINE
                           </div>
                           <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]" title={challenge.writeupName}>
                             {challenge.writeupName}
                           </span>
                         </div>
                       ) : (
                         <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-bold uppercase hover:bg-red-500/20 transition-colors">
                            <XCircle className="w-3.5 h-3.5" /> MISSING_REPORT
                         </div>
                       )}
                    </td>
                    <td className="py-4 px-6 text-right flex items-center justify-end gap-2">
                       {challenge.writeupUrl && (
                         <button
                           onClick={() => handleDeleteWriteup(challenge.id)}
                           disabled={uploadingId === challenge.id}
                           className="p-2 text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-all disabled:opacity-50"
                           title="TERMINATE_INTEL"
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                       )}
                       <label className={`relative inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-500 border border-purple-500/30 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${uploadingId === challenge.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-500/20 cursor-pointer'}`}>
                          {uploadingId === challenge.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              TRANSFERRING...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              {challenge.writeupUrl ? 'OVERWRITE' : 'UPLOAD_INTEL'}
                            </>
                          )}
                          <input 
                            type="file" 
                            className="hidden" 
                            disabled={uploadingId === challenge.id}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUploadWriteup(challenge.id, e.target.files[0]);
                              }
                            }}
                          />
                       </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredChallenges.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                 <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-10" />
                 <p className="font-mono text-xs uppercase tracking-widest">NO_TARGETS_FOUND_IN_REGISTRY</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
