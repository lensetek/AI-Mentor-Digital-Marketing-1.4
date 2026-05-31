import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, ChevronLeft, Loader2, Sparkles, BookOpen, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

export default function App() {
  const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (modId) {
      const foundModule = MODULES.find(m => m.id.toLowerCase() === modId.toLowerCase());
      if (foundModule) {
        startModule(foundModule);
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

  const startModule = async (mod: ModuleInfo) => {
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
        }),
      });
      
      const data = await response.json();
      
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
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setMessages(prev => [...prev, { id: generateId(), role: 'assistant', text: data.text }]);
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
            <h2 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">Katalog Modul Sertifikasi</h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Selamat datang di simulator praktik "AI-Driven Digital Marketing Certification 1.4".
              Pilih modul yang ingin Anda pelajari atau uji secara interaktif. Modul bertanda bintang (Lab) memiliki skenario interaktif khusus.
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
                          title="Salin Link Embed"
                        >
                          {copiedId === mod.id ? (
                            <span className="text-green-600 font-semibold">Tersalin!</span>
                          ) : (
                            <>
                              <Link className="w-3.5 h-3.5" />
                              <span>Salin Link</span>
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32 scroll-smooth">
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
                <span className="text-sm font-medium text-slate-500">Mentor sedang mengetik...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 shrink-0 fixed bottom-0 w-full lg:static">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik jawaban atau analisis Anda di sini..."
              disabled={isLoading}
              className="w-full h-12 bg-white border border-slate-300 rounded-xl px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md disabled:opacity-50 disabled:hover:bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex gap-4 mt-2">
            <span className="text-[10px] text-slate-500 font-medium">Socratic Mode Enabled</span>
            <span className="text-[10px] text-slate-500 font-medium">•</span>
            <span className="text-[10px] text-slate-500 font-medium">Lab Module Live</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
