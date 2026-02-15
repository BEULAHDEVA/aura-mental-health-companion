import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, AlertCircle, Zap, Globe, ShieldCheck, Database, Cpu } from 'lucide-react';
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

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [modelType, setModelType] = useState<'gemini' | 'aura'>('gemini');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi! I'm Aura. I'm here to listen. How are you feeling today? 🌿",
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
        if (criticalKeywords.some(keyword => lowerText.includes(keyword))) {
            return 10;
        }
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

        if (keywordStress === 10) {
            setShowCrisisAlert(true);
        }

        try {
            // Send to our backend which handles both Gemini and Local Mini-Aura
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

            if (botMsg.analysis?.stressScore >= 9) {
                setShowCrisisAlert(true);
            }

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
        <div className="z-[100]">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="w-20 h-20 rounded-[25px] bg-emerald-600 shadow-2xl flex items-center justify-center cursor-pointer text-white border-2 border-white/40 group hover:bg-emerald-700 transition-all duration-500 pulse-glow"
            >
                <MessageCircle size={32} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 100 }}
                        className="fixed bottom-32 right-8 w-[450px] h-[750px] glass-card flex flex-col z-[110] overflow-hidden bg-white/60 border-white/80 shadow-[0_50px_100px_rgba(0,0,0,0.15)]"
                    >
                        {/* Header */}
                        <div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex flex-col gap-6 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                        <Bot size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tighter uppercase italic">Aura Chat</h3>
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-80">
                                            <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" /> Live Support
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Model Switcher */}
                            <div className="flex bg-black/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                                <button
                                    onClick={() => setModelType('gemini')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modelType === 'gemini' ? 'bg-white text-emerald-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
                                >
                                    <Sparkles size={14} /> Gemini Cloud
                                </button>
                                <button
                                    onClick={() => setModelType('aura')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modelType === 'aura' ? 'bg-white text-emerald-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
                                >
                                    <Cpu size={14} /> Mini-Aura Local
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-emerald-50/10">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-900/30">
                                            {msg.sender === 'user' ? 'You' : `Aura ${msg.model === 'aura' ? '(Local)' : '(Cloud)'}`}
                                        </span>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className={`max-w-[85%] p-5 rounded-[25px] shadow-sm ${msg.sender === 'user'
                                            ? 'bg-emerald-600 text-white rounded-tr-none'
                                            : 'bg-white text-emerald-900 rounded-tl-none border border-emerald-100'
                                            }`}
                                    >
                                        <p className="text-[15px] font-medium leading-relaxed">{msg.text}</p>
                                    </motion.div>

                                    {msg.analysis && msg.sender === 'bot' && (
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="mt-3 p-4 bg-white/80 rounded-2xl border border-emerald-50 w-full max-w-[280px] space-y-2.5 shadow-md"
                                        >
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-900/50">
                                                <span>Mood</span>
                                                <span className="text-emerald-600 font-black italic">{msg.analysis.emotion}</span>
                                            </div>
                                            <div className="h-1 bg-emerald-50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${msg.analysis.stressScore * 10}%` }}
                                                    className={`h-full ${msg.analysis.stressScore >= 7 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-900 pt-1">
                                                <span>Stress Score</span>
                                                <span className={msg.analysis.stressScore >= 7 ? 'text-red-500 font-extrabold' : 'text-emerald-700 font-extrabold'}>
                                                    {msg.analysis.stressScore}/10
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/80 px-6 py-4 rounded-[22px] flex gap-2.5 shadow-sm border border-emerald-100">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Crisis Alert Modal */}
                        <AnimatePresence>
                            {showCrisisAlert && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="absolute inset-0 z-[120] bg-emerald-950/95 backdrop-blur-3xl flex items-center justify-center p-10 text-center text-white"
                                >
                                    <div className="space-y-10">
                                        <div className="w-24 h-24 bg-white text-red-600 rounded-[35px] flex items-center justify-center mx-auto shadow-2xl rotate-12">
                                            <AlertCircle size={48} />
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-4xl font-black tracking-tighter italic">We're here for you.</h4>
                                            <p className="text-emerald-100/70 font-medium">It sounds like you're going through a lot. Please reach out to a professional counselor who can offer real-time support.</p>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <button
                                                onClick={() => navigate('/support')}
                                                className="w-full py-7 bg-white text-red-600 rounded-[30px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-3xl hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <Globe size={24} /> Get Support Now
                                            </button>
                                            <button
                                                onClick={() => setShowCrisisAlert(false)}
                                                className="w-full py-5 bg-white/10 text-white rounded-[30px] font-black uppercase tracking-widest text-[10px] border border-white/20 hover:bg-white/20"
                                            >
                                                Keep Chatting
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Area */}
                        <div className="p-8 bg-white border-t border-emerald-50">
                            <div className="relative flex items-center gap-4">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={modelType === 'aura' ? "Asking Mini-Aura (Local)..." : "Asking Gemini (Cloud)..."}
                                    className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-[25px] px-6 py-5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-sm shadow-inner"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="w-16 h-16 rounded-[22px] bg-emerald-600 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
                                >
                                    <Send size={24} />
                                </button>
                            </div>
                            <p className="text-center mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-emerald-900/30">
                                {modelType === 'aura' ? 'Private Local Mode Active' : 'Cloud Intelligence Active'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
