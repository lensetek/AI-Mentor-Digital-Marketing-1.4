import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, ChevronLeft, Loader2, Sparkles, BookOpen, Link, FileText, Brain, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { ChatMessage } from './types';
import { MODULES, ModuleInfo } from './data';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

interface MindmapNode {
  name: string;
  emoji?: string;
  description?: string;
  children?: MindmapNode[];
}

const MindmapNodeComponent: React.FC<{ 
  node: MindmapNode; 
  depth: number; 
  isLast: boolean; 
  isFirst: boolean; 
  parentHasMultiple: boolean;
}> = ({ node, depth, isLast, isFirst, parentHasMultiple }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center relative px-2">
      {/* Top connector line from parent to this node */}
      {depth > 0 && (
        <div className="absolute top-0 w-0.5 h-6 bg-slate-300"></div>
      )}
      
      {/* Horizontal connector line on this row if parent has multiple children */}
      {depth > 0 && parentHasMultiple && (
        <div 
          className={cn(
            "absolute top-0 h-0.5 bg-slate-300",
            isFirst ? "left-1/2 right-0" :
            isLast ? "left-0 right-1/2" :
            "left-0 right-0"
          )}
        ></div>
      )}

      {/* Node Card */}
      <div 
        className={cn(
          "px-4 py-3 rounded-2xl shadow-sm border text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md flex flex-col items-center min-w-[140px] max-w-[180px] z-10 select-none",
          depth === 0 ? "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500 text-white ring-4 ring-blue-100" :
          depth === 1 ? "bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200 text-indigo-950 font-semibold" :
          "bg-white border-slate-200 text-slate-800"
        )}
        style={{ marginTop: depth > 0 ? '24px' : '0' }}
      >
        <span className="text-2xl mb-1.5 transform transition-transform hover:scale-125 duration-200">{node.emoji || '💡'}</span>
        <h4 className="font-bold text-xs leading-tight tracking-tight">{node.name}</h4>
        {node.description && (
          <p className={cn("text-[9px] mt-1 leading-snug font-medium", depth === 0 ? "text-blue-100" : "text-slate-500")}>
            {node.description}
          </p>
        )}
        {hasChildren && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "mt-2 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm cursor-pointer transition-colors border",
              depth === 0 
                ? "bg-white text-blue-600 border-slate-200 hover:bg-slate-50" 
                : "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700"
            )}
          >
            {isCollapsed ? '+' : '-'}
          </button>
        )}
      </div>

      {/* Bottom connector line from this node to its children */}
      {hasChildren && !isCollapsed && (
        <div className="w-0.5 h-6 bg-slate-300"></div>
      )}

      {/* Children branches */}
      {hasChildren && !isCollapsed && (
        <div className="flex pt-0 relative justify-center">
          {node.children!.map((child, idx) => (
            <MindmapNodeComponent 
              key={idx} 
              node={child} 
              depth={depth + 1} 
              isFirst={idx === 0}
              isLast={idx === node.children!.length - 1}
              parentHasMultiple={node.children!.length > 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CHAT_LIMIT = parseInt(import.meta.env.VITE_CHAT_LIMIT || '10', 10);

export default function App() {
  const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{ type: 'summary' | 'mindmap', text: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gateCode, setGateCode] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [chatCount, setChatCount] = useState<number>(0);
  const [limitResetTime, setLimitResetTime] = useState<number | null>(null);
  const [timeLeftMinutes, setTimeLeftMinutes] = useState<number>(60);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when loading completes or module is changed
  useEffect(() => {
    if (!isLoading && selectedModule && chatCount < CHAT_LIMIT) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 50);
    }
  }, [isLoading, selectedModule, chatCount]);

  // Sync rate limit stats from LocalStorage on mount
  useEffect(() => {
    const savedCount = localStorage.getItem('lsk_chat_count');
    const savedTime = localStorage.getItem('lsk_chat_reset_time');
    const now = Date.now();
    
    if (savedCount && savedTime) {
      const resetTime = parseInt(savedTime, 10);
      if (now > resetTime) {
        const nextReset = now + 60 * 60 * 1000;
        localStorage.setItem('lsk_chat_count', '0');
        localStorage.setItem('lsk_chat_reset_time', nextReset.toString());
        setChatCount(0);
        setLimitResetTime(nextReset);
        setTimeLeftMinutes(60);
      } else {
        setChatCount(parseInt(savedCount, 10));
        setLimitResetTime(resetTime);
        setTimeLeftMinutes(Math.ceil((resetTime - now) / 60000));
      }
    } else {
      const targetReset = now + 60 * 60 * 1000;
      localStorage.setItem('lsk_chat_count', '0');
      localStorage.setItem('lsk_chat_reset_time', targetReset.toString());
      setChatCount(0);
      setLimitResetTime(targetReset);
      setTimeLeftMinutes(60);
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (limitResetTime) {
        const diff = limitResetTime - Date.now();
        if (diff <= 0) {
          const nextReset = Date.now() + 60 * 60 * 1000;
          localStorage.setItem('lsk_chat_count', '0');
          localStorage.setItem('lsk_chat_reset_time', nextReset.toString());
          setChatCount(0);
          setLimitResetTime(nextReset);
          setTimeLeftMinutes(60);
        } else {
          setTimeLeftMinutes(Math.ceil(diff / 60000));
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [limitResetTime]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Check for deep link on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modId = params.get('module') || params.get('m');
    const code = params.get('code') || params.get('key') || '';
    if (code) {
      setGateCode(code);
    }
    if (modId) {
      const foundModule = MODULES.find(m => m.id.toLowerCase() === modId.toLowerCase());
      if (foundModule) {
        startModule(foundModule, code);
      }
    }
  }, []);

  const copyEmbedLink = (modId: string) => {
    const embedUrl = `${window.location.origin}${window.location.pathname}?module=${modId}`;
    navigator.clipboard.writeText(embedUrl).then(() => {
      setCopiedId(modId);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const downloadAsImage = () => {
    const targetId = modalContent?.type === 'summary' ? 'summary-capture-target' : 'mindmap-capture-target';
    const element = document.getElementById(targetId);
    if (!element) return;

    setIsDownloading(true);
    setTimeout(() => {
      html2canvas(element, {
        backgroundColor: '#ffffff',
        useCORS: true,
        scale: 2,
        logging: false,
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `${selectedModule?.id || 'lensetek'}-${modalContent?.type || 'learning'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch((err) => {
        console.error('Failed to export image: ', err);
        alert('Failed to download as image. Please try again.');
      }).finally(() => {
        setIsDownloading(false);
      });
    }, 100);
  };

  const handleAnalyze = async (type: 'summary' | 'mindmap') => {
    if (chatCount >= CHAT_LIMIT) {
      alert(`Hourly quota reached! You cannot request a summary or mindmap. Quota resets in ${timeLeftMinutes} minutes.`);
      return;
    }
    if (messages.length === 0) {
      alert("No chat history to analyze. Please start a conversation with the mentor first!");
      return;
    }
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.map(m => ({ role: m.role, text: m.text })),
          type: type,
          code: gateCode
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        throw new Error(`Server returned non-JSON: ${responseText || response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menganalisis obrolan');
      }

      setModalContent({ type, text: data.text });
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startModule = async (mod: ModuleInfo, overrideCode?: string) => {
    setSelectedModule(mod);
    setMessages([]);
    
    // Simulate Elearning app sending the module code
    const initialText = `[CURRENT_MODULE: ${mod.id}]`;
    
    // We send this exact text directly to the API, but we won't show it as a User message in the UI 
    // to make the UX cleaner, OR we can show it so the user sees the trigger. Let's send it invisibly first.
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [],
          message: initialText,
          code: overrideCode || gateCode
        }),
      });
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        throw new Error(`Server returned non-JSON: ${responseText || response.statusText}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with mentor');
      }

      setMessages([{ id: generateId(), role: 'assistant', text: data.text }]);
    } catch (error: any) {
      setMessages([{ id: generateId(), role: 'assistant', text: `**Error:** ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    // Check hourly limit before processing
    const now = Date.now();
    let currentCount = chatCount;
    let currentReset = limitResetTime;

    if (currentReset && now > currentReset) {
      currentCount = 0;
      currentReset = now + 60 * 60 * 1000;
      localStorage.setItem('lsk_chat_count', '0');
      localStorage.setItem('lsk_chat_reset_time', currentReset.toString());
      setChatCount(0);
      setLimitResetTime(currentReset);
      setTimeLeftMinutes(60);
    }

    if (currentCount >= CHAT_LIMIT) {
      alert(`Hourly quota reached! You have used your limit of ${CHAT_LIMIT} chats. Quota resets in ${timeLeftMinutes} minutes.`);
      return;
    }
    
    const userMsg: ChatMessage = { id: generateId(), role: 'user', text: inputValue };
    const currentHistory = [...messages];
    
    setMessages([...currentHistory, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: currentHistory.map(m => ({ role: m.role, text: m.text })),
          message: userMsg.text,
          code: gateCode
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        throw new Error(`Server returned non-JSON: ${responseText || response.statusText}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setMessages(prev => [...prev, { id: generateId(), role: 'assistant', text: data.text }]);
      
      // Increment and update limit counts upon successful answer
      const newCount = currentCount + 1;
      localStorage.setItem('lsk_chat_count', newCount.toString());
      setChatCount(newCount);
    } catch (error: any) {
      setMessages(prev => [...prev, { id: generateId(), role: 'assistant', text: `**Error:** ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!selectedModule) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10 flex items-center gap-3">
           <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
             <img src="https://lensetek.com/favicon.png" alt="Lensetek Logo" className="w-7 h-7 object-contain" />
           </div>
           <div>
             <h1 className="font-semibold text-xs tracking-wider text-slate-700 uppercase leading-tight">Lensetek AI Mentor</h1>
             <p className="text-[10px] text-slate-500 font-medium">Virtual Lab Simulator</p>
           </div>
        </header>

        <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-8">
          <div className="mb-10 text-center max-w-2xl mx-auto mt-8 md:mt-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">Certification Module Catalog</h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Welcome to the practical simulator for "AI-Driven Digital Marketing Certification 1.4".
              Choose the module you want to learn or test interactively. Modules marked with "Lab" have special interactive scenarios.
            </p>
          </div>

          <div className="space-y-12">
            {Array.from(new Set(MODULES.map(m => m.category))).map(category => (
              <div key={category}>
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MODULES.filter(m => m.category === category).map((mod, index) => (
                    <div
                      key={mod.id}
                      className={cn(
                        "bg-white border rounded-lg p-4 transition-all group flex flex-col justify-between gap-3 relative hover:shadow-sm focus-within:ring-2 focus-within:ring-blue-500",
                        mod.isLab ? "border-blue-200 hover:border-blue-500" : "border-slate-200 hover:border-slate-400"
                      )}
                    >
                      <div 
                        onClick={() => startModule(mod)}
                        className="cursor-pointer flex-1 flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-start">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-wide",
                            mod.isLab ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                          )}>
                            <BookOpen className="w-3 h-3" />
                            {mod.id.toUpperCase()}
                          </span>
                          {mod.isLab && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded uppercase tracking-wider">Lab</span>
                          )}
                        </div>
                        <div>
                          <h4 className={cn(
                            "font-semibold text-sm mb-1 leading-tight transition-colors line-clamp-2",
                            mod.isLab ? "text-blue-900 group-hover:text-blue-600" : "text-slate-700 group-hover:text-slate-900"
                          )}>{mod.title}</h4>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Embed & Share</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyEmbedLink(mod.id);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                          title="Copy Embed Link"
                        >
                          {copiedId === mod.id ? (
                            <span className="text-green-600 font-semibold">Copied!</span>
                          ) : (
                            <>
                              <Link className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      <header className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 sticky top-0 z-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setSelectedModule(null);
              setMessages([]);
              window.history.pushState({}, '', window.location.pathname);
            }}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Kembali ke daftar modul"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h2 className="font-semibold text-xs tracking-wider uppercase text-slate-700 leading-tight">Virtual Mentor Session</h2>
            </div>
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-md">{selectedModule.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 hidden sm:flex">
          <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded">Status: Mentoring Active</span>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200">AD</div>
        </div>
      </header>
 
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-8 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
                  msg.role === 'user' 
                    ? "bg-slate-200 text-slate-800 font-bold text-xs" 
                    : "bg-white border border-slate-100 shadow-sm"
                )}>
                  {msg.role === 'user' ? "AD" : <img src="https://lensetek.com/favicon.png" alt="Lensetek Logo" className="w-8 h-8 object-contain" />}
                </div>
                
                <div className={cn(
                  "px-5 py-4 rounded-2xl text-[14px] leading-relaxed shadow-sm max-w-lg",
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none"
                )}>
                  <div className={cn(
                     "prose prose-sm sm:prose-base max-w-none break-words",
                    msg.role === 'user' ? "prose-invert" : "prose-slate"
                  )}>
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
 
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-[85%] mr-auto"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white border border-slate-100 shadow-sm overflow-hidden">
                <img src="https://lensetek.com/favicon.png" alt="Lensetek Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-slate-100 border border-slate-200 text-slate-800 shadow-sm flex items-center gap-2 max-w-lg">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-slate-500">Mentor is typing...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>
 
      <footer className="bg-white border-t border-slate-200 p-4 shrink-0 w-full z-10">
        <div className="max-w-3xl mx-auto">
          {chatCount >= CHAT_LIMIT && (
            <div className="mb-3 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800 font-semibold animate-pulse shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                <span>Hourly chat quota reached ({chatCount}/{CHAT_LIMIT}). Resets in {timeLeftMinutes} minutes.</span>
              </div>
              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Locked</span>
            </div>
          )}
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              ref={chatInputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={chatCount >= CHAT_LIMIT 
                ? `Hourly limit reached! Quota resets in ${timeLeftMinutes} minutes.` 
                : "Type your answer or analysis here..."
              }
              disabled={isLoading || chatCount >= CHAT_LIMIT}
              className="w-full h-12 bg-white border border-slate-300 rounded-xl px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading || chatCount >= CHAT_LIMIT}
              className="absolute right-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md disabled:opacity-50 disabled:hover:bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <div className="flex gap-4">
              <span className="text-[10px] text-slate-500 font-medium">Socratic Mode Enabled</span>
              <span className="text-[10px] text-slate-500 font-medium">•</span>
              <span className="text-[10px] text-slate-500 font-medium">Lab Module Live</span>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAnalyze('summary')}
                disabled={messages.length === 0 || isLoading || chatCount >= CHAT_LIMIT}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:hover:bg-blue-50 text-[10px] font-bold text-blue-700 transition-all cursor-pointer focus:outline-none"
                title="Summarize active chat session"
              >
                <FileText className="w-3 h-3" />
                <span>Summary</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleAnalyze('mindmap')}
                disabled={messages.length === 0 || isLoading || chatCount >= CHAT_LIMIT}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-violet-50 hover:bg-violet-100 disabled:opacity-40 disabled:hover:bg-violet-50 text-[10px] font-bold text-violet-700 transition-all cursor-pointer focus:outline-none"
                title="Generate concept mindmap"
              >
                <Brain className="w-3 h-3" />
                <span>Mindmap</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Analysis and Mindmap Modals */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          >
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Analyzing Learning...</h3>
                <p className="text-slate-500 text-sm mt-1">The mentor is processing your active session chat history.</p>
              </div>
            </div>
          </motion.div>
        )}

        {modalContent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={cn(
                "bg-white rounded-2xl shadow-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-100 transition-all duration-300",
                modalContent.type === 'summary' ? "max-w-2xl" : "max-w-4xl"
              )}
            >
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  {modalContent.type === 'summary' ? (
                    <FileText className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Brain className="w-5 h-5 text-blue-600" />
                  )}
                  <h3 className="font-bold text-slate-800 text-base md:text-lg">
                    {modalContent.type === 'summary' ? 'Session Learning Summary' : 'Session Concept Mindmap'}
                  </h3>
                </div>
                <button 
                  onClick={() => setModalContent(null)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors focus:outline-none cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-auto flex-1 text-sm md:text-base leading-relaxed text-slate-700 min-h-[400px] bg-slate-50/50 flex flex-col items-stretch">
                {modalContent.type === 'summary' ? (
                  <div id="summary-capture-target" className="prose prose-slate max-w-none prose-sm sm:prose-base markdown-body w-full bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <ReactMarkdown>{modalContent.text}</ReactMarkdown>
                  </div>
                ) : (
                  (() => {
                    let parsedMindmap = null;
                    try {
                      parsedMindmap = JSON.parse(modalContent.text);
                    } catch (e) {
                      console.error("Failed to parse mindmap JSON: ", e);
                    }
                    
                    return parsedMindmap ? (
                      <div className="w-full overflow-x-auto py-4 scrollbar-thin">
                        <div id="mindmap-capture-target" className="flex justify-start lg:justify-center items-start min-w-[700px] p-6 bg-white rounded-xl border border-slate-100 shadow-sm mx-auto">
                          <MindmapNodeComponent 
                            node={parsedMindmap} 
                            depth={0} 
                            isFirst={true} 
                            isLast={true} 
                            parentHasMultiple={false} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div id="mindmap-capture-target" className="prose prose-slate max-w-none prose-sm sm:prose-base markdown-body w-full bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <ReactMarkdown>{modalContent.text}</ReactMarkdown>
                      </div>
                    );
                  })()
                )}
              </div>
              
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                <button
                  onClick={downloadAsImage}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download as Image</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setModalContent(null)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
