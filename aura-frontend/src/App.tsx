import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import { Home, BookOpen, Music, Wind, Sparkles, User, MessageCircle, Volume2, VolumeX, ShieldCheck, LifeBuoy, Flower2 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import FocusMode from './pages/FocusMode';
import RageRoom from './pages/RageRoom';
import Emergency from './pages/Emergency';
import FlowerGarden from './pages/FlowerGarden';
import BreathingWidget from './components/BreathingWidget';
import ChatBot from './components/ChatBot';
import { Toaster } from 'sonner';
import { useEffect, useState, useRef } from 'react';
import { authService } from './services/api';

function App() {
    const [isRelaxMode, setIsRelaxMode] = useState(false);
    const ambientAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('aura_token');
        if (!token) {
            authService.anonymousLogin().catch(console.error);
        }

        // Initialize ambient sound
        ambientAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3');
        ambientAudio.current.loop = true;
        ambientAudio.current.volume = 0.2;
    }, []);

    useEffect(() => {
        if (isRelaxMode) {
            ambientAudio.current?.play().catch(console.error);
        } else {
            ambientAudio.current?.pause();
        }
    }, [isRelaxMode]);

    return (
        <Router>
            <div className="min-h-screen relative flex flex-col transition-all duration-1000">
                <div className="glow-mesh" />

                {/* Navigation */}
                <nav className="sticky top-0 z-50 px-10 py-8 flex items-center justify-between bg-white/40 backdrop-blur-2xl border-b border-emerald-100/50">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="w-14 h-14 rounded-[22px] bg-emerald-600 shadow-xl shadow-emerald-200 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-4xl font-black tracking-tighter text-emerald-900 uppercase italic">Aura</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-4">
                        <NavLink to="/" className={({ isActive }) => `nav-link-vibrant ${isActive ? 'nav-link-active-vibrant' : ''}`}>Home</NavLink>
                        <NavLink to="/journal" className={({ isActive }) => `nav-link-vibrant ${isActive ? 'nav-link-active-vibrant' : ''}`}>Journal</NavLink>
                        <NavLink to="/focus" className={({ isActive }) => `nav-link-vibrant ${isActive ? 'nav-link-active-vibrant' : ''}`}>Relax</NavLink>
                        <NavLink to="/garden" className={({ isActive }) => `nav-link-vibrant ${isActive ? 'nav-link-active-vibrant' : ''}`}>Garden</NavLink>
                        <NavLink to="/rage" className={({ isActive }) => `nav-link-vibrant ${isActive ? 'nav-link-active-vibrant' : ''}`}>Play</NavLink>
                        <NavLink to="/support" className={({ isActive }) => `nav-link-vibrant flex items-center gap-2 ${isActive ? 'nav-link-active-vibrant text-red-600 border-red-100' : 'text-red-500'}`}>
                            Support
                        </NavLink>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsRelaxMode(!isRelaxMode)}
                            className={`px-8 py-4 rounded-[25px] flex items-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all ${isRelaxMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white/60 text-emerald-800 border border-emerald-100'}`}
                        >
                            {isRelaxMode ? <Volume2 size={18} /> : <VolumeX size={18} />}
                            <span className="hidden sm:inline">Nature Sounds</span>
                        </button>
                        <button className="w-14 h-14 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100">
                            <User size={24} />
                        </button>
                    </div>
                </nav>

                <main className="flex-1 container mx-auto px-8 py-16">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/journal" element={<Journal />} />
                        <Route path="/focus" element={<FocusMode />} />
                        <Route path="/rage" element={<RageRoom />} />
                        <Route path="/garden" element={<FlowerGarden />} />
                        <Route path="/support" element={<Emergency />} />
                    </Routes>
                </main>

                <div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-6 items-end">
                    <BreathingWidget />
                    <ChatBot />
                </div>
            </div>
            <Toaster position="top-right" />
        </Router>
    );
}

export default App;
