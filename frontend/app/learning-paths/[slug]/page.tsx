'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Lock, 
  Terminal, 
  Play, 
  FileText, 
  HelpCircle,
  MessageSquare,
  Zap,
  ChevronDown,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  type: 'Reading' | 'Lab' | 'Video';
  duration: string;
  completed: boolean;
  content?: string;
  questions?: {
    id: string;
    text: string;
    hint: string;
  }[];
}

const pathCurriculum: Record<string, { title: string, modules: Module[] }> = {
  'hacker-prerequisites': {
    title: 'Hacker Prerequisites',
    modules: [
      { 
        id: '1', 
        title: 'Networking Fundamentals', 
        type: 'Reading', 
        duration: '45m', 
        completed: true,
        content: 'Networking is the backbone of all modern computing. Understanding how data moves between systems is crucial for any security professional...',
        questions: [
          { id: 'q1', text: 'What protocol is used to resolve domain names to IP addresses?', hint: 'Three letters, starting with D' }
        ]
      },
      { 
        id: '2', 
        title: 'Linux Command Line Basics', 
        type: 'Lab', 
        duration: '1h 30m', 
        completed: true,
        content: 'Linux is the primary OS used by security professionals. This module covers essential commands like ls, cd, cat, and grep...',
        questions: [
          { id: 'q2', text: 'Which command is used to display the current working directory?', hint: 'Print Working Directory' }
        ]
      },
      { 
        id: '3', 
        title: 'Web Technologies 101', 
        type: 'Reading', 
        duration: '1h', 
        completed: false,
        content: 'The web is more than just HTML and CSS. In this module, we explore HTTP methods, status codes, and the client-server model...',
        questions: [
          { id: 'q3', text: 'Which HTTP method is typically used to submit form data?', hint: 'Commonly used for creating resources' },
          { id: 'q4', text: 'What status code represents "Not Found"?', hint: '4XX error' }
        ]
      }
    ]
  }
};

export default function PathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const pathData = pathCurriculum[slug] || pathCurriculum['hacker-prerequisites'];
  
  const [activeModule, setActiveModule] = useState<Module | null>(pathData.modules[0]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  const handleAnswerSubmit = (qId: string) => {
    // Simulated validation
    alert(`Answer for ${qId} submitted: ${answers[qId]}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700 h-[calc(100vh-160px)]">
      {/* Sidebar Curriculum */}
      <aside className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        <button
          onClick={() => router.push('/learning-paths')}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs font-mono uppercase tracking-widest mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> /root/all_paths
        </button>

        <div className="htb-card p-4 space-y-4">
           <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
              <Zap className="w-3.5 h-3.5" /> Roadmap_Progress
           </div>
           <h2 className="font-black italic text-xl uppercase tracking-tighter leading-none">{pathData.title}</h2>
           <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary w-2/3 shadow-glow-green" />
           </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">Curriculum_Modules</div>
          {pathData.modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod)}
              className={`w-full htb-card p-4 flex items-start gap-4 text-left transition-all group ${
                activeModule?.id === mod.id ? 'border-primary/50 bg-primary/5 shadow-glow-green' : 'hover:border-primary/20'
              }`}
            >
              <div className={`mt-1 ${mod.completed ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>
                {mod.completed ? <CheckCircle2 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-xs uppercase tracking-tight truncate group-hover:text-primary transition-colors">{mod.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-muted-foreground">
                  <span>{mod.type}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>{mod.duration}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-4">
        {activeModule ? (
          <>
            {/* Content Header */}
            <div className="htb-card bg-htb-card/50 border-htb-border flex items-center justify-between p-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                     <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black italic tracking-tighter uppercase">{activeModule.title}</h3>
                     <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Module_ID: SEC-00{activeModule.id} // VERIFIED_ACCESS</p>
                  </div>
               </div>
               <div className="hidden sm:flex gap-3">
                  <button className="htb-button-secondary h-10 px-4 text-[10px]">
                    <HelpCircle className="w-4 h-4" /> GET_HELP
                  </button>
                  <button className="htb-button-primary h-10 px-4 text-[10px]">
                    <ShieldCheck className="w-4 h-4" /> MARK_COMPLETE
                  </button>
               </div>
            </div>

            {/* Learning Material */}
            <div className="htb-card min-h-[400px] p-8">
               <div className="prose prose-invert max-w-none">
                  <h2 className="text-primary font-mono text-lg mb-6 flex items-center gap-2">
                    <Terminal className="w-5 h-5" /> /usr/bin/learning_material
                  </h2>
                  <div className="text-foreground/80 leading-relaxed space-y-6 text-lg">
                    {activeModule.content}
                    <div className="bg-secondary/50 border border-htb-border p-6 rounded-xl font-mono text-sm space-y-2 mt-8">
                       <div className="text-primary opacity-50"># Example Command Sequence</div>
                       <div className="flex gap-2">
                          <span className="text-primary">$</span>
                          <span>nmap -sV -sC 10.10.10.42</span>
                       </div>
                       <div className="text-muted-foreground italic mt-4">
                         // Analyzing target signature...<br/>
                         // Port 80/tcp open http Apache httpd 2.4.41<br/>
                         // Service Enumeration Complete.
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Q&A Section */}
            <div className="space-y-4 pb-10">
               <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 px-2">
                 <MessageSquare className="w-4 h-4 text-primary" /> KNOWLEDGE_VALIDATION
               </h2>
               
               <div className="grid gap-4">
                  {activeModule.questions?.map((q, i) => (
                    <div key={q.id} className="htb-card bg-muted/10 border-htb-border/50 group hover:border-primary/30 transition-all">
                       <div className="flex flex-col md:flex-row md:items-center gap-6">
                          <div className="flex-1">
                             <div className="text-[10px] font-mono text-primary/60 mb-1 uppercase tracking-[0.2em]">Question_0{i+1}</div>
                             <p className="font-bold text-sm text-foreground/90">{q.text}</p>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-3 md:w-[400px]">
                             <div className="flex-1 relative group">
                                <input 
                                  type="text" 
                                  placeholder="ENTER_ANSWER..."
                                  value={answers[q.id] || ''}
                                  onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                  className="htb-input h-11 bg-background/50 focus:bg-background border-transparent"
                                />
                             </div>
                             <button 
                               onClick={() => handleAnswerSubmit(q.id)}
                               className="htb-button-primary h-11 px-6 text-[10px]"
                             >
                               SUBMIT
                             </button>
                          </div>
                       </div>
                       
                       <div className="mt-4 pt-4 border-t border-htb-border flex items-center justify-between">
                          <button 
                            onClick={() => setShowHint({...showHint, [q.id]: !showHint[q.id]})}
                            className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-2"
                          >
                            <HelpCircle className="w-3.5 h-3.5" /> {showHint[q.id] ? 'Hide_Hint' : 'Need_Hint?'}
                          </button>
                          {showHint[q.id] && (
                            <span className="text-[10px] font-mono text-primary italic animate-in slide-in-from-left-2 duration-300">
                              HINT: {q.hint}
                            </span>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
             <Terminal className="w-16 h-16 opacity-20" />
             <p className="font-mono uppercase tracking-widest">Select_a_module_to_begin_decryption</p>
          </div>
        )}
      </main>
    </div>
  );
}
