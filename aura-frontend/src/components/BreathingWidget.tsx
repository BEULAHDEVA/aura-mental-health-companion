import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

export default function BreathingWidget() {
    const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
    const [isMinimized, setIsMinimized] = useState(true);

    useEffect(() => {
        let timer: any;
        if (phase === 'Inhale') {
            timer = setTimeout(() => setPhase('Hold'), 4000);
        } else if (phase === 'Hold') {
            timer = setTimeout(() => setPhase('Exhale'), 4000);
        } else {
            timer = setTimeout(() => setPhase('Inhale'), 4000);
        }
        return () => clearTimeout(timer);
    }, [phase]);

    return (
        <motion.div
            layout
            className="glass-card shadow-3xl border-emerald-100/50 bg-white/60 overflow-hidden flex flex-col pointer-events-auto"
            style={{ width: isMinimized ? '80px' : '260px' }}
        >
            <div className={`p-5 flex items-center ${isMinimized ? 'justify-center' : 'justify-between'} border-b border-emerald-50 bg-emerald-50/20`}>
                {!isMinimized && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                            <Wind size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900 italic">Core Sync</span>
                    </div>
                )}
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="w-10 h-10 rounded-xl hover:bg-emerald-100/50 flex items-center justify-center text-emerald-600 transition-all"
                >
                    {isMinimized ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {!isMinimized && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-8 flex flex-col items-center space-y-8"
                    >
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <motion.div
                                animate={{
                                    scale: phase === 'Inhale' ? 1.4 : phase === 'Hold' ? 1.4 : 1,
                                    rotate: phase === 'Inhale' ? 0 : phase === 'Hold' ? 180 : 360
                                }}
                                transition={{ duration: 4, ease: "easeInOut" }}
                                className="absolute inset-0 rounded-[45px] bg-gradient-to-br from-emerald-500 to-lime-500 blur-2xl opacity-20"
                            />
                            <motion.div
                                animate={{
                                    scale: phase === 'Inhale' ? 1.2 : phase === 'Hold' ? 1.2 : 1,
                                }}
                                transition={{ duration: 4, ease: "easeInOut" }}
                                className="w-24 h-24 rounded-[30px] bg-white shadow-3xl border border-emerald-50 flex items-center justify-center text-emerald-600"
                            >
                                <Sparkles size={32} className={phase === 'Hold' ? 'animate-pulse' : ''} />
                            </motion.div>
                        </div>

                        <div className="text-center space-y-2">
                            <motion.h4
                                key={phase}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-2xl font-black text-emerald-950 uppercase italic tracking-tighter"
                            >
                                {phase}
                            </motion.h4>
                            <p className="text-[9px] font-black text-emerald-800/40 uppercase tracking-[0.3em]">Neural Balancing</p>
                        </div>

                        <div className="flex gap-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${(phase === 'Inhale' && i === 1) ||
                                        (phase === 'Hold' && i === 2) ||
                                        (phase === 'Exhale' && i === 3)
                                        ? 'bg-emerald-600 w-12' : 'bg-emerald-100'
                                    }`} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
