'use client';

import { useEffect, useState } from 'react';
import { challengeApi } from '@/lib/api';
import { useNotificationStore } from '@/lib/store';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Terminal,
  Monitor,
  Cpu,
  Database,
  Search,
  Loader2,
  Save,
  ShieldAlert,
  Clock,
  ToggleLeft,
  ToggleRight,
  Layers,
  ChevronDown,
  Upload,
  FileText
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  type: 'CHALLENGE' | 'MACHINE';
  os?: 'WINDOWS' | 'LINUX' | 'OTHER' | null;
  isExpired: boolean;
  isDynamic?: boolean;
  flagTemplate?: string;
  writeupUrl?: string;
  writeupName?: string;
}

const CLASSIFICATIONS = [
  { group: 'GENERAL_LABS', options: ['Web', 'Pwn', 'Crypto', 'Reverse', 'Forensics', 'Mobile', 'Cloud', 'Hardware', 'Misc'] },
  { group: 'MACHINE_TARGETS', options: ['Linux', 'Windows', 'Active Directory', 'Kernel', 'Network'] }
];

export default function ManageLabsPage() {
  const { addNotification } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<'CHALLENGE' | 'MACHINE'>('CHALLENGE');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedWriteup, setSelectedWriteup] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    type: 'CHALLENGE' as 'CHALLENGE' | 'MACHINE',
    os: null as 'WINDOWS' | 'LINUX' | 'OTHER' | null,
    difficulty: 'EASY',
    points: 100,
    flag: '',
    dockerImage: '',
    isExpired: false,
    isDynamic: false,
    flagTemplate: 'CTF{hash}',
  });

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

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: '',
      type: activeTab,
      os: activeTab === 'MACHINE' ? 'LINUX' : null,
      difficulty: 'EASY',
      points: 100,
      flag: '',
      dockerImage: '',
      isExpired: false,
      isDynamic: false,
      flagTemplate: 'CTF{hash}',
    });
    setSelectedFile(null);
    setSelectedWriteup(null);
  };

  const handleEdit = (challenge: Challenge) => {
    setEditingId(challenge.id);
    setForm({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      type: challenge.type,
      os: challenge.os || null,
      difficulty: challenge.difficulty,
      points: challenge.points,
      flag: '',
      dockerImage: '',
      isExpired: challenge.isExpired,
      isDynamic: challenge.isDynamic || false,
      flagTemplate: challenge.flagTemplate || 'CTF{hash}',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('PROTOCOL_WARNING: Permanently purge this target from infrastructure?')) return;
    try {
      await challengeApi.deleteChallenge(id);
      addNotification({ type: 'success', message: 'PURGE_COMPLETE: Target removed.' });
      fetchChallenges();
    } catch (error) {
      addNotification({ type: 'error', message: 'PURGE_FAILED: Protected node.' });
    }
  };

  const toggleExpired = async (challenge: Challenge) => {
    try {
      await challengeApi.updateChallenge(challenge.id, { isExpired: !challenge.isExpired });
      addNotification({
        type: 'info',
        message: `STATE_CHANGE: Target ${!challenge.isExpired ? 'EXPIRED' : 'RE-ACTIVATED'}.`
      });
      fetchChallenges();
    } catch (error) {
      addNotification({ type: 'error', message: 'STATE_CHANGE_FAILED.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    let challengeId = '';

    try {
      if (editingId) {
        await challengeApi.updateChallenge(editingId as string, form);
        challengeId = editingId;
        addNotification({ type: 'success', message: 'INFRASTRUCTURE_SYNCED: System registry updated.' });
      } else {
        const { data } = await challengeApi.createChallenge(form);
        challengeId = data.challenge.id;
        addNotification({ type: 'success', message: 'RESOURCE_INITIALIZED: New target online.' });
      }

      if (selectedFile && challengeId) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('challengeId', challengeId);
        await challengeApi.uploadAttachment(formData);
      }

      if (selectedWriteup && challengeId) {
        const formData = new FormData();
        formData.append('file', selectedWriteup);
        formData.append('challengeId', challengeId);
        await challengeApi.uploadWriteup(formData);
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchChallenges();
    } catch (error) {
      addNotification({ type: 'error', message: 'DEPLOYMENT_FAILED: Rejection from core.' });
    } finally {
      setSubmitting(false);
    }
  };


  const filteredChallenges = challenges.filter(c =>
    c.type === activeTab &&
    (c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>/root/admin/resource_manager</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-purple-500">Asset_Inventory</h1>
          <p className="text-muted-foreground max-w-2xl font-medium">
            Authorized management of platform infrastructure. Configure standalone labs or enterprise-grade targets.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-purple-500/20 hover:bg-purple-600 transition-all"
        >
          <Plus className="w-5 h-5" /> Deploy_{activeTab}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#0d0e12] border border-purple-500/10 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('CHALLENGE')}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === 'CHALLENGE' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-muted-foreground hover:text-purple-500'
            }`}
        >
          <Terminal className="w-3.5 h-3.5" /> Standalone_Labs
        </button>
        <button
          onClick={() => setActiveTab('MACHINE')}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === 'MACHINE' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-muted-foreground hover:text-purple-500'
            }`}
        >
          <Monitor className="w-3.5 h-3.5" /> Enterprise_Machines
        </button>
      </div>

      <div className="bg-[#0d0e12] border border-purple-500/10 p-4 rounded-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            placeholder={`SCAN_${activeTab}S_BY_TITLE_OR_CATEGORY...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background/50 border border-purple-500/10 rounded-lg pl-12 h-12 text-sm font-mono text-purple-500 focus:outline-none focus:border-purple-500/30 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-purple-500 font-mono text-xs tracking-widest animate-pulse">QUERYING_INVENTORY_DATABASE...</p>
        </div>
      ) : (
        <div className="htb-card p-0 overflow-hidden border-purple-500/10 shadow-2xl">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-500/5 border-b border-purple-500/10">
                <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Target_Identity</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Class</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Status</th>
                <th className="text-right py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {filteredChallenges.map((c) => (
                <tr key={c.id} className="hover:bg-purple-500/5 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 bg-muted/30 rounded-lg flex items-center justify-center border border-purple-500/10 group-hover:border-amber-500/30 transition-colors ${c.isExpired ? 'text-muted-foreground' : 'text-purple-500'}`}>
                        {c.type === 'MACHINE' ? (c.os === 'WINDOWS' ? <Monitor className="w-4 h-4" /> : <Cpu className="w-4 h-4" />) : <Terminal className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className={`font-bold text-sm uppercase tracking-tight ${c.isExpired ? 'text-muted-foreground line-through' : 'group-hover:text-purple-500'} transition-colors`}>{c.title}</div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{c.points} PTS // {c.difficulty}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-mono bg-purple-500/10 text-purple-500/60 px-2 py-1 rounded border border-purple-500/20 uppercase tracking-widest">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleExpired(c)}
                      className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${c.isExpired ? 'text-red-500' : 'text-green-500'}`}
                    >
                      {c.isExpired ? <ToggleLeft className="w-5 h-5" /> : <ToggleRight className="w-5 h-5" />}
                      {c.isExpired ? 'EXPIRED' : 'ACTIVE'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-2 bg-secondary border border-border rounded-lg hover:border-purple-500/50 hover:text-purple-500 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 bg-secondary border border-border rounded-lg hover:border-purple-500/50 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredChallenges.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <Layers className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="font-mono text-xs uppercase tracking-widest">NO_ASSETS_RECORDED_IN_THIS_CATEGORY</p>
            </div>
          )}
        </div>
      )}

      {/* Deploy Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="htb-card max-w-2xl w-full border-purple-500/30 shadow-purple-500/10 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                  <Database className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter">
                    {editingId ? 'Modify_Resource' : `Deploy_New_${activeTab}`}
                  </h2>
                  <p className="text-[10px] font-mono text-purple-500/60 uppercase tracking-widest leading-none">Database_Commit_v3.4</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors">
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Asset_Identity</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Classification</label>
                  <div className="relative group">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50 appearance-none cursor-pointer pr-10"
                      required
                    >
                      <option value="" disabled>SELECT_CLASSIFICATION</option>
                      {CLASSIFICATIONS.map((group) => (
                        <optgroup key={group.group} label={group.group}>
                          {group.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40 pointer-events-none group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>
              </div>

              {activeTab === 'MACHINE' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Target_Environment</label>
                  <div className="relative group">
                    <select
                      value={form.os || ''}
                      onChange={(e) => setForm({ ...form, os: e.target.value as any })}
                      className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50 appearance-none cursor-pointer pr-10"
                    >
                      <option value="LINUX">Linux_Kernel</option>
                      <option value="WINDOWS">Windows_NT</option>
                      <option value="OTHER">Other_Subsystem</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40 pointer-events-none group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Technical_Briefing</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="htb-input min-h-[120px] py-4 border-purple-500/10 bg-background focus:border-purple-500/50"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Complexity</label>
                  <div className="relative group">
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50 appearance-none cursor-pointer pr-10"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40 pointer-events-none group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Point_Weight</label>
                  <input
                    type="number"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) })}
                    className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50"
                    min={1}
                    required
                  />
                </div>

                <div className="space-y-2 flex flex-col justify-center">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-3">Availability</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isExpired: !form.isExpired })}
                    className={`flex items-center gap-2 text-[10px] font-bold uppercase transition-all ${form.isExpired ? 'text-red-500' : 'text-green-500'}`}
                  >
                    {form.isExpired ? <ToggleLeft className="w-6 h-6" /> : <ToggleRight className="w-6 h-6" />}
                    {form.isExpired ? 'Expired_Node' : 'Active_Node'}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Capture_Flag</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40" />
                    <input
                      type="text"
                      value={form.flag}
                      onChange={(e) => setForm({ ...form, flag: e.target.value })}
                      placeholder="HTB{v3ry_s3cur3_fl4g}"
                      className="htb-input h-12 pl-12 font-mono border-purple-500/10 bg-background focus:border-purple-500/50"
                      required={!editingId && !form.isDynamic}
                    />
                  </div>
                </div>

                <div className="space-y-2 flex flex-col justify-center">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-3">Dynamic_Flag</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isDynamic: !form.isDynamic })}
                    className={`flex items-center gap-2 text-[10px] font-bold uppercase transition-all ${form.isDynamic ? 'text-green-500' : 'text-muted-foreground'}`}
                  >
                    {form.isDynamic ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    {form.isDynamic ? 'DYNAMIC_ACTIVE' : 'STATIC_FLAG'}
                  </button>
                </div>
              </div>

              {form.isDynamic && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Flag_Template</label>
                  <div className="relative group">
                    <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40" />
                    <input
                      type="text"
                      value={form.flagTemplate}
                      onChange={(e) => setForm({ ...form, flagTemplate: e.target.value })}
                      placeholder="CTF{user_{hash}}"
                      className="htb-input h-12 pl-12 font-mono border-purple-500/10 bg-background focus:border-purple-500/50 border-dashed"
                    />
                  </div>
                  <p className="text-[9px] font-mono text-purple-500/40 uppercase tracking-widest ml-1">
                    USE {"{hash}"} AS PLACEHOLDER FOR UNIQUE USER IDENTIFIER.
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Attachment_Package</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                      <label className="flex h-12 items-center px-4 bg-background border border-purple-500/10 rounded-lg cursor-pointer hover:border-purple-500/30 transition-all">
                        <Upload className="w-4 h-4 text-purple-500/40 mr-3" />
                        <span className="text-sm font-mono text-muted-foreground truncate italic">
                          {selectedFile ? selectedFile.name : 'UPLOAD_MISSION_ASSETS...'}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                        />
                      </label>
                    </div>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest ml-1">
                    SUPPORTS ZIP, PDF, AND BINARY EXECUTABLES (MAX 50MB)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Writeup_Package</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                      <label className="flex h-12 items-center px-4 bg-background border border-purple-500/10 rounded-lg cursor-pointer hover:border-purple-500/30 transition-all">
                        <FileText className="w-4 h-4 text-purple-500/40 mr-3" />
                        <span className="text-sm font-mono text-muted-foreground truncate italic">
                          {selectedWriteup ? selectedWriteup.name : 'UPLOAD_WRITEUP...'}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => setSelectedWriteup(e.target.files ? e.target.files[0] : null)}
                        />
                      </label>
                    </div>
                    {selectedWriteup && (
                      <button
                        type="button"
                        onClick={() => setSelectedWriteup(null)}
                        className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest ml-1">
                    SUPPORTS ALL FORMATS (PDF, MD, ETC - MAX 50MB)
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 htb-button-secondary border-purple-500/10 hover:bg-purple-500/5 uppercase"
                >
                  Abort_Deployment
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 htb-button-primary bg-purple-500 text-white hover:bg-purple-600 shadow-purple-500/20 uppercase"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Finalize_Registry</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
