'use client';

import { useEffect, useState } from 'react';
import { ctfApi } from '@/lib/api';
import { useNotificationStore } from '@/lib/store';
import {
  Plus,
  Trash2,
  Trophy,
  Loader2,
  Save,
  X,
  Calendar as CalendarIcon,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Globe,
  Activity,
  Award,
  ChevronDown,
  Edit,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

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

export default function ManageCtfPage() {
  const { addNotification } = useNotificationStore();
  const [events, setEvents] = useState<CtfEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, title: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState<CtfEvent | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'UPCOMING' as 'LIVE' | 'UPCOMING' | 'COMPLETED',
    prize: '',
    difficulty: 'MEDIUM',
    startTime: '',
    endTime: '',
  });

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

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      status: 'UPCOMING' as const,
      prize: '',
      difficulty: 'MEDIUM',
      startTime: '',
      endTime: '',
    });
    setEditingId(null);
    setSelectedBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('status', form.status);
      formData.append('prize', form.prize);
      formData.append('difficulty', form.difficulty);
      formData.append('startTime', new Date(form.startTime).toISOString());
      formData.append('endTime', new Date(form.endTime).toISOString());

      if (selectedBanner) {
        formData.append('banner', selectedBanner);
      }

      let eventData = null;

      if (editingId) {
        const { data } = await ctfApi.updateEvent(editingId, formData);
        eventData = data.event;
        addNotification({ type: 'success', message: 'OPERATION_SYNCED: Event parameters updated.' });
      } else {
        const { data } = await ctfApi.createEvent(formData);
        eventData = data.event;
        addNotification({ type: 'success', message: 'OPERATION_INITIALIZED: New CTF event deployed.' });
      }

      setShowForm(false);
      resetForm();
      fetchEvents();

      // Trigger automatic sharing intent for new creations
      if (!editingId && eventData) {
        setShowShareModal({ ...eventData, bannerUrl: selectedBanner ? URL.createObjectURL(selectedBanner) : eventData.bannerUrl });
      }
    } catch (error) {
      addNotification({ type: 'error', message: 'SYNC_ERROR: Rejection from core.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event: CtfEvent) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      status: event.status,
      prize: event.prize || '',
      difficulty: event.difficulty,
      startTime: new Date(event.startTime).toISOString().slice(0, 16),
      endTime: new Date(event.endTime).toISOString().slice(0, 16),
    });
    setSelectedBanner(null);
    setShowForm(true);
  };

  const handleShare = (event: CtfEvent) => {
    setShowShareModal(event);
  };

  const shareOnSocial = (platform: string, event: CtfEvent) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/ctf/${event.id}` : '';
    const text = `Join the ${event.title} CTF event! Prize: ${event.prize || 'Glory'}. Difficulty: ${event.difficulty}`;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(`${text}\n${url}`);
        addNotification({ type: 'info', message: 'LINK_COPIED: Registry path saved to clipboard.' });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noreferrer');
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      await ctfApi.deleteEvent(confirmDelete.id);
      addNotification({ type: 'success', message: 'EVENT_PURGED: Record removed from registry.' });
      fetchEvents();
    } catch (error) {
      addNotification({ type: 'error', message: 'PURGE_FAILED.' });
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-2">
            <Trophy className="w-4 h-4" />
            <span>/root/admin/ctf_operations</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-purple-500">Operation_Command</h1>
          <p className="text-muted-foreground max-w-2xl font-medium">
            Authorized scheduling of global CTF competitions. Configure timelines, reward structures, and engagement rules.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-black rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-purple-500/20 hover:bg-purple-600 transition-all"
        >
          <Plus className="w-5 h-5" /> Initialize_Operation
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-purple-500 font-mono text-xs tracking-widest animate-pulse">PARSING_COMPETITION_DATA...</p>
        </div>
      ) : (
        <div className="htb-card p-0 overflow-hidden border-purple-500/10 shadow-2xl">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-500/5 border-b border-purple-500/10">
                <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Status</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Operation_Name</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Schedule</th>
                <th className="text-right py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-purple-500/5 transition-colors group">
                  <td className="py-4 px-6">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${event.status === 'LIVE' ? 'bg-green-500/10 border-green-500/30 text-green-500 animate-pulse' :
                      event.status === 'UPCOMING' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' :
                        'bg-muted border-htb-border text-muted-foreground'
                      }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm uppercase tracking-tight group-hover:text-purple-500 transition-colors">{event.title}</div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">{event.prize || 'No Prize'} // {event.difficulty}</div>
                  </td>
                  <td className="py-4 px-6 text-[10px] font-mono text-muted-foreground uppercase">
                    <div className="flex items-center gap-2 font-mono"><Clock className="w-3 h-3" /> {new Date(event.startTime).toLocaleString()}</div>
                    <div className="flex items-center gap-2 mt-1 opacity-50 font-mono"><X className="w-3 h-3" /> {new Date(event.endTime).toLocaleString()}</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleShare(event)}
                        className="p-2 bg-secondary border border-border rounded-lg hover:border-purple-500/50 hover:text-purple-500 transition-all opacity-40 group-hover:opacity-100"
                        title="Share Event"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 bg-secondary border border-border rounded-lg hover:border-blue-500/50 hover:text-blue-500 transition-all opacity-40 group-hover:opacity-100"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ id: event.id, title: event.title })}
                        className="p-2 bg-secondary border border-border rounded-lg hover:border-red-500/50 hover:text-red-500 transition-all opacity-40 group-hover:opacity-100"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <div className="py-32 text-center text-muted-foreground">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="font-mono text-xs uppercase tracking-widest">No active or upcoming operations detected.</p>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="htb-card max-w-2xl w-full border-purple-500/30 relative mt-20 mb-20 p-8 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-purple-500">{editingId ? 'Update_Operation' : 'Initialize_Operation'}</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }}><X className="w-6 h-6 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Operation_Identifier</label>
                <input type="text" className="htb-input h-12 border-purple-500/10 bg-background" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Global Warfare 2024" required />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Briefing_Content</label>
                <textarea className="htb-input min-h-[100px] border-purple-500/10 bg-background" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reward_Structure</label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40" />
                    <input type="text" className="htb-input h-12 pl-12 border-purple-500/10 bg-background" value={form.prize} onChange={e => setForm({ ...form, prize: e.target.value })} placeholder="$5,000 USDT" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Complexity</label>
                  <select className="htb-input h-12 border-purple-500/10 bg-background" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3 text-purple-500" /> Activation_Timestamp
                  </label>
                  <div className="relative group">
                    <input
                      type="datetime-local"
                      className="htb-input h-12 border-purple-500/10 bg-background pr-10 [color-scheme:dark]"
                      value={form.startTime}
                      onChange={e => setForm({ ...form, startTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3 text-purple-500" /> Termination_Timestamp
                  </label>
                  <div className="relative group">
                    <input
                      type="datetime-local"
                      className="htb-input h-12 border-purple-500/10 bg-background pr-10 [color-scheme:dark]"
                      value={form.endTime}
                      onChange={e => setForm({ ...form, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 border border-purple-500/10 rounded-xl bg-purple-500/5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-3 h-3 text-purple-500" /> Mission_Banner_Data
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    className="hidden"
                    id="banner-upload"
                    accept="image/*"
                    onChange={e => setSelectedBanner(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="banner-upload"
                    className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-purple-500/10 rounded-xl hover:bg-purple-500/5 hover:border-purple-500/30 transition-all cursor-pointer group"
                  >
                    {selectedBanner ? (
                      <div className="relative w-full h-full p-2 flex flex-col items-center gap-2">
                        <img
                          src={URL.createObjectURL(selectedBanner)}
                          alt="Preview"
                          className="max-h-[100px] rounded border border-purple-500/20 shadow-lg object-cover w-full"
                        />
                        <span className="text-[10px] font-mono text-purple-500 font-bold uppercase truncate max-w-full px-4">{selectedBanner.name}</span>
                        <div className="absolute top-4 right-4 p-1.5 bg-black/60 rounded-full hover:bg-red-500/80 transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedBanner(null); }}>
                          <X className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-purple-500/20 group-hover:text-purple-500/50 mb-2 transition-colors" />
                        <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Inject_Static_Asset</span>
                        <span className="text-[8px] font-mono text-muted-foreground uppercase mt-1">PNG, JPG // MAX 10MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full htb-button-primary bg-purple-500 text-black h-14 uppercase font-black italic tracking-tighter text-lg">
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (editingId ? 'Finalize_State_Sync' : 'Commit_Operation_Parameters')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="htb-card max-w-sm w-full border-red-500/50 shadow-red-500/20 animate-in zoom-in-95 duration-200 p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-red-500">Operation_Purge</h2>
                <p className="text-[10px] font-mono text-muted-foreground uppercase leading-relaxed tracking-wider">
                  Terminate operation: <span className="text-red-400 block font-bold mt-1">&quot;{confirmDelete.title}&quot;</span>
                </p>
              </div>
              <div className="flex gap-3 w-full pt-4">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 htb-button-secondary border-red-500/10 text-red-500 text-[10px] py-3">Abort</button>
                <button onClick={executeDelete} className="flex-1 htb-button-primary bg-red-600 text-white text-[10px] py-3">Execute_Purge</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="htb-card max-w-sm w-full border-purple-500/30 animate-in zoom-in-95 duration-200 overflow-hidden p-0">
            {showShareModal.bannerUrl && (
              <div className="relative aspect-video border-b border-purple-500/20">
                <img src={showShareModal.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1 italic flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Mission_Briefing_Static
                  </div>
                  <div className="text-white font-bold text-sm uppercase truncate font-black tracking-widest">{showShareModal.title}</div>
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-purple-500">Broadcast_Network</h2>
                <button onClick={() => setShowShareModal(null)}><X className="w-6 h-6 text-muted-foreground" /></button>
              </div>

              <p className="text-[10px] font-mono text-muted-foreground uppercase mb-6 tracking-widest leading-relaxed">
                Propagate competition parameters through encrypted social channels.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareOnSocial('twitter', showShareModal)}
                  className="flex items-center gap-3 p-4 bg-secondary border border-border rounded-xl hover:border-blue-400/50 hover:bg-blue-400/5 transition-all text-xs font-bold uppercase tracking-tighter"
                >
                  <Twitter className="w-5 h-5 text-blue-400" /> Twitter
                </button>
                <button
                  onClick={() => shareOnSocial('linkedin', showShareModal)}
                  className="flex items-center gap-3 p-4 bg-secondary border border-border rounded-xl hover:border-blue-600/50 hover:bg-blue-600/5 transition-all text-xs font-bold uppercase tracking-tighter"
                >
                  <Linkedin className="w-5 h-5 text-blue-600" /> LinkedIn
                </button>
                <button
                  onClick={() => shareOnSocial('facebook', showShareModal)}
                  className="flex items-center gap-3 p-4 bg-secondary border border-border rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-xs font-bold uppercase tracking-tighter"
                >
                  <Facebook className="w-5 h-5 text-blue-500" /> Facebook
                </button>
                <button
                  onClick={() => shareOnSocial('copy', showShareModal)}
                  className="flex items-center gap-3 p-4 bg-secondary border border-border rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-xs font-bold uppercase tracking-tighter"
                >
                  <LinkIcon className="w-5 h-5 text-purple-500" /> Copy_Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
