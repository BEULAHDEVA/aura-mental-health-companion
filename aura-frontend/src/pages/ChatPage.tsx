import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, AlertCircle, Zap, Globe, ShieldCheck, Database, Cpu, MessageSquare, ArrowLeft, History, Trash2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { chatService } from '../services/api';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    model?: string;
    analysis?: {
        sentiment: string;
        emotion: string;
        stressScore: number;
    };
}

export default function ChatPage() {
    const [modelType, setModelType] = useState<'gemini' | 'aura'>('gemini');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Welcome to your safe space. I'm Aura, and I'm here to listen without judgment. How are you feeling right now? 🌿",
            sender: 'bot',
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCrisisAlert, setShowCrisisAlert] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const analyzeKeywordStress = (text: string) => {
        const lowerText = text.toLowerCase();
        const criticalKeywords = ['die', 'kill myself', 'suicide', 'end my life', 'hurt myself'];
        if (criticalKeywords.some(keyword => lowerText.includes(keyword))) return 10;
        return null;
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const text = input;
        const keywordStress = analyzeKeywordStress(text);

        const userMsg: Message = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        if (keywordStress === 10) setShowCrisisAlert(true);

        try {
            const response = await chatService.sendMessage(text, modelType);

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response.reply,
                sender: 'bot',
                timestamp: new Date(),
                model: modelType,
                analysis: response.analysis ? {
                    sentiment: response.analysis.sentiment,
                    emotion: response.analysis.emotion_detected,
                    stressScore: keywordStress || response.analysis.stress_score
                } : undefined
            };

            setMessages(prev => [...prev, botMsg]);
            if (botMsg.analysis?.stressScore && botMsg.analysis.stressScore >= 9) setShowCrisisAlert(true);
        } catch (err) {
            console.error("Chat Error:", err);
            const fallbackMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having a little trouble connecting to my local brain. Let's try again in a moment. 🌿",
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, fallbackMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto h-[85vh] flex flex-col gap-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-emerald-200/50 pb-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-emerald-800/40 font-black uppercase tracking-[0.5em] text-[10px] italic">
                        <Shield size={16} className="text-emerald-500" /> Private Conversation
                    </div>
                    <h1 className="text-7xl font-black text-emerald-950 tracking-tighter italic">Aura <span className="text-emerald-600">Assistant.</span></h1>
                    <p className="text-xl text-emerald-900/60 font-medium">A dedicated space for deep reflection and support.</p>
                </div>

                <div className="flex bg-white/60 p-2 rounded-[2.5rem] border border-emerald-100 shadow-xl backdrop-blur-md w-full md:w-[450px]">
                    <button
                        onClick={() => setModelType('gemini')}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all ${modelType === 'gemini' ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-900/40 hover:text-emerald-900'}`}
                    >
                        <Sparkles size={18} /> Cloud AI
                    </button>
                    <button
                        onClick={() => setModelType('aura')}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all ${modelType === 'aura' ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-900/40 hover:text-emerald-900'}`}
                    >
                        <Cpu size={18} /> Mini-Aura
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 overflow-hidden">
                {/* Chat Main Area */}
                <div className="lg:col-span-8 flex flex-col glass-card bg-white/40 border-emerald-100/50 shadow-3xl overflow-hidden rounded-[3rem]">
                    <div className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/30">
                                        {msg.sender === 'user' ? 'You' : `Aura Assistant ${msg.model === 'aura' ? '(Local)' : '(Cloud)'}`}
                                    </span>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className={`max-w-[85%] p-8 rounded-[35px] shadow-sm text-lg font-medium leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-emerald-600 text-white rounded-tr-none'
                                        : 'bg-white text-emerald-950 rounded-tl-none border border-emerald-50 shadow-xl'
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                </motion.div>

                                {msg.analysis && msg.sender === 'bot' && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="mt-6 p-6 bg-white rounded-[2rem] border border-emerald-50 w-full max-w-[350px] space-y-4 shadow-2xl"
                                    >
                                        <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-emerald-900/40">
                                            <span>Session Insight</span>
                                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full italic">{msg.analysis.emotion}</span>
                                        </div>
                                        <div className="h-2 bg-emerald-50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${msg.analysis.stressScore * 10}%` }}
                                                className={`h-full transition-all duration-1000 ${msg.analysis.stressScore >= 7 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-emerald-950">
                                            <span>Stress Level</span>
                                            <span className={msg.analysis.stressScore >= 7 ? 'text-red-600 font-black' : 'text-emerald-700 font-black'}>
                                                {msg.analysis.stressScore}/10
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white px-8 py-5 rounded-[25px] flex gap-3 shadow-xl border border-emerald-50">
                                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" />
                                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-10 bg-white border-t border-emerald-50">
                        <div className="relative flex items-center gap-6">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={modelType === 'aura' ? "Deep learning mode active..." : "Type your feelings here..."}
                                className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-[35px] px-10 py-7 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-xl shadow-inner"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="w-24 h-24 rounded-[35px] bg-emerald-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-emerald-200 disabled:opacity-50"
                            >
                                <Send size={32} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-12 overflow-y-auto no-scrollbar">
                    <div className="glass-card p-12 bg-white/80 border-emerald-100 space-y-8 shadow-3xl rounded-[3rem]">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <History size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-emerald-950 uppercase tracking-tighter italic">About Mini-Aura</h3>
                        </div>
                        <p className="text-lg text-emerald-900/60 font-medium leading-relaxed">
                            Mini-Aura is a **Private Transformer Model** trained on thousands of therapy conversations.
                            It runs locally on your device, meaning your messages never leave this computer.
                        </p>
                        <div className="pt-6 border-t border-emerald-100 flex flex-col gap-4">
                            <SidebarMetric label="Privacy Level" value="100% Local" />
                            <SidebarMetric label="Current Goal" value="Empathetic Support" />
                        </div>
                    </div>

                    <div className="glass-card p-12 bg-gradient-to-br from-red-50 to-orange-50 border-red-100 space-y-8 shadow-2xl rounded-[3rem]">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                                <AlertCircle size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-red-950 uppercase tracking-tighter italic">Help is Here</h3>
                        </div>
                        <p className="text-lg text-red-800/60 font-medium leading-relaxed italic">
                            "If you ever feel like things are getting too heavy, please don't hesitate to reach out to professional help."
                        </p>
                        <button
                            onClick={() => navigate('/support')}
                            className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all"
                        >
                            Emergency Resources
                        </button>
                    </div>
                </div>
            </div>

            {/* Crisis Modal */}
            <AnimatePresence>
                {showCrisisAlert && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[150] bg-emerald-950/90 backdrop-blur-3xl flex items-center justify-center p-12"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="glass-card max-w-2xl w-full p-20 bg-white space-y-12 text-center rounded-[4rem] shadow-3xl"
                        >
                            <div className="w-28 h-28 bg-red-50 text-red-600 rounded-[40px] flex items-center justify-center mx-auto shadow-xl">
                                <AlertCircle size={56} />
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-6xl font-black text-emerald-950 tracking-tighter italic">We care about you.</h2>
                                <p className="text-emerald-800/50 text-2xl font-medium leading-relaxed">Please connect with a professional who can offer live, empathetic support right now.</p>
                            </div>
                            <div className="flex flex-col gap-6">
                                <button
                                    onClick={() => navigate('/support')}
                                    className="w-full py-8 bg-red-600 text-white rounded-[30px] font-black uppercase tracking-widest text-xs shadow-2xl"
                                >
                                    Get Help Now
                                </button>
                                <button onClick={() => setShowCrisisAlert(false)} className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Continue Chatting</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SidebarMetric({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center text-[11px]">
            <span className="font-black uppercase tracking-widest text-emerald-950/30 italic">{label}</span>
            <span className="font-black text-emerald-700">{value}</span>
        </div>
    );
}
