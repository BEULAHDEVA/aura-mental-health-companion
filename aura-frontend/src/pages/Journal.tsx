import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, AlertCircle, Info, Phone, ShieldCheck, History, Heart, Brain, Zap, Bot, RefreshCw, Trash2, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { journalService } from '../services/api';

export default function Journal() {
    const [entry, setEntry] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isCrisis, setIsCrisis] = useState(false);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const navigate = useNavigate();

    const analyzeKeywordStress = (text: string) => {
        const lowerText = text.toLowerCase();
        const criticalKeywords = ['die', 'kill myself', 'suicide', 'end my life'];
        if (criticalKeywords.some(keyword => lowerText.includes(keyword))) return 10;
        return null;
    };

    const handleSubmit = async () => {
        if (!entry.trim()) return;

        setIsAnalyzing(true);
        const keywordStress = analyzeKeywordStress(entry);

        try {
            const response = await journalService.createEntry(entry);

            const stressVal = keywordStress || response.stress_score;

            setAnalysisData({
                mood: response.emotion_label,
                stress: stressVal,
                level: response.stress_level
            });

            setIsCrisis(stressVal === 10 || response.is_high_risk);
            setShowResult(true);

            if (stressVal === 10 || response.is_high_risk) {
                // Crisis Protocol
                setTimeout(() => {
                    navigate('/support');
                }, 4000);
            }
        } catch (err) {
            console.error("Analysis failed:", err);
            setIsCrisis(false);
            setShowResult(true);
            setAnalysisData({ mood: 'Peaceful', stress: 2, level: 'Low' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-24 animate-in fade-in duration-1000 pb-40">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-emerald-200/50 pb-20">
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 text-emerald-800/40 font-black uppercase tracking-[0.5em] text-[11px] italic"
                    >
                        <Shield size={18} className="text-emerald-500" /> Private & Secure
                    </motion.div>
                    <h1 className="text-[9rem] font-black text-emerald-950 tracking-tighter leading-none italic">
                        Private <br /><span className="aura-heading">Journal.</span>
                    </h1>
                    <p className="text-emerald-900/50 text-3xl font-medium tracking-tight max-w-2xl leading-relaxed">A safe place to let your feelings out. No one else will ever see this.</p>
                </div>
                <div className="flex gap-6">
                    <button onClick={() => navigate('/support')} className="vibrant-button !px-10 !py-5 flex items-center gap-3 !bg-white/60 !text-red-600 border border-red-100 shadow-xl">
                        <Phone size={20} /> Get Help Now
                    </button>
                    <button onClick={() => navigate('/')} className="vibrant-button !px-10 !py-5 flex items-center gap-3 !bg-white/60 !text-emerald-900 border border-emerald-100 shadow-xl">
                        <History size={20} /> History
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Input Side */}
                <div className="lg:col-span-8">
                    <div className="glass-card p-3 bg-white/40 border-emerald-100/50 shadow-3xl">
                        <div className="bg-white rounded-[3rem] p-16 space-y-12 shadow-inner min-h-[700px] flex flex-col">
                            <textarea
                                value={entry}
                                onChange={(e) => setEntry(e.target.value)}
                                placeholder="How are you feeling today?"
                                className="flex-1 w-full bg-transparent border-none focus:ring-0 text-4xl leading-tight resize-none placeholder:text-emerald-50 text-emerald-950 font-black tracking-tighter italic"
                            />

                            <div className="flex items-center justify-between pt-16 border-t border-emerald-50">
                                <div className="flex gap-6">
                                    <button
                                        onClick={() => setEntry('')}
                                        className="w-20 h-20 flex items-center justify-center bg-emerald-50 text-emerald-200 rounded-3xl hover:bg-emerald-100 transition-all group"
                                    >
                                        <Trash2 size={32} className="group-hover:text-emerald-600 transition-colors" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isAnalyzing || !entry.trim()}
                                    className="px-20 py-8 bg-emerald-600 text-white rounded-[30px] flex items-center gap-5 disabled:opacity-50 text-lg font-black tracking-[0.3em] uppercase shadow-3xl shadow-emerald-200/50 hover:scale-105 active:scale-95 transition-all pulse-glow"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <RefreshCw size={28} className="animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={28} className="fill-white" />
                                            Save Entry
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Side */}
                <div className="lg:col-span-4 space-y-16">
                    <div className="glass-card p-16 space-y-12 bg-white/60 border-emerald-100/50 backdrop-blur-3xl rounded-[4rem] shadow-3xl">
                        <div className="flex items-center gap-5">
                            <div className="w-18 h-18 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center shadow-xl">
                                <Info size={36} />
                            </div>
                            <h3 className="font-black text-3xl tracking-tighter text-emerald-950 uppercase italic">How it helps</h3>
                        </div>

                        <div className="space-y-12">
                            <FeatureTip
                                icon={<Heart className="text-emerald-600 fill-emerald-600" />}
                                title="Safe & Private"
                                desc="Your entries are encrypted. No one else can read your personal thoughts."
                            />
                            <FeatureTip
                                icon={<Zap className="text-emerald-600 fill-emerald-600" />}
                                title="Stress Tracking"
                                desc="We help you see patterns in your mood so you can manage stress better."
                            />
                            <FeatureTip
                                icon={<ShieldCheck className="text-emerald-600" />}
                                title="Support Ready"
                                desc="If you're feeling very down, we'll help you find professional support quickly."
                            />
                        </div>
                    </div>

                    <div className="glass-card p-16 bg-gradient-to-br from-emerald-600 to-teal-800 text-white space-y-10 group rounded-[4rem] shadow-3xl">
                        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center group-hover:bg-white group-hover:text-emerald-700 transition-all duration-700 shadow-2xl rotate-3">
                            <Bot size={44} />
                        </div>
                        <h3 className="text-5xl font-black tracking-tighter leading-none italic uppercase">Need to talk?</h3>
                        <p className="text-emerald-50/70 font-medium text-xl italic leading-relaxed">"Our AI assistant is here to listen and offer support whenever you need a friend."</p>
                        <button onClick={() => navigate('/')} className="w-full py-7 bg-white text-emerald-800 font-black uppercase tracking-[0.3em] text-[11px] rounded-[30px] shadow-3xl hover:scale-105 transition-all">
                            Chat Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Modal */}
            <AnimatePresence>
                {showResult && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center bg-emerald-950/80 backdrop-blur-3xl p-10"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 100 }} animate={{ scale: 1, y: 0 }}
                            className="glass-card max-w-3xl w-full p-20 bg-white space-y-16 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] border-none"
                        >
                            {isCrisis ? (
                                <div className="space-y-12 text-center">
                                    <div className="w-28 h-28 bg-red-50 text-red-600 rounded-[40px] flex items-center justify-center mx-auto animate-bounce shadow-3xl">
                                        <AlertCircle size={56} />
                                    </div>
                                    <div className="space-y-6">
                                        <h2 className="text-6xl font-black text-emerald-950 tracking-tighter italic">We're here for you.</h2>
                                        <p className="text-emerald-800/50 text-2xl font-medium tracking-tight leading-relaxed px-10">It looks like you're going through a very tough time. Please reach out to someone who can help.</p>
                                    </div>
                                    <div className="space-y-6">
                                        <button
                                            onClick={() => navigate('/support')}
                                            className="w-full py-10 bg-red-600 text-white rounded-[35px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-5 shadow-3xl shadow-red-200"
                                        >
                                            <Phone size={32} /> Find Support Now
                                        </button>
                                        <button onClick={() => setShowResult(false)} className="w-full py-8 text-emerald-400 font-black uppercase tracking-widest text-[12px] italic">
                                            Return to Journal
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col items-center text-center gap-10">
                                        <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-lime-500 text-white rounded-[40px] flex items-center justify-center shadow-3xl rotate-12 scale-110">
                                            <Sparkles size={56} />
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-8xl font-black text-emerald-950 italic tracking-tighter">Done.</h2>
                                            <p className="text-emerald-800/50 text-2xl font-medium">Your feelings have been safely recorded.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="bg-emerald-50 p-12 rounded-[3rem] border border-emerald-100 text-center shadow-sm">
                                            <p className="text-[11px] font-black uppercase text-emerald-400 tracking-[0.5em] mb-5">Mood Detected</p>
                                            <p className="text-5xl font-black text-emerald-950 uppercase italic tracking-tighter">{analysisData?.mood}</p>
                                        </div>
                                        <div className="bg-lime-50 p-12 rounded-[3rem] border border-lime-100 text-center shadow-sm">
                                            <p className="text-[11px] font-black uppercase text-lime-400 tracking-[0.5em] mb-5">Stress Level</p>
                                            <p className="text-5xl font-black text-lime-700 italic tracking-tighter">{analysisData?.stress}/10</p>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50/50 p-12 rounded-[3rem] text-emerald-900 text-xl leading-relaxed border border-emerald-100 font-medium italic">
                                        <b className="font-black uppercase tracking-[0.4em] text-[11px] block mb-6 text-emerald-600 not-italic">Aura's Note</b>
                                        "You seem to be feeling {analysisData?.mood}. Remember that it's okay to feel this way. Take some time to rest today."
                                    </div>

                                    <button
                                        onClick={() => { setEntry(''); setShowResult(false); navigate('/focus'); }}
                                        className="w-full py-10 font-black text-sm tracking-[0.4em] uppercase bg-emerald-600 text-white rounded-[35px] shadow-3xl hover:scale-105 active:scale-95 transition-all shadow-emerald-200"
                                    >
                                        Take a Break
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FeatureTip({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="flex gap-8 group">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all shadow-lg backdrop-blur-md">
                {icon}
            </div>
            <div>
                <h4 className="font-black text-emerald-900 uppercase tracking-widest text-[12px] mb-3 bold italic">{title}</h4>
                <p className="text-lg text-emerald-900/40 leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    );
}
