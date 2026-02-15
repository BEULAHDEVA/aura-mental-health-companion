import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Music, ExternalLink, Timer, Coffee, Zap, Volume2, VolumeX, Heart, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FocusMode() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'Focus' | 'Break'>('Focus');
    const [activeAmbience, setActiveAmbience] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.3);

    const ambienceAudio = useRef<HTMLAudioElement | null>(null);
    const chimeAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // High quality chime sound for completion
        chimeAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
        chimeAudio.current.volume = 0.5;

        return () => {
            if (ambienceAudio.current) {
                ambienceAudio.current.pause();
                ambienceAudio.current = null;
            }
        };
    }, []);

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            clearInterval(interval);
            setIsActive(false);
            if (chimeAudio.current) chimeAudio.current.play().catch(() => { });

            if (mode === 'Focus') {
                setMode('Break');
                setTimeLeft(5 * 60);
            } else {
                setMode('Focus');
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setMode('Focus');
        setTimeLeft(25 * 60);
    };

    const toggleAmbience = (type: string, url: string) => {
        if (activeAmbience === type) {
            if (ambienceAudio.current) ambienceAudio.current.pause();
            setActiveAmbience(null);
        } else {
            if (ambienceAudio.current) ambienceAudio.current.pause();
            ambienceAudio.current = new Audio(url);
            ambienceAudio.current.loop = true;
            ambienceAudio.current.volume = volume;
            ambienceAudio.current.play().catch(() => { });
            setActiveAmbience(type);
        }
    };

    useEffect(() => {
        if (ambienceAudio.current) {
            ambienceAudio.current.volume = volume;
        }
    }, [volume]);

    const totalTime = mode === 'Focus' ? 25 * 60 : 5 * 60;
    const progress = (timeLeft / totalTime) * 100;

    // SVG circle properties
    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="max-w-6xl mx-auto space-y-24 py-10 animate-in fade-in duration-700">
            <header className="text-center space-y-6">
                <h1 className="text-8xl font-black text-emerald-950 tracking-tighter italic">Focus Timer.</h1>
                <p className="text-2xl text-emerald-900/60 max-w-2xl mx-auto font-medium">Use this timer to balance periods of focus with short rests. It helps keep your mind fresh and reduces stress.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                {/* Timer Card */}
                <div className="glass-card p-16 flex flex-col items-center space-y-12 border-emerald-100/50 bg-white/60 shadow-3xl">
                    <div className="flex items-center gap-4 bg-emerald-50 px-8 py-3 rounded-full border border-emerald-100/50">
                        {mode === 'Focus' ? <Brain size={20} className="text-emerald-600" /> : <Heart size={20} className="text-emerald-500" />}
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-900 italic">
                            {mode === 'Focus' ? 'Work Session' : 'Rest Break'}
                        </span>
                    </div>

                    <div className="relative w-80 h-80 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="160" cy="160" r={radius} stroke="#f0fdf4" strokeWidth="12" fill="transparent" />
                            <motion.circle
                                cx="160" cy="160" r={radius}
                                stroke={mode === 'Focus' ? '#10b981' : '#f472b6'}
                                strokeWidth="16" fill="transparent"
                                strokeDasharray={circumference}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1, ease: "linear" }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-8xl font-black text-emerald-950 font-mono tracking-tighter italic">{formatTime(timeLeft)}</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-900/40 mt-4">{mode} MODE</span>
                        </div>
                    </div>

                    <div className="flex gap-8 w-full">
                        <button
                            onClick={toggleTimer}
                            className="flex-1 py-8 rounded-[30px] bg-emerald-600 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                            {isActive ? <Pause size={24} /> : <Play size={24} />}
                            {isActive ? 'Pause' : 'Start'}
                        </button>
                        <button
                            onClick={resetTimer}
                            className="w-24 h-24 bg-white/80 text-emerald-600 rounded-[30px] flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-xl border border-emerald-100"
                        >
                            <RefreshCw size={28} />
                        </button>
                    </div>
                </div>

                {/* Sounds & Help */}
                <div className="glass-card p-16 flex flex-col justify-between border-emerald-100/50 bg-white/80 shadow-3xl">
                    <div className="space-y-10">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[30px] flex items-center justify-center shadow-xl">
                            <Music size={36} />
                        </div>
                        <h2 className="text-5xl font-black text-emerald-950 tracking-tight italic">Calming Sounds.</h2>
                        <p className="text-lg text-emerald-900/60 font-medium">Add some soft background noise to help you concentrate. Pick a sound that feels most comfortable to you.</p>
                    </div>

                    <div className="space-y-10">
                        <div className="grid grid-cols-2 gap-4">
                            <SoundBtn
                                active={activeAmbience === 'rain'}
                                onClick={() => toggleAmbience('rain', 'https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3')}
                                label="Soft Rain"
                            />
                            <SoundBtn
                                active={activeAmbience === 'river'}
                                onClick={() => toggleAmbience('river', 'https://assets.mixkit.co/active_storage/sfx/2418/2418-preview.mp3')}
                                label="Gentle River"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-emerald-900/40">
                                <span>Volume Control</span>
                                <span>{Math.round(volume * 100)}%</span>
                            </div>
                            <input
                                type="range" min="0" max="1" step="0.01"
                                value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-full h-3 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            />
                        </div>

                        <button
                            onClick={() => window.open('https://www.youtube.com/results?search_query=lofi+hip+hop+radio', '_blank')}
                            className="w-full py-7 bg-white text-emerald-900 border border-emerald-100 rounded-[25px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-lg hover:bg-emerald-50 transition-all"
                        >
                            Open Music Player <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SoundBtn({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`py-6 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${active ? 'bg-emerald-600 text-white shadow-xl' : 'bg-emerald-50 text-emerald-800 border border-emerald-100/50 hover:bg-white '}`}
        >
            {active ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {label}
        </button>
    );
}
