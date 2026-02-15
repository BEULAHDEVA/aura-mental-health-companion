import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flower2, Heart, Info, Trash2 } from 'lucide-react';

interface PlantedFlower {
    id: number;
    x: number;
    y: number;
    type: string;
    scale: number;
}

const FLOWERS = [
    { type: 'Rose', color: '#f43f5e', emoji: '🌹' },
    { type: 'Sunflower', color: '#facc15', emoji: '🌻' },
    { type: 'Lavender', color: '#a855f7', emoji: '🪻' },
    { type: 'Tulip', color: '#fb923c', emoji: '🌷' },
    { type: 'Daisy', color: '#ffffff', emoji: '🌼' }
];

export default function FlowerGarden() {
    const [garden, setGarden] = useState<PlantedFlower[]>([]);
    const [selectedType, setSelectedType] = useState(FLOWERS[0]);

    const plantFlower = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newFlower: PlantedFlower = {
            id: Date.now(),
            x,
            y,
            type: selectedType.emoji,
            scale: 0.5 + Math.random() * 0.5
        };

        setGarden(prev => [...prev, newFlower]);
    };

    const clearGarden = () => setGarden([]);

    return (
        <div className="max-w-6xl mx-auto space-y-16 py-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row items-end justify-between gap-12 border-b border-emerald-200/50 pb-16">
                <div className="space-y-6">
                    <h1 className="text-8xl font-black text-emerald-950 tracking-tighter italic">Secret Garden.</h1>
                    <p className="text-2xl text-emerald-900/60 font-medium max-w-xl">Plant a virtual garden of peace. Each flower you add represents a positive thought or a moment of calm.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={clearGarden}
                        className="p-6 bg-white/60 text-emerald-900 border border-emerald-100 rounded-3xl hover:bg-red-50 hover:text-red-500 transition-all shadow-lg"
                    >
                        <Trash2 size={24} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Palette */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card p-10 bg-white/80 border-emerald-100 shadow-2xl space-y-8">
                        <h3 className="text-xl font-black text-emerald-900 uppercase tracking-widest italic">Choose Seed</h3>
                        <div className="flex flex-col gap-4">
                            {FLOWERS.map((f) => (
                                <button
                                    key={f.type}
                                    onClick={() => setSelectedType(f)}
                                    className={`p-6 rounded-2xl flex items-center justify-between transition-all group ${selectedType.type === f.type ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'bg-emerald-50 text-emerald-800 hover:bg-white border border-emerald-100/50'}`}
                                >
                                    <span className="text-3xl">{f.emoji}</span>
                                    <span className="font-black uppercase tracking-widest text-[10px]">{f.type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-10 bg-emerald-600/10 rounded-[2.5rem] border border-emerald-200/50 space-y-4">
                        <div className="flex items-center gap-3 text-emerald-600">
                            <Info size={20} />
                            <span className="font-black uppercase tracking-widest text-[10px]">How to play</span>
                        </div>
                        <p className="text-sm text-emerald-900/60 font-medium italic">Click anywhere in the meadow to plant your selected seed. Watch your garden grow!</p>
                    </div>
                </div>

                {/* Meadow Area */}
                <div className="lg:col-span-3">
                    <div
                        onClick={plantFlower}
                        className="relative h-[700px] w-full bg-gradient-to-b from-emerald-100/20 to-emerald-200/40 rounded-[4rem] border-4 border-white shadow-inner overflow-hidden cursor-crosshair group active:scale-[0.99] transition-transform"
                    >
                        {/* Grass detail */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        <AnimatePresence>
                            {garden.map((flower) => (
                                <motion.div
                                    key={flower.id}
                                    initial={{ scale: 0, y: 20, opacity: 0 }}
                                    animate={{ scale: flower.scale, y: 0, opacity: 1 }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
                                    style={{
                                        left: flower.x,
                                        top: flower.y,
                                        fontSize: '60px',
                                        filter: 'drop-shadow(0 10px 20px rgba(6, 78, 59, 0.15))'
                                    }}
                                >
                                    {flower.type}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {garden.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-emerald-900/20 pointer-events-none">
                                <div className="text-center space-y-6">
                                    <Flower2 size={80} className="mx-auto" />
                                    <p className="text-3xl font-black tracking-tighter italic uppercase">Your Meadow is Ready.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex items-center justify-between text-emerald-900/40 font-black uppercase tracking-[0.4em] text-[10px] italic">
                        <div className="flex items-center gap-4">
                            <Sparkles size={16} /> {garden.length} Positive seeds planted
                        </div>
                        <div className="flex items-center gap-4">
                            <Heart size={16} fill="currentColor" /> Safe Space
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
