import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import {
  MessageCircle, Send, Bot, User, Loader2, Sparkles,
  Mic, MicOff, Copy, Check, Leaf, Zap, BookOpen, ShieldCheck,
  Trash2, Plus, History, ChevronDown, X
} from 'lucide-react';

// ─── Markdown-like rich text renderer ────────────────────────────────────────
function RichText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed === '') return <div key={i} className="h-1" />;

        const renderBold = (str) => {
          const parts = str.split(/\*\*(.*?)\*\*/g);
          return parts.map((part, j) =>
            j % 2 === 1
              ? <strong key={j} className="font-semibold text-gray-900 dark:text-white">{part}</strong>
              : part
          );
        };

        if (trimmed.startsWith('### ')) return <p key={i} className="font-bold text-base mt-3 text-gray-900 dark:text-white">{renderBold(trimmed.slice(4))}</p>;
        if (trimmed.startsWith('## ')) return <p key={i} className="font-bold text-lg mt-3 text-gray-900 dark:text-white">{renderBold(trimmed.slice(3))}</p>;

        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-green-500 mt-0.5 shrink-0">•</span>
              <p className="flex-1">{renderBold(trimmed.slice(2))}</p>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\./)[1];
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-green-500 font-bold shrink-0 w-4">{num}.</span>
              <p className="flex-1">{renderBold(trimmed.replace(/^\d+\.\s/, ''))}</p>
            </div>
          );
        }

        return <p key={i}>{renderBold(trimmed)}</p>;
      })}
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 150, 300].map((delay, i) => (
        <span
          key={i}
          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

// ─── Seasonal suggestions ─────────────────────────────────────────────────────
function getSeasonalSuggestions() {
  const month = new Date().getMonth();
  const isKharif = month >= 5 && month <= 9;
  const isRabi = month >= 10 || month <= 2;

  const base = [
    { icon: '🛡️', label: 'Government Schemes' },
    { icon: '🧪', label: 'Soil & Fertilizer Guide' },
    { icon: '📊', label: 'MSP Prices 2024-25' },
  ];

  if (isKharif) {
    return [
      { icon: '🌿', label: 'Cotton farming guide' },
      { icon: '🥜', label: 'Groundnut sowing tips' },
      { icon: '🌾', label: 'Rice cultivation' },
      { icon: '🌧️', label: 'Monsoon crop protection' },
      ...base,
    ];
  }
  if (isRabi) {
    return [
      { icon: '🌾', label: 'How to grow Wheat?' },
      { icon: '🌿', label: 'Cumin farming guide' },
      { icon: '🧅', label: 'Onion cultivation tips' },
      { icon: '🌻', label: 'Mustard farming' },
      ...base,
    ];
  }
  return [
    { icon: '🍉', label: 'Summer crop guide' },
    { icon: '💧', label: 'Drip Irrigation Guide' },
    { icon: '🐛', label: 'Pest Control Tips' },
    ...base,
  ];
}

const INITIAL_GREETING = {
  sender: 'Bot',
  message: 'Namaste! 🌱 I\'m **GrowFarm AI**, your personal agricultural expert powered by Google Gemini.\n\nI can help you with:\n• **Crop growing guides** — Wheat, Rice, Cotton, Groundnut, Cumin & 20+ crops\n• **Disease identification** — or upload a photo in Disease Detection\n• **Soil & fertilizer** planning with NPK recommendations\n• **Government schemes** — PM-KISAN, PMFBY, KCC, iKhedut & subsidies\n• **Gujarat-specific farming** — seasonal calendars & local varieties\n• **MSP prices** — 2024-25 official rates\n• **Organic farming** — Jeevamrit, ZBNF, Vermicompost\n• **Dairy & livestock** — Gir cow, poultry, goat farming\n\nAsk me anything — I understand English, Hindi & Gujarati farming terms! 😊',
  quickReplies: [],
  timestamp: new Date(),
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);
  const chatEnd = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load chat history on mount
  useEffect(() => {
    if (historyLoaded) return;
    (async () => {
      try {
        const { data } = await api.get('/chat/history');
        if (data.messages?.length > 0) {
          setMessages([INITIAL_GREETING, ...data.messages.map(m => ({
            ...m,
            timestamp: m.createdAt || new Date(),
          }))]);
        }
      } catch (e) {
        console.log('[ChatPage] No history or not logged in');
      }
      setHistoryLoaded(true);
    })();
  }, [historyLoaded]);

  // Speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        setInput(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const history = messages.filter((m, i) => i > 0).map(m => ({
      sender: m.sender,
      message: m.message,
    }));

    setMessages(prev => [...prev, { sender: 'User', message: msg, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat/message', { message: msg, history: history.slice(-20) });
      setMessages(prev => [...prev, { ...data, timestamp: new Date() }]);
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.message || 'Unknown error';
      console.error('[ChatPage] Request failed:', serverMsg);
      setMessages(prev => [...prev, {
        sender: 'Bot',
        message: `⚠️ Request failed: ${serverMsg}\n\nPlease make sure you are logged in and try again.`,
        quickReplies: ['How to grow Rice?', 'Government Schemes'],
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, messages]);

  const copyMessage = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const clearChat = async () => {
    try {
      await api.delete('/chat/history');
    } catch (e) { /* ignore */ }
    setMessages([INITIAL_GREETING]);
  };

  const loadSessions = async () => {
    try {
      const { data } = await api.get('/chat/sessions');
      setSessions(data);
      setShowHistory(true);
    } catch (e) { console.log('No sessions'); }
  };

  const showSuggestions = messages.length <= 1;
  const INITIAL_SUGGESTIONS = getSeasonalSuggestions();

  return (
    <AnimatedPage className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* ── Header ── */}
      <div className="relative px-6 py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-indigo-600/20 animate-pulse" />
        <div className="relative flex items-center gap-4 max-w-4xl mx-auto w-full">
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-purple-600 animate-pulse" />
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg flex items-center gap-2">
              GrowFarm AI <Sparkles className="w-4 h-4 text-amber-300" />
            </h1>
            <p className="text-purple-200 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Powered by Google Gemini 2.0 · Expert in Indian Agriculture
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={loadSessions}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              title="Chat History"
            >
              <History className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={clearChat}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="hidden md:flex gap-3 text-white/70 text-xs">
            <div className="flex flex-col items-center gap-1">
              <Leaf className="w-4 h-4 text-green-300" />
              <span>Crops</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-blue-300" />
              <span>Schemes</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Knowledge</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap className="w-4 h-4 text-purple-300" />
              <span>AI Powered</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── History Sidebar ── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4" /> Chat History
              </h2>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {sessions.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">No past chats yet</p>
              )}
              {sessions.map((s, i) => (
                <div key={s._id || i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-1 truncate">{s.lastMessage}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(s.updatedAt).toLocaleDateString('en-IN')}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

          {/* Suggestion chips */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-2 pb-2"
              >
                {INITIAL_SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(s.label)}
                    className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-left text-sm text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-xs font-medium">{s.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[88%] ${msg.sender === 'User' ? 'flex-row-reverse' : ''}`}>
                  <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
                    msg.sender === 'User'
                      ? 'bg-gradient-to-br from-primary-500 to-primary-700'
                      : 'bg-gradient-to-br from-purple-500 to-violet-600'
                  }`}>
                    {msg.sender === 'User'
                      ? <User className="w-4 h-4 text-white" />
                      : <Bot className="w-4 h-4 text-white" />}
                  </div>

                  <div className="space-y-2 min-w-0">
                    <div className={`relative group px-4 py-3 rounded-2xl ${
                      msg.sender === 'User'
                        ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-tr-md shadow-lg shadow-primary-500/20'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-tl-md shadow-md border border-gray-100 dark:border-gray-700'
                    }`}>
                      {msg.sender === 'User'
                        ? <p className="text-sm leading-relaxed">{msg.message}</p>
                        : <RichText text={msg.message} />
                      }

                      {msg.sender === 'Bot' && (
                        <button
                          onClick={() => copyMessage(msg.message, i)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {copiedIndex === i
                            ? <Check className="w-3.5 h-3.5 text-green-500" />
                            : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                        </button>
                      )}
                    </div>

                    {msg.quickReplies?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.quickReplies.map((qr, j) => (
                          <motion.button
                            key={j}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => sendMessage(qr)}
                            className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors shadow-sm"
                          >
                            {qr}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {msg.timestamp && (
                      <p className={`text-[10px] text-gray-400 ${msg.sender === 'User' ? 'text-right' : ''}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 items-end">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md shadow-md border border-gray-100 dark:border-gray-700">
                  <TypingDots />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEnd} />
        </div>
      </div>

      {/* ── Input Bar ── */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-2"
          >
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={toggleVoice}
              className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>

            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? '🎤 Listening...' : 'Ask about crops, diseases, schemes, soil...'}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all disabled:opacity-60"
            />

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              disabled={loading || !input.trim()}
              className="shrink-0 w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </motion.button>
          </form>
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-2">
            GrowFarm AI · Powered by Google Gemini 2.5 Flash · Expert agricultural guidance
          </p>
        </div>
      </div>
    </AnimatedPage>
  );
}
