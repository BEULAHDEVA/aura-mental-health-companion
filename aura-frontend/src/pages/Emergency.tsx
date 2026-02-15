import { Phone, MapPin, Globe, Shield, Heart, LifeBuoy, Users, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Emergency() {
    const helplines = [
        { name: "Global Crisis Support", number: "988", desc: "Available 24/7 for anyone in emotional distress." },
        { name: "Emergency Services", number: "100 / 911", desc: "Call for immediate medical or safety emergencies." },
        { name: "Student Support Line", number: "1-800-273-8255", desc: "Dedicated support for students and young adults." }
    ];

    const findCounselor = () => {
        window.open('https://www.google.com/maps/search/mental+health+counselor+near+me', '_blank');
    };

    return (
        <div className="max-w-5xl mx-auto py-10 space-y-16 animate-in fade-in duration-700">
            <header className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-red-50 text-red-600 rounded-full font-black uppercase tracking-widest text-[10px] border border-red-100 shadow-sm">
                    <Shield size={14} /> You are not alone
                </div>
                <h1 className="text-7xl font-black text-emerald-950 tracking-tighter italic">Get Support.</h1>
                <p className="text-xl text-emerald-900/60 max-w-2xl mx-auto font-medium">If you are feeling overwhelmed or just need someone to talk to, here are trusted resources to help you find your way back to calm.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Nearest Counselor Card */}
                <div className="glass-card p-12 bg-white/60 border-emerald-100/50 flex flex-col justify-between space-y-8 shadow-3xl">
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[30px] flex items-center justify-center shadow-xl">
                            <MapPin size={40} />
                        </div>
                        <h2 className="text-4xl font-black text-emerald-950 tracking-tight">Find Help Nearby</h2>
                        <p className="text-lg text-emerald-900/60 font-medium">Click below to locate professional counselors, therapists, and mental health clinics in your immediate area via Google Maps.</p>
                    </div>
                    <button
                        onClick={findCounselor}
                        className="w-full py-7 bg-emerald-600 text-white rounded-[25px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <Globe size={20} /> Locate a Counselor <ExternalLink size={16} />
                    </button>
                </div>

                {/* Helplines Card */}
                <div className="glass-card p-12 bg-white/80 border-emerald-100/50 space-y-10 shadow-3xl">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Phone size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-emerald-950 tracking-tight">Crisis Helplines</h3>
                    </div>
                    <div className="space-y-6">
                        {helplines.map((help, i) => (
                            <div key={i} className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 flex items-center justify-between group hover:bg-white transition-all">
                                <div>
                                    <h4 className="font-black text-emerald-950 text-lg">{help.name}</h4>
                                    <p className="text-sm text-emerald-800/60 font-medium">{help.desc}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-emerald-600 group-hover:scale-110 transition-transform">{help.number}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Tips */}
            <div className="glass-card p-12 bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex flex-col md:flex-row items-center gap-12 rounded-[3rem] shadow-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex-1 space-y-6 relative">
                    <h3 className="text-4xl font-black tracking-tight italic">Immediate Relief.</h3>
                    <p className="text-emerald-100/70 text-lg font-medium leading-relaxed italic">
                        "Take a deep breath. Slow down. Your feelings are valid, and this moment will pass. We are rooting for you."
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 relative">
                    <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 text-center">
                        <Heart className="mx-auto mb-2 text-lime-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Self Compassion</p>
                    </div>
                    <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 text-center">
                        <LifeBuoy className="mx-auto mb-2 text-cyan-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Reach Out</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
