'use client';

import { useEffect, useState, useRef } from 'react';
import { educationApi } from '@/lib/api';
import { useNotificationStore } from '@/lib/store';
import { 
  Plus, 
  Trash2, 
  Map, 
  ChevronRight, 
  BookOpen, 
  Zap, 
  Loader2, 
  Save, 
  X, 
  FileText, 
  HelpCircle,
  ShieldAlert,
  Layers,
  Layout,
  Play,
  Edit,
  ArrowDown,
  ArrowUp,
  MessageSquare,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  AlertTriangle
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
  content: string;
  type: string;
  order: number;
  questions: Question[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  difficulty: string;
  points: number;
  _count: { modules: number };
}

export default function ManagePathsPage() {
  const { addNotification } = useNotificationStore();
  const moduleFileInputRef = useRef<HTMLInputElement>(null);
  const pathFileInputRef = useRef<HTMLInputElement>(null);
  
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Toggles
  const [showPathForm, setShowPathForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'PATH' | 'MODULE' | 'QUESTION', id: string, title?: string } | null>(null);
  
  // Selected Data
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  // Form States
  const [pathForm, setPathForm] = useState({ title: '', description: '', difficulty: 'EASY', points: 0, imageUrl: '' });
  const [moduleForm, setModuleForm] = useState({ title: '', content: '', type: 'READING', order: 1 });
  const [questionForm, setQuestionForm] = useState({ text: '', answer: '', hint: '' });
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPathImage, setUploadingPathImage] = useState(false);

  const fetchPaths = async () => {
    try {
      setLoading(true);
      const { data } = await educationApi.getPaths();
      setPaths(data.paths);
    } catch (error) {
      console.error('Failed to fetch paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async (pathId: string) => {
    try {
      const { data } = await educationApi.getPathModules(pathId);
      setModules(data.modules);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  // --- Path Operations ---
  const handleCreatePath = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await educationApi.createPath(pathForm);
      addNotification({ type: 'success', message: 'ROADMAP_INITIALIZED: New learning path created.' });
      setShowPathForm(false);
      setPathForm({ title: '', description: '', difficulty: 'EASY', points: 0, imageUrl: '' });
      fetchPaths();
    } catch (error) {
      addNotification({ type: 'error', message: 'CREATION_FAILED: System rejection.' });
    }
  };

  const handlePathImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPathImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await educationApi.uploadImage(formData);
      setPathForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
      addNotification({ type: 'success', message: 'PATH_IMAGE_SYNCED: Coverage visual updated.' });
    } catch (error) {
      addNotification({ type: 'error', message: 'UPLOAD_FAILED.' });
    } finally {
      setUploadingPathImage(false);
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'PATH') {
        await educationApi.deletePath(confirmDelete.id);
        fetchPaths();
      } else if (confirmDelete.type === 'MODULE') {
        await educationApi.deletePathModule(confirmDelete.id);
        if (selectedPathId) fetchModules(selectedPathId);
      } else if (confirmDelete.type === 'QUESTION') {
        await educationApi.deletePathQuestion(confirmDelete.id);
        if (selectedPathId) fetchModules(selectedPathId);
      }
      addNotification({ type: 'success', message: 'RESOURCE_PURGED: Target removed successfully.' });
    } catch (error) {
      addNotification({ type: 'error', message: 'PURGE_FAILED: Access denied.' });
    } finally {
      setConfirmDelete(null);
    }
  };

  // --- Module Operations ---
  const handleOpenModuleForm = (mod?: Module) => {
    if (mod) {
      setEditingModuleId(mod.id);
      setModuleForm({ title: mod.title, content: mod.content, type: mod.type, order: mod.order });
    } else {
      setEditingModuleId(null);
      setModuleForm({ title: '', content: '', type: 'READING', order: modules.length + 1 });
    }
    setShowModuleForm(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPathId) return;
    try {
      if (editingModuleId) {
        await educationApi.updatePathModule(editingModuleId, moduleForm);
        addNotification({ type: 'success', message: 'MODULE_UPDATED: Content registry synced.' });
      } else {
        await educationApi.createPathModule({ ...moduleForm, learningPathId: selectedPathId });
        addNotification({ type: 'success', message: 'MODULE_DEPLOYED: Content added to roadmap.' });
      }
      setShowModuleForm(false);
      fetchModules(selectedPathId);
    } catch (error) {
      addNotification({ type: 'error', message: 'MODULE_OPERATION_FAILED.' });
    }
  };

  const handleModuleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await educationApi.uploadImage(formData);
      const imageMarkdown = `\n\n![Image](${process.env.NEXT_PUBLIC_API_URL}${data.imageUrl})\n\n`;
      setModuleForm(prev => ({ ...prev, content: prev.content + imageMarkdown }));
      addNotification({ type: 'success', message: 'IMAGE_UPLOADED: Injected into content.' });
    } catch (error) {
      addNotification({ type: 'error', message: 'UPLOAD_FAILED.' });
    } finally {
      setUploadingImage(false);
    }
  };

  // --- Question Operations ---
  const handleOpenQuestionForm = (mod: Module, q?: Question) => {
    setSelectedModule(mod);
    if (q) {
      setEditingQuestionId(q.id);
      setQuestionForm({ text: q.text, answer: q.answer, hint: q.hint || '' });
    } else {
      setEditingQuestionId(null);
      setQuestionForm({ text: '', answer: '', hint: '' });
    }
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;
    try {
      if (editingQuestionId) {
        await educationApi.updatePathQuestion(editingQuestionId, questionForm);
        addNotification({ type: 'success', message: 'QUIZ_UPDATED: Question modified.' });
      } else {
        await educationApi.createPathQuestion({ ...questionForm, moduleId: selectedModule.id });
        addNotification({ type: 'success', message: 'QUIZ_VALIDATED: New question added.' });
      }
      setShowQuestionForm(false);
      if (selectedPathId) fetchModules(selectedPathId);
    } catch (error) {
      addNotification({ type: 'error', message: 'QUIZ_SYNC_ERROR.' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>/root/admin/curriculum_manager</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-purple-500">Roadmap_Architect</h1>
          <p className="text-muted-foreground max-w-2xl font-medium">
            Authorized construction of educational roadmaps. Deploy multi-stage modules and technical validation quizzes.
          </p>
        </div>
        
        <button
          onClick={() => setShowPathForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-purple-500/20 hover:bg-purple-600 transition-all"
        >
          <Plus className="w-5 h-5" /> Initialize_Path
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-purple-500 font-mono text-xs tracking-widest animate-pulse">DECRYPTING_ACADEMY_DATA...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {paths.map((path) => (
            <div key={path.id} className="htb-card group border-purple-500/10 p-0 overflow-hidden flex flex-col">
               <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-purple-500/10">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/40 transition-colors overflow-hidden">
                        {path.imageUrl ? (
                          <img src={`${process.env.NEXT_PUBLIC_API_URL}${path.imageUrl}`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <Map className="w-7 h-7 text-purple-500" />
                        )}
                     </div>
                     <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-purple-500 transition-colors">{path.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                           <span>{path.difficulty}</span>
                           <span className="w-1 h-1 rounded-full bg-border" />
                           <span className="text-purple-500">{path._count.modules} MODULES</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex gap-2">
                     <button 
                      onClick={() => { setSelectedPathId(path.id === selectedPathId ? null : path.id); if (path.id !== selectedPathId) fetchModules(path.id); }}
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${selectedPathId === path.id ? 'bg-purple-500 text-black border-purple-500' : 'bg-secondary border-htb-border hover:border-purple-500/30'}`}
                     >
                        {selectedPathId === path.id ? 'CLOSE_CONSOLE' : 'MANAGE_ROADMAP'}
                     </button>
                     <button 
                      onClick={() => setConfirmDelete({ type: 'PATH', id: path.id, title: path.title })}
                      className="p-2 bg-secondary border border-border rounded-lg hover:border-red-500/50 hover:text-red-500 transition-all"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               {selectedPathId === path.id && (
                 <div className="p-8 bg-purple-500/5 space-y-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                          <Layers className="w-4 h-4 text-purple-500" /> Curriculum_Structure
                       </h4>
                       <button 
                        onClick={() => handleOpenModuleForm()}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-black transition-all"
                       >
                          <Plus className="w-3 h-3" /> New_Module
                       </button>
                    </div>

                    <div className="grid gap-6">
                       {modules.map((mod) => (
                         <div key={mod.id} className="htb-card bg-[#0d0e12] border-purple-500/10 p-0 flex flex-col group/mod overflow-hidden">
                            <div className="p-5 flex items-center justify-between bg-purple-500/5 border-b border-purple-500/10">
                               <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-background rounded flex items-center justify-center border border-purple-500/20 font-mono text-xs font-bold text-purple-500">
                                     {mod.order}
                                  </div>
                                  <div>
                                     <div className="text-sm font-bold uppercase tracking-tight group-hover/mod:text-purple-500 transition-colors">{mod.title}</div>
                                     <div className="text-[9px] font-mono text-muted-foreground uppercase">{mod.type} // DATA_NODE</div>
                                  </div>
                               </div>
                               <div className="flex gap-2">
                                  <button onClick={() => handleOpenModuleForm(mod)} className="p-1.5 hover:text-purple-500 transition-colors"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => setConfirmDelete({ type: 'MODULE', id: mod.id, title: mod.title })} className="p-1.5 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                               </div>
                            </div>

                            <div className="p-6 space-y-4">
                               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  <span className="flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5" /> Validation_Quizzes</span>
                                  <button onClick={() => handleOpenQuestionForm(mod)} className="text-purple-500 hover:underline">+ ADD_QUERY</button>
                               </div>
                               
                               <div className="grid gap-2">
                                  {mod.questions?.map((q, qi) => (
                                    <div key={q.id} className="flex items-center justify-between p-3 bg-background/50 border border-htb-border rounded-lg group/q">
                                       <div className="flex items-center gap-3 overflow-hidden">
                                          <span className="text-[9px] font-mono text-purple-500/40">Q{qi+1}</span>
                                          <span className="text-[11px] font-medium truncate">{q.text}</span>
                                       </div>
                                       <div className="flex gap-2 opacity-0 group-hover/q:opacity-100 transition-opacity">
                                          <button onClick={() => handleOpenQuestionForm(mod, q)} className="p-1 text-muted-foreground hover:text-purple-500"><Edit className="w-3 h-3" /></button>
                                          <button onClick={() => setConfirmDelete({ type: 'QUESTION', id: q.id, title: q.text })} className="p-1 text-muted-foreground hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          ))}
        </div>
      )}

      {/* Path Modal */}
      {showPathForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="htb-card max-w-lg w-full border-purple-500/30 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Initialize_Roadmap</h2>
              <button onClick={() => setShowPathForm(false)}><X className="w-6 h-6 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleCreatePath} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Roadmap_Cover_Visual</label>
                 <div 
                  onClick={() => pathFileInputRef.current?.click()}
                  className="relative h-32 border border-dashed border-purple-500/20 rounded-xl flex flex-col items-center justify-center gap-3 bg-purple-500/5 hover:bg-purple-500/10 cursor-pointer transition-all group overflow-hidden"
                 >
                    {pathForm.imageUrl ? (
                      <>
                        <img src={`${process.env.NEXT_PUBLIC_API_URL}${pathForm.imageUrl}`} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" alt="" />
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-purple-500 font-bold uppercase tracking-widest">Update_Visual</div>
                      </>
                    ) : (
                      <>
                        {uploadingPathImage ? <Loader2 className="w-6 h-6 text-purple-500 animate-spin" /> : <ImageIcon className="w-6 h-6 text-purple-500/40" />}
                        <span className="text-[10px] font-mono text-muted-foreground">CLICK_TO_UPLOAD_COVER</span>
                      </>
                    )}
                    <input type="file" ref={pathFileInputRef} className="hidden" accept="image/*" onChange={handlePathImageUpload} />
                 </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Roadmap_Identity</label>
                <input type="text" className="htb-input h-12 border-purple-500/10 bg-background" value={pathForm.title} onChange={e => setPathForm({...pathForm, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Technical_Summary</label>
                <textarea className="htb-input min-h-[100px] border-purple-500/10 bg-background" value={pathForm.description} onChange={e => setPathForm({...pathForm, description: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Complexity</label>
                  <select className="htb-input h-12 border-purple-500/10 bg-background" value={pathForm.difficulty} onChange={e => setPathForm({...pathForm, difficulty: e.target.value})} >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Completion_Weight</label>
                  <input type="number" className="htb-input h-12 border-purple-500/10 bg-background" value={pathForm.points} onChange={e => setPathForm({...pathForm, points: parseInt(e.target.value)})} required />
                </div>
              </div>
              <button type="submit" className="w-full htb-button-primary bg-purple-500 text-black h-12 uppercase">Deploy_Roadmap</button>
            </form>
          </div>
        </div>
      )}

      {/* Module Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="htb-card max-w-2xl w-full border-purple-500/30 relative mt-20 mb-20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-purple-500">
                {editingModuleId ? 'Modify_Module' : 'Module_Deployment'}
              </h2>
              <button onClick={() => setShowModuleForm(false)}><X className="w-6 h-6 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSaveModule} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Module_Title</label>
                  <input type="text" className="htb-input h-12 border-purple-500/10 bg-background" value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Execution_Order</label>
                  <input type="number" className="htb-input h-12 border-purple-500/10 bg-background" value={moduleForm.order} onChange={e => setModuleForm({...moduleForm, order: parseInt(e.target.value)})} required />
                </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Asset_Injection (Images)</label>
                 <div 
                  onClick={() => moduleFileInputRef.current?.click()}
                  className="border border-dashed border-purple-500/20 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-purple-500/5 hover:bg-purple-500/10 cursor-pointer transition-all group"
                 >
                    {uploadingImage ? <Loader2 className="w-8 h-8 text-purple-500 animate-spin" /> : <ImageIcon className="w-8 h-8 text-purple-500/40 group-hover:text-purple-500 transition-colors" />}
                    <span className="text-[10px] font-mono text-muted-foreground group-hover:text-purple-500 transition-colors">CLICK_TO_INJECT_IMAGE</span>
                    <input type="file" ref={moduleFileInputRef} className="hidden" accept="image/*" onChange={handleModuleImageUpload} />
                 </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Learning_Materials (Markdown_Supported)</label>
                <textarea className="htb-input min-h-[250px] py-4 border-purple-500/10 bg-background font-mono text-xs" value={moduleForm.content} onChange={e => setModuleForm({...moduleForm, content: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Deployment_Type</label>
                <select className="htb-input h-12 border-purple-500/10 bg-background" value={moduleForm.type} onChange={e => setModuleForm({...moduleForm, type: e.target.value})} >
                  <option value="READING">Technical_Briefing</option>
                  <option value="LAB">Hands_On_Lab</option>
                  <option value="VIDEO">Signal_Intercept_Video</option>
                </select>
              </div>
              <button type="submit" className="w-full htb-button-primary bg-purple-500 text-black h-12 uppercase">
                {editingModuleId ? 'Commit_Module_Changes' : 'Sync_to_Roadmap'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="htb-card max-w-lg w-full border-purple-500/30 relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-purple-500">
                {editingQuestionId ? 'Modify_Quiz_Node' : 'Quiz_Configuration'}
              </h2>
              <button onClick={() => setShowQuestionForm(false)}><X className="w-6 h-6 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSaveQuestion} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Validation_Query</label>
                <input type="text" className="htb-input h-12 border-purple-500/10 bg-background" value={questionForm.text} onChange={e => setQuestionForm({...questionForm, text: e.target.value})} placeholder="What is the answer?" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Authorized_Answer</label>
                <input type="text" className="htb-input h-12 border-purple-500/10 bg-background" value={questionForm.answer} onChange={e => setQuestionForm({...questionForm, answer: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Operator_Clue (Hint)</label>
                <input type="text" className="htb-input h-12 border-purple-500/10 bg-background" value={questionForm.hint} onChange={e => setQuestionForm({...questionForm, hint: e.target.value})} />
              </div>
              <button type="submit" className="w-full htb-button-primary bg-purple-500 text-black h-12 uppercase">
                {editingQuestionId ? 'Commit_Quiz_Sync' : 'Finalize_Quiz'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4">
           <div className="htb-card max-w-sm w-full border-red-500/50 shadow-red-500/20 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center space-y-4">
                 <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                    <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-red-500">Protocol_Warning</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase leading-relaxed tracking-wider">
                       Irreversible data purge requested for:<br/>
                       <span className="text-red-400 font-bold underline mt-2 block">&quot;{confirmDelete.title || 'Selected Resource'}&quot;</span>
                    </p>
                 </div>
                 <div className="flex gap-3 w-full pt-4">
                    <button 
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 htb-button-secondary border-red-500/10 hover:bg-red-500/5 text-red-500 text-[10px] uppercase"
                    >
                       Abort_Purge
                    </button>
                    <button 
                      onClick={executeDelete}
                      className="flex-1 htb-button-primary bg-red-600 text-white hover:bg-red-700 shadow-red-500/20 text-[10px] uppercase"
                    >
                       Execute_Purge
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
