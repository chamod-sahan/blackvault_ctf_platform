'use client';

import { useEffect, useState, useRef } from 'react';
import { educationApi } from '@/lib/api';
import { useNotificationStore } from '@/lib/store';
import { 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Terminal, 
  BookOpen, 
  Loader2, 
  Save, 
  FileText, 
  Upload, 
  Image as ImageIcon,
  GraduationCap,
  Layers,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  MessageSquare,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  answer: string;
  hint?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  category: string;
  difficulty: string;
  points: number;
  imageUrl?: string | null;
  questions: Question[];
  _count: { questions: number };
}

const CLASSIFICATIONS = [
  'Web Exploitation',
  'Pwn (Binary Exploitation)',
  'Cryptography',
  'Reverse Engineering',
  'Forensics',
  'Mobile Hacking',
  'Cloud Security',
  'Active Directory',
  'Network Security',
  'Social Engineering',
  'OSINT',
  'Incident Response',
  'Malware Analysis',
  'Bug Bounty',
  'Hardware Hacking',
  'Linux Fundamentals',
  'Windows Fundamentals',
  'Scripting (Python/Bash)',
  'Web Requests',
  'Database Infiltration',
  'Misc'
];

export default function ManageAcademyPage() {
  const { addNotification } = useNotificationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'MODULE' | 'QUESTION', id: string, title: string } | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Web Exploitation',
    difficulty: 'EASY',
    points: 100,
    type: 'READING',
    imageUrl: '',
  });

  const [questionForm, setQuestionForm] = useState({ text: '', answer: '', hint: '' });

  const fetchModules = async () => {
    try {
      setLoading(true);
      const { data } = await educationApi.getAcademyModules();
      setModules(data.modules);
    } catch (error) {
      console.error('Failed to fetch academy modules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await educationApi.uploadImage(formData);
      if (showForm) {
        setForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
      }
      addNotification({ type: 'success', message: 'ASSET_UPLOADED: Visual ID synced.' });
    } catch (error) {
      addNotification({ type: 'error', message: 'UPLOAD_FAILED.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await educationApi.updateAcademyModule(editingId, form);
        addNotification({ type: 'success', message: 'MODULE_UPDATED: Changes committed.' });
      } else {
        await educationApi.createAcademyModule(form);
        addNotification({ type: 'success', message: 'MODULE_DEPLOYED: New academy node initialized.' });
      }
      setShowForm(false);
      fetchModules();
    } catch (error) {
      addNotification({ type: 'error', message: 'SYNC_ERROR: CORE_REJECTION.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;
    try {
      await educationApi.createAcademyQuestion({ ...questionForm, moduleId: selectedModule.id });
      addNotification({ type: 'success', message: 'QUIZ_ADDED: Question synced.' });
      setShowQuestionForm(false);
      fetchModules();
    } catch (error) {
      addNotification({ type: 'error', message: 'QUIZ_FAILED.' });
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'MODULE') {
        await educationApi.deleteAcademyModule(confirmDelete.id);
      }
      addNotification({ type: 'success', message: 'PURGE_COMPLETE: Asset removed.' });
      fetchModules();
    } catch (error) {
      addNotification({ type: 'error', message: 'PURGE_FAILED.' });
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-2 sm:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-purple-500/20 pb-8">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-mono text-[10px] sm:text-xs mb-2">
            <GraduationCap className="w-4 h-4" />
            <span>/root/admin/academy_catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic text-purple-500">Knowledge_Base</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl font-medium leading-relaxed">
            Authorized management of standalone educational nodes. Deploy technical briefings and hands-on laboratory modules.
          </p>
        </div>
        
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-purple-500 text-black rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-purple-500/20 hover:bg-purple-600 transition-all"
        >
          <Plus className="w-5 h-5" /> Initialize_Module
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-purple-500 font-mono text-xs tracking-widest animate-pulse">QUERYING_ACADEMY_REGISTRY...</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {modules.map((mod) => (
            <div key={mod.id} className="htb-card group border-purple-500/10 p-0 overflow-hidden flex flex-col hover:translate-y-[-2px] transition-all">
               <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/40 transition-colors overflow-hidden shrink-0">
                        {mod.imageUrl ? (
                          <img src={`${process.env.NEXT_PUBLIC_API_URL}${mod.imageUrl}`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
                        )}
                     </div>
                     <div>
                        <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter group-hover:text-purple-500 transition-colors">{mod.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                           <span className="text-purple-500 font-bold">{mod.category}</span>
                           <span className="hidden sm:inline w-1 h-1 rounded-full bg-border" />
                           <span>{mod.difficulty}</span>
                           <span className="hidden sm:inline w-1 h-1 rounded-full bg-border" />
                           <span>{mod._count.questions} QUESTIONS</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex w-full md:w-auto gap-3">
                     <button 
                      onClick={() => { setSelectedModule(mod === selectedModule ? null : mod); }}
                      className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${selectedModule?.id === mod.id ? 'bg-purple-500 text-black border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-secondary border-htb-border hover:border-purple-500/30'}`}
                     >
                        {selectedModule?.id === mod.id ? 'CLOSE_PANEL' : 'MANAGE_QUIZ'}
                     </button>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => { setEditingId(mod.id); setForm({...mod, imageUrl: mod.imageUrl || ''}); setShowForm(true); }}
                          className="p-2.5 bg-secondary border border-border rounded-xl hover:border-purple-500/50 hover:text-purple-500 transition-all"
                        >
                           <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setConfirmDelete({ type: 'MODULE', id: mod.id, title: mod.title })}
                          className="p-2.5 bg-secondary border border-border rounded-xl hover:border-red-500/50 hover:text-red-500 transition-all"
                        >
                           <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
               </div>

               {selectedModule?.id === mod.id && (
                 <div className="p-6 sm:p-8 bg-purple-500/5 border-t border-purple-500/10 space-y-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-purple-500" /> Module_Assessment
                       </h4>
                       <button 
                        onClick={() => setShowQuestionForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-black transition-all"
                       >
                          <Plus className="w-3 h-3" /> New_Question
                       </button>
                    </div>

                    <div className="grid gap-4">
                       {mod.questions?.map((q, qi) => (
                         <div key={q.id} className="htb-card bg-[#0d0e12] border-purple-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group/q">
                            <div className="flex items-center gap-4">
                               <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center border border-purple-500/20 font-mono text-[10px] font-bold text-purple-500">
                                  0{qi+1}
                               </div>
                               <div className="text-sm font-bold uppercase tracking-tight leading-tight">{q.text}</div>
                            </div>
                            <div className="w-full sm:w-auto text-[10px] font-mono text-primary uppercase bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 text-right">
                               Ans: {q.answer}
                            </div>
                         </div>
                       ))}
                       {mod.questions?.length === 0 && (
                         <div className="py-12 text-center border border-dashed border-purple-500/10 rounded-2xl opacity-30">
                            <p className="text-[10px] font-mono uppercase tracking-widest">No validation required for this node.</p>
                         </div>
                       )}
                    </div>
                 </div>
               )}
            </div>
          ))}
        </div>
      )}

      {/* Module Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="htb-card max-w-3xl w-full border-purple-500/30 relative my-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                    <GraduationCap className="w-5 h-5 text-purple-500" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-purple-500">
                      {editingId ? 'Modify_Academy_Asset' : 'Initialize_Academy_Node'}
                    </h2>
                    <p className="text-[10px] font-mono text-purple-500/60 uppercase tracking-widest leading-none">Database_Commit_v4.2</p>
                 </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"><X className="w-6 h-6 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSaveModule} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Module_Identity</label>
                  <input type="text" className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Classification</label>
                  <div className="relative group">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50 appearance-none cursor-pointer pr-10 font-bold text-xs"
                      required
                    >
                      {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40 pointer-events-none group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Cover Visual */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Academy_Node_Visual</label>
                 <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-40 border border-dashed border-purple-500/20 rounded-2xl flex flex-col items-center justify-center gap-3 bg-purple-500/5 hover:bg-purple-500/10 cursor-pointer transition-all group overflow-hidden"
                 >
                    {form.imageUrl ? (
                      <>
                        <img src={`${process.env.NEXT_PUBLIC_API_URL}${form.imageUrl}`} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" alt="" />
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-purple-500 font-bold uppercase tracking-[0.3em] bg-black/40">Update_Visual</div>
                      </>
                    ) : (
                      <>
                        {uploadingImage ? <Loader2 className="w-8 h-8 text-purple-500 animate-spin" /> : <ImageIcon className="w-8 h-8 text-purple-500/40 group-hover:text-purple-500 transition-colors" />}
                        <span className="text-[10px] font-mono text-muted-foreground group-hover:text-purple-500 transition-colors">CLICK_TO_UPLOAD_COVER_ASSET</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Node_Short_Description</label>
                <textarea className="htb-input min-h-[80px] border-purple-500/10 bg-background focus:border-purple-500/50" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Technical_Briefing (Markdown)</label>
                <textarea className="htb-input min-h-[300px] py-4 border-purple-500/10 bg-background font-mono text-xs focus:border-purple-500/50" value={form.content} onChange={e => setForm({...form, content: e.target.value})} required />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Deployment</label>
                  <select className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50" value={form.type} onChange={e => setForm({...form, type: e.target.value})} >
                    <option value="READING">Reading</option>
                    <option value="LAB">Lab</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Complexity</label>
                  <select className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Weight</label>
                  <input type="number" className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50" value={form.points} onChange={e => setForm({...form, points: parseInt(e.target.value)})} required />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full htb-button-primary bg-purple-500 text-black h-14 uppercase font-black italic tracking-tighter text-lg shadow-lg shadow-purple-500/20">
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Commit_Node_Deployment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Form Modal */}
      {showQuestionForm && selectedModule && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="htb-card max-w-lg w-full border-purple-500/30 relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <MessageSquare className="w-5 h-5 text-purple-500" />
                 <h2 className="text-xl font-black italic uppercase tracking-tighter text-purple-500">Initialize_Validation</h2>
              </div>
              <button onClick={() => setShowQuestionForm(false)} className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"><X className="w-6 h-6 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleAddQuestion} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Validation_Query</label>
                <input type="text" className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50" value={questionForm.text} onChange={e => setQuestionForm({...questionForm, text: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Authorized_Answer</label>
                <input type="text" className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50" value={questionForm.answer} onChange={e => setQuestionForm({...questionForm, answer: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Clue_Data (Hint)</label>
                <input type="text" className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50" value={questionForm.hint} onChange={e => setQuestionForm({...questionForm, hint: e.target.value})} />
              </div>
              <button type="submit" className="w-full htb-button-primary bg-purple-500 text-black h-12 uppercase font-bold tracking-widest">Deploy_Question</button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4">
           <div className="htb-card max-w-sm w-full border-red-500/50 shadow-red-500/20 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center space-y-4">
                 <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                    <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-red-500">Asset_Purge_Warning</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase leading-relaxed tracking-wider">
                       Delete module: <span className="text-red-400 block font-bold mt-1">&quot;{confirmDelete.title}&quot;</span>
                    </p>
                 </div>
                 <div className="flex gap-3 w-full pt-4">
                    <button onClick={() => setConfirmDelete(null)} className="flex-1 htb-button-secondary border-red-500/10 text-red-500 text-[10px] uppercase font-bold">Abort</button>
                    <button onClick={executeDelete} className="flex-1 htb-button-primary bg-red-600 text-white text-[10px] uppercase font-bold">Execute_Purge</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
