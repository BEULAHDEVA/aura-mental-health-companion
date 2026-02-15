import { TrendingUp, Award, Flame, Zap, ShieldCheck, Sparkles, Wind, Music, ArrowRight, Brain, Heart, Globe, MessageCircle, Info, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { analyticsService, journalService } from '../services/api';

export default function Dashboard() {
    const [trends, setTrends] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashData, trendData, journalHistory] = await Promise.all([
                    analyticsService.getDashboard(),
                    analyticsService.getTrends(),
                    journalService.getHistory()
                ]);
                setStats(dashData.stats);
                setTrends(trendData);
                setHistory(journalHistory);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const chartData = trends.length > 0 ? trends : [
        { name: 'Mon', stress: 2 },
        { name: 'Tue', stress: 4 },
        { name: 'Wed', stress: 3 },
        { name: 'Thu', stress: 5 },
        { name: 'Fri', stress: 4 },
        { name: 'Sat', stress: 2 },
        { name: 'Sun', stress: 1 },
    ];

    return (
        <div className="space-y-40 animate-in fade-in duration-1000 pb-32">
            {/* Hero Section */}
            <section className="relative py-10 overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center gap-24">
                    <div className="flex-1 space-y-12 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 px-8 py-3 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-black tracking-[0.4em] uppercase border border-emerald-200/50 shadow-sm"
                        >
                            <Sparkles size={16} className="text-emerald-600 animate-pulse" />
                            Your Personal Breathing Space
                        </motion.div>
                        <h1 className="text-[10rem] font-black tracking-tighter text-emerald-950 leading-[0.8] italic">
                            Stay <br />
                            <span className="aura-heading">Grounded.</span>
                        </h1>
                        <p className="text-3xl text-emerald-900/60 max-w-2xl leading-relaxed font-medium">
                            A safe, private space to track your mood and find peace.
                            Write down your thoughts, play relaxing games, and find support when you need it most.
                        </p>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-8">
                            <Link to="/journal" className="vibrant-button !px-14 !py-7 text-lg shadow-emerald-200">
                                Start Writing
                            </Link>
                            <Link to="/support" className="vibrant-button !px-14 !py-7 text-lg !bg-white/60 !text-emerald-900 border-2 border-emerald-100/50 shadow-xl">
                                Find Support
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-xl">
                        <div className="glass-card p-3 shadow-3xl rotate-3 hover:rotate-0 transition-all duration-1000 bg-white/40 border-white/60">
                            <div className="bg-white rounded-[2.5rem] p-16 space-y-12 shadow-inner">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-3xl text-emerald-950 uppercase tracking-tighter italic">Your Mood Weekly</h3>
                                    <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-5 py-2 rounded-full uppercase tracking-widest border border-emerald-100 italic">Always Encrypted</div>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="heroStress" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="stress" stroke="#059669" strokeWidth={8} fill="url(#heroStress)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="bg-emerald-50/50 p-10 rounded-[2.5rem] border border-emerald-100/50 shadow-sm">
                                        <p className="text-[11px] uppercase font-black text-emerald-400 tracking-widest mb-3">Status</p>
                                        <p className="text-4xl font-black text-emerald-700 italic">Stable</p>
                                    </div>
                                    <div className="bg-lime-50/50 p-10 rounded-[2.5rem] border border-lime-100/50 shadow-sm">
                                        <p className="text-[11px] uppercase font-black text-lime-600/60 tracking-widest mb-3">Growth Points</p>
                                        <p className="text-4xl font-black text-lime-700 italic">{stats?.xp_points || 450}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reflection Logs */}
            <section className="space-y-16">
                <div className="flex items-end justify-between border-b border-emerald-200/50 pb-12">
                    <div>
                        <h2 className="text-7xl font-black text-emerald-950 italic">Your <span className="text-emerald-600">Reflections.</span></h2>
                        <p className="text-emerald-800/40 font-black uppercase tracking-[0.3em] text-[11px] mt-4">A private record of your journey</p>
                    </div>
                    <Link to="/journal" className="vibrant-button flex items-center gap-4">
                        New Entry <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    <div className="lg:col-span-8 space-y-10">
                        {loading ? (
                            <div className="h-64 flex items-center justify-center text-emerald-800/30 font-black uppercase tracking-widest text-xs animate-pulse font-mono">Loading records...</div>
                        ) : history.length === 0 ? (
                            <div className="glass-card p-24 text-center border-dashed border-2 border-emerald-200 text-emerald-800/40 font-bold italic">No entries yet. Start writing whenever you're ready.</div>
                        ) : (
                            history.slice(0, 5).map((entry: any) => (
                                <motion.div
                                    whileHover={{ x: 10, scale: 1.01 }}
                                    key={entry.id}
                                    className="glass-card p-12 flex items-center justify-between group transition-all cursor-default bg-white/60 border-emerald-100 shadow-xl"
                                >
                                    <div className="flex items-center gap-10">
                                        <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-2xl ${entry.stress_score > 7 ? 'bg-orange-100 text-orange-600 shadow-orange-200' : 'bg-emerald-100 text-emerald-600 shadow-emerald-200'}`}>
                                            {entry.stress_score > 7 ? <Activity size={36} /> : <Heart size={36} />}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-emerald-900/40 uppercase tracking-widest mb-3">
                                                {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                            </p>
                                            <h4 className="text-3xl font-black text-emerald-950 tracking-tighter italic">
                                                {entry.content && entry.content.startsWith('[Chat Log]')
                                                    ? `Chat: "${entry.content.replace('[Chat Log]: ', '').slice(0, 40)}..."`
                                                    : `Journal: "${entry.content ? entry.content.slice(0, 45) : 'Untitled'}..."`}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-emerald-800/30 tracking-widest mb-2 italic">Stress Level</p>
                                        <div className="flex items-baseline gap-1 justify-end">
                                            <p className="text-5xl font-black text-emerald-950">{entry.stress_score || 0}</p>
                                            <p className="text-sm font-black text-emerald-400">/10</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-16">
                        <div className="glass-card p-16 bg-gradient-to-br from-emerald-600 to-teal-800 text-white relative overflow-hidden group shadow-3xl rounded-[4rem]">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000 blur-3xl" />
                            <h3 className="text-5xl font-black mb-6 tracking-tighter leading-none italic uppercase">Your <br /> Progress.</h3>
                            <p className="text-emerald-100/70 mb-12 font-medium text-xl italic leading-relaxed">"{stats?.streak_count || 5} days of checking in. Consistency is the first step to feeling better."</p>
                            <div className="space-y-6">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em]">
                                    <span>Weekly Goal</span>
                                    <span>{Math.min((stats?.streak_count || 5) * 14, 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-8 bg-black/20 rounded-full p-2 backdrop-blur-md shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((stats?.streak_count || 5) * 14, 100)}%` }}
                                        className="h-full bg-gradient-to-r from-emerald-300 to-lime-300 rounded-full shadow-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-16 space-y-10 bg-white/60 shadow-3xl border-emerald-50 rounded-[4rem]">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center shadow-2xl">
                                    <Brain size={40} />
                                </div>
                                <h3 className="text-4xl font-black text-emerald-950 tracking-tighter italic">Daily Care</h3>
                            </div>
                            <p className="text-emerald-900/50 font-medium text-xl leading-relaxed italic">
                                "Self-care isn't selfish. Take a moment today to breathe deeply and celebrate how far you've come."
                            </p>
                            <Link to="/focus" className="w-full vibrant-button flex items-center justify-center text-lg">
                                Take a Break
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
