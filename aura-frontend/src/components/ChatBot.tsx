import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, AlertCircle, Zap, Globe, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    analysis?: {
        sentiment: string;
        emotion: string;
        stressScore: number;
    };
}

const GEMINI_API_KEY = "AIzaSyAL94kBETX_b405rk4nAMCE8_dFwkWUXP8";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
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
            const prompt = `
                The user said: "${text}"
                You are Aura, a kind and supportive mental health assistant.
                Respond empathetically and naturally.
                
                Also analyze their message for:
                1. Sentiment (Positive, Neutral, or Negative)
                2. Emotion (like Happy, Sad, Anxious, or Angry)
                3. Stress Score (from 1 to 10, where 10 is a crisis)
                
                IMPORTANT: Return ONLY a JSON object like this:
                {"reply": "your message here", "sentiment": "Neutral", "emotion": "Calm", "stressScore": 5}
                Do not include markdown blocks like \`\`\`json.
            `;

            const response = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("No response from AI");
            }

            let resultText = data.candidates[0].content.parts[0].text;

            // Extract JSON if it's wrapped in something
            const jsonPart = resultText.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonPart ? jsonPart[0] : resultText);

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: parsed.reply,
                sender: 'bot',
                timestamp: new Date(),
                analysis: {
                    sentiment: parsed.sentiment,
                    emotion: parsed.emotion,
                    stressScore: keywordStress || parsed.stressScore || (parsed.sentiment === 'Negative' ? 7 : 2)
                }
            };

            setMessages(prev => [...prev, botMsg]);

            if (botMsg.analysis?.stressScore >= 9) {
                setShowCrisisAlert(true);
            }

        } catch (err) {
            console.error("Gemini Error:", err);
            const fallbackMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm here for you. Even when I have trouble speaking, I'm always listening. 🌿",
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
                        className="fixed bottom-32 right-8 w-[420px] h-[700px] glass-card flex flex-col z-[110] overflow-hidden bg-white/60 border-white/80 shadow-3xl"
                    >
                        {/* Header */}
                        <div className="p-10 bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-xl">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                                    <Bot size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tighter uppercase italic">Aura Chat</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-80">
                                        <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" /> Always Listening
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-3 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-white/20">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className={`max-w-[85%] p-6 rounded-[30px] shadow-sm ${msg.sender === 'user'
                                                ? 'bg-emerald-600 text-white rounded-tr-none'
                                                : 'bg-white text-emerald-900 rounded-tl-none border border-emerald-50'
                                            }`}
                                    >
                                        <p className="text-base font-medium leading-relaxed">{msg.text}</p>
                                    </motion.div>

                                    {msg.analysis && msg.sender === 'bot' && (
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="mt-4 p-5 bg-white/80 rounded-3xl border border-emerald-50 w-full max-w-[300px] space-y-3 shadow-lg"
                                        >
                                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-emerald-900/60">
                                                <span>Mood</span>
                                                <span className="text-emerald-600">{msg.analysis.emotion}</span>
                                            </div>
                                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-emerald-900 pt-2 border-t border-emerald-50">
                                                <span>Stress Score</span>
                                                <span className={msg.analysis.stressScore >= 7 ? 'text-red-500 font-black' : 'text-emerald-600 font-black'}>
                                                    {msg.analysis.stressScore}/10
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/80 px-6 py-4 rounded-[25px] flex gap-3 shadow-sm border border-emerald-50">
                                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" />
                                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
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
                        <div className="p-10 bg-white/80 border-t border-emerald-50">
                            <div className="relative flex items-center gap-4">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-white border border-emerald-100 rounded-[30px] px-8 py-6 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-base shadow-sm"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="w-20 h-20 rounded-[30px] bg-emerald-600 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
                                >
                                    <Send size={28} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
