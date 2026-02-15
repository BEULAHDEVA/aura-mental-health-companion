import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Zap, Heart, Info } from 'lucide-react';

interface Bubble {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
}

export default function RageRoom() {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [score, setScore] = useState(0);
    const [showComplete, setShowComplete] = useState(false);
    const popAudio = useRef<HTMLAudioElement | null>(null);

    const colors = [
        '#10b981', // Emerald
        '#84cc16', // Lime
        '#22c55e', // Green
        '#14b8a6', // Teal
        '#f472b6', // Pink
    ];

    useEffect(() => {
        popAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
        popAudio.current.volume = 0.2;

        const interval = setInterval(() => {
            if (bubbles.length < 25) {
                const newBubble: Bubble = {
                    id: Date.now() + Math.random(),
                    x: Math.random() * (window.innerWidth - 100) + 50,
                    y: window.innerHeight + 100,
                    size: Math.random() * 40 + 50,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    speed: Math.random() * 0.8 + 0.4, // Gentle speed
                };
                setBubbles(prev => [...prev, newBubble]);
            }
        }, 700);

        return () => clearInterval(interval);
    }, [bubbles]);

    useEffect(() => {
        let animationFrame: number;
        const update = () => {
            setBubbles(prev => prev
                .map(b => ({ ...b, y: b.y - b.speed }))
                .filter(b => b.y > -150)
            );
            setParticles(prev => prev
                .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.1 }))
                .filter(p => p.y < window.innerHeight + 100)
            );
            animationFrame = requestAnimationFrame(update);
        };
        animationFrame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    const popBubble = (bubble: Bubble) => {
        setBubbles(prev => prev.filter(b => b.id !== bubble.id));
        setScore(s => s + 1);

        // Spawn particles
        const newParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => ({
            id: Date.now() + i,
            x: bubble.x + bubble.size / 2,
            y: bubble.y + bubble.size / 2,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            color: bubble.color
        }));
        setParticles(prev => [...prev, ...newParticles].slice(-100));

        if (popAudio.current) {
            popAudio.current.currentTime = 0;
            popAudio.current.play().catch(() => { });
        }

        if (score + 1 >= 50) {
            setShowComplete(true);
        }
    };

    return (
        <div className="relative h-[85vh] w-full overflow-hidden cursor-crosshair bg-emerald-50/20 rounded-[3rem] border-2 border-dashed border-emerald-100/50">
            <div className="absolute top-12 left-12 z-10 space-y-6">
                <div>
                    <h1 className="text-7xl font-black text-emerald-950 tracking-tighter italic">Zen Pop.</h1>
                    <p className="text-xl text-emerald-900/60 font-medium">Breathe and pop the bubbles. Let your worries float away.</p>
                </div>
                <div className="bg-white/90 px-10 py-6 rounded-[30px] border border-emerald-100 shadow-2xl flex items-center gap-6 w-fit">
                    <Zap className="text-emerald-500 fill-emerald-500" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-emerald-900/40 tracking-widest">Worry Score</p>
                        <p className="text-4xl font-black text-emerald-950">{score}</p>
                    </div>
                </div>
            </div>

            {/* Bubble Rendering */}
            {bubbles.map(bubble => (
                <motion.div
                    key={bubble.id}
                    onClick={() => popBubble(bubble)}
                    className="absolute rounded-full shadow-lg backdrop-blur-md border-b-2 border-white/60 group cursor-pointer"
                    style={{
                        left: bubble.x,
                        top: bubble.y,
                        width: bubble.size,
                        height: bubble.size,
                        background: `radial-gradient(circle at 30% 30%, white 0%, ${bubble.color} 70%)`,
                        boxShadow: `0 10px 30px ${bubble.color}44`
                    }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.8, scale: 1 }}
                />
            ))}

            {/* Particle Rendering */}
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute w-2 h-2 rounded-full pointer-events-none"
                    style={{
                        left: p.x,
                        top: p.y,
                        backgroundColor: p.color,
                        boxShadow: `0 0 10px ${p.color}`
                    }}
                />
            ))}

            <AnimatePresence>
                {showComplete && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-emerald-950/80 backdrop-blur-2xl p-10"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                            className="glass-card max-w-2xl w-full p-20 bg-white text-center space-y-10 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
                        >
                            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[35px] flex items-center justify-center mx-auto shadow-xl">
                                <Trophy size={48} />
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-6xl font-black text-emerald-950 tracking-tighter italic">Feeling Better?</h2>
                                <p className="text-emerald-800/50 text-2xl font-medium leading-relaxed">You've cleared 50 bubbles from your mind. Great job taking this moment for yourself.</p>
                            </div>
                            <button
                                onClick={() => { setScore(0); setShowComplete(false); }}
                                className="w-full py-10 bg-emerald-600 text-white rounded-[35px] font-black uppercase tracking-widest text-sm shadow-3xl hover:scale-105 transition-all"
                            >
                                Play Again
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute bottom-12 right-12 flex items-center gap-4 text-emerald-900/40 text-[10px] font-black uppercase tracking-[0.4em] italic">
                <Heart size={16} className="text-emerald-500 fill-emerald-500" /> Stay Present
            </div>
        </div>
    );
}
