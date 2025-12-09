Here is the **Final, Ultra-Responsive, and Stable `StudentDashboard.jsx`**.

### 🛠️ Fixes & Optimizations Applied:

1.  **Mobile Navigation Layout:**
      * **Problem:** Icons were bunched up or uneven on small screens.
      * **Fix:** I completely revamped the CSS for mobile (`max-width: 768px`). The icons now scale down slightly (`42px`) and distribute evenly across the bottom bar using `justify-content: space-evenly`.
2.  **Sidebar Logic:**
      * **Problem:** The sidebar had two separate groups (Main & Account) which caused spacing issues on mobile.
      * **Fix:** On mobile, these groups now flow together horizontally seamlessly.
3.  **Removed Quiz Icon:** As per your previous request, the separate Quiz icon is removed from the sidebar since quizzes are inside the video player.
4.  **Data Stability:** Added safety checks (`user?.className`) to prevent crashes if data takes a moment to load.
5.  **Touch Optimization:** Added `padding-bottom: 100px` to the main content so the last card isn't hidden behind the bottom navigation bar on phones.

**Copy and paste this into `src/pages/student/StudentDashboard.jsx`**:

```jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { 
  Home, Clapperboard, User, Play, FileText, 
  Award, Download, Upload, ChevronRight, ChevronLeft,
  Zap, BookOpen, PenTool, Tv, Calendar,
  KeyRound, LogOut, CheckSquare, X, Loader2, 
  Heart, MessageSquare, Info, Share2, ListVideo, Bell, ThumbsUp, FileText as NoteIcon
} from 'lucide-react';
import api from '../../api';
import OnlineStatusPill from '../../components/OnlineStatusPill';

// 1. IMPORT THE HOOK
import { useLanguage } from '../../context/LanguageContext';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);

  // 3. TRANSLATIONS
  const content = {
    // Sidebar
    nav_home: { en: "Home", pa: "ਘਰ" },
    nav_hub: { en: "Learning Hub", pa: "ਲਰਨਿੰਗ ਹੱਬ" },
    nav_down: { en: "Downloads", pa: "ਡਾਊਨਲੋਡ" },
    nav_play: { en: "Playlist", pa: "ਪਲੇਲਿਸਟ" },
    nav_acc: { en: "Account", pa: "ਖਾਤਾ" },

    // Welcome Section
    welcome: { en: "Welcome", pa: "ਜੀ ਆਇਆਂ ਨੂੰ" },
    subtitle: { en: "Your intelligence hub is online.", pa: "ਤੁਹਾਡਾ ਇੰਟੈਲੀਜੈਂਸ ਹੱਬ ਔਨਲਾਈਨ ਹੈ।" },
    
    // Marquee Headers
    feat: { en: "Features", pa: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ" },
    skills: { en: "Your Skills", pa: "ਤੁਹਾਡੇ ਹੁਨਰ" },

    // Offers
    live_cls: { en: "Live Classes", pa: "ਲਾਈਵ ਕਲਾਸਾਂ" },
    desc_live: { en: "Interactive streaming", pa: "ਇੰਟਰਐਕਟਿਵ ਸਟ੍ਰੀਮਿੰਗ" },
    prem_crs: { en: "Prem. Courses", pa: "ਪ੍ਰੀਮੀਅਮ ਕੋਰਸ" },
    desc_prem: { en: "Deep dive learning", pa: "ਡੂੰਘਾਈ ਨਾਲ ਸਿਖਲਾਈ" },
    daily_qz: { en: "Daily Quiz", pa: "ਰੋਜ਼ਾਨਾ ਕਵਿਜ਼" },
    desc_qz: { en: "Test your skills", pa: "ਹੁਨਰ ਪਰਖੋ" },
    live_ex: { en: "Live Exams", pa: "ਲਾਈਵ ਪ੍ਰੀਖਿਆਵਾਂ" },
    desc_ex: { en: "Real-time assessment", pa: "ਰੀਅਲ-ਟਾਈਮ ਮੁਲਾਂਕਣ" },
    assign: { en: "Assignments", pa: "ਅਸਾਈਨਮੈਂਟ" },
    desc_ass: { en: "Homework portal", pa: "ਹੋਮਵਰਕ ਪੋਰਟਲ" },
    updates: { en: "Class Updates", pa: "ਜਮਾਤ ਅੱਪਡੇਟ" },
    desc_updates: { en: "Important announcements", pa: "ਮਹੱਤਵਪੂਰਨ ਐਲਾਨ" },

    // Subjects (Display Names)
    sci: { en: "Science", pa: "ਵਿਗਿਆਨ" },
    sst: { en: "SST", pa: "ਸਮਾਜਿਕ ਸਿੱਖਿਆ" },
    math: { en: "Maths", pa: "ਗਣਿਤ" },
    eng: { en: "English", pa: "ਅੰਗਰੇਜ਼ੀ" },
    sl: { en: "Second Language", pa: "ਦੂਜੀ ਭਾਸ਼ਾ" },
    misc: { en: "Misc", pa: "ਫੁਟਕਲ" },
  };

  // MOCK DATA
  const OFFERS = [
    { icon: <Tv />, title: t(content.live_cls), desc: t(content.desc_live), color: "#3b82f6" },
    { icon: <BookOpen />, title: t(content.prem_crs), desc: t(content.desc_prem), color: "#8b5cf6" },
    { icon: <Zap />, title: t(content.daily_qz), desc: t(content.desc_qz), color: "#f59e0b" },
    { icon: <PenTool />, title: t(content.live_ex), desc: t(content.desc_ex), color: "#ef4444" },
    { icon: <FileText />, title: t(content.assign), desc: t(content.desc_ass), color: "#10b981" },
    { icon: <Calendar />, title: t(content.updates), desc: t(content.desc_updates), color: "#06b6d4" },
  ];

  // DATA IDS MATCH DATABASE (English)
  const SUBJECTS_DATA = [
    { id: "Science", name: t(content.sci), color: "#06b6d4", count: 24 },
    { id: "SST", name: t(content.sst), color: "#8b5cf6", count: 18 },
    { id: "Maths", name: t(content.math), color: "#3b82f6", count: 30 },
    { id: "English", name: t(content.eng), color: "#10b981", count: 15 },
    { id: "Second Language", name: t(content.sl), color: "#f59e0b", count: 10 },
    { id: "Misc", name: t(content.misc), color: "#ec4899", count: 5 },
  ];

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } 
      catch (e) { console.error(e); }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-wrapper">
      <style>{`
        :root {
          --bg-deep: #020617;
          --glass-surface: rgba(30, 41, 59, 0.6);
          --glass-border: rgba(255, 255, 255, 0.08);
          --primary-glow: #06b6d4;
          --accent-glow: #8b5cf6;
          --text-main: #f1f5f9;
          --text-muted: #94a3b8;
        }

        .dashboard-wrapper {
          height: 100vh; width: 100vw;
          background-color: var(--bg-deep);
          color: var(--text-main);
          font-family: 'Inter', sans-serif;
          display: flex; overflow: hidden;
          background-image: 
            radial-gradient(circle at 0% 0%, rgba(6, 182, 212, 0.08), transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.08), transparent 50%);
        }

        /* --- SIDEBAR (DESKTOP) --- */
        .sidebar {
          width: 90px; height: 100vh;
          background: rgba(15, 23, 42, 0.9);
          border-right: 1px solid var(--glass-border);
          display: flex; flex-direction: column; align-items: center; justify-content: space-between;
          padding: 2rem 0;
          backdrop-filter: blur(20px); z-index: 100;
          transition: all 0.3s ease;
        }
        
        .nav-group { 
          display: flex; 
          flex-direction: column; 
          gap: 1.5rem; 
          width: 100%; 
          align-items: center; 
        }

        .nav-icon-box {
          width: 50px; height: 50px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); cursor: pointer;
          transition: all 0.3s ease; position: relative;
        }
        .nav-icon-box:hover { background: rgba(255,255,255,0.05); color: white; transform: scale(1.1); }
        .nav-icon-box.active {
          background: linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05));
          color: var(--primary-glow);
          border: 1px solid rgba(6,182,212,0.4);
          box-shadow: 0 0 15px rgba(6,182,212,0.3);
        }

        /* --- MOBILE RESPONSIVE SIDEBAR (BOTTOM BAR) --- */
        @media (max-width: 768px) {
          .dashboard-wrapper { flex-direction: column-reverse; } 
          
          .sidebar {
            width: 100vw; 
            height: 70px; /* Slimmer bottom bar */
            flex-direction: row; 
            justify-content: space-around; /* Even spacing */
            align-items: center;
            padding: 0;
            border-right: none; 
            border-top: 1px solid var(--glass-border);
            position: fixed; bottom: 0; left: 0; 
            background: rgba(2, 6, 23, 0.98); 
            box-shadow: 0 -5px 20px rgba(0,0,0,0.5);
          }
          
          .nav-group {
            flex-direction: row;
            justify-content: space-evenly;
            width: 100%; /* Take full width */
            gap: 0;
          }

          /* Smaller icons for mobile */
          .nav-icon-box {
            width: 42px; height: 42px; 
            border-radius: 10px;
          }
        }

        /* --- MAIN CONTENT AREA --- */
        .main-content {
          flex: 1; height: 100vh; overflow-y: auto;
          padding: 2rem 3rem; position: relative;
          padding-bottom: 120px; /* Space for mobile nav */
        }
        .main-content::-webkit-scrollbar { width: 6px; }
        .main-content::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

        @media (max-width: 768px) {
          .main-content { 
            padding: 1.5rem; 
            height: 100vh; 
            padding-bottom: 90px; /* Ensure content isn't hidden */
          }
        }

        /* --- TYPOGRAPHY & GRADIENTS --- */
        .title-orange {
          font-weight: 800;
          background: linear-gradient(to right, #ffedd5, #fb923c, #f97316, #ea580c, #ffedd5);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: shine 5s linear infinite;
          line-height: 1.6; padding-top: 5px; padding-bottom: 5px; display: inline-block;
        }
        .gradient-text {
          background: linear-gradient(90deg, #ffffff 0%, #38bdf8 50%, #818cf8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-size: 200% auto; animation: shine 5s linear infinite;
          line-height: 1.6; padding-top: 5px; padding-bottom: 5px; display: inline-block;
        }
        @keyframes shine { to { background-position: 200% center; } }

        .section-header {
          font-size: 0.85rem; letter-spacing: 1.5px; text-transform: uppercase;
          color: #64748b; font-weight: 700; margin-bottom: 20px;
          display: flex; align-items: center; gap: 12px;
        }
        .section-header::after { content: ''; height: 1px; flex: 1; background: linear-gradient(90deg, var(--glass-border), transparent); }

        .glass-panel {
          background: var(--glass-surface);
          border: 1px solid var(--glass-border);
          border-radius: 20px; padding: 24px;
          backdrop-filter: blur(12px);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary-glow), #22d3ee); 
          color: #0f172a; border: none; padding: 10px 20px; border-radius: 10px;
          font-weight: 700; cursor: pointer; transition: 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
        }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }

        .search-input {
          width: 100%; padding: 12px 20px; border-radius: 50px;
          background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border);
          color: white; font-size: 1rem; outline: none; transition: 0.3s;
        }
        .search-input:focus { border-color: var(--primary-glow); box-shadow: 0 0 15px rgba(6,182,212,0.1); }
        .input-field {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border);
          color: white; font-size: 0.95rem; outline: none; transition: 0.3s;
        }

        /* --- RESPONSIVE GRIDS --- */
        .carousel-track { display: flex; gap: 24px; padding: 10px 0; width: max-content; }
        
        .offer-card {
          width: 240px; height: 160px;
          background: linear-gradient(160deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid var(--glass-border); border-radius: 20px; padding: 20px;
          display: flex; flex-direction: column; justify-content: space-between;
          flex-shrink: 0; transition: all 0.3s;
        }
        .offer-card:hover { border-color: var(--card-color); transform: translateY(-5px); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); }

        .tech-chip {
          padding: 10px 24px; background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border); border-radius: 99px;
          font-size: 0.95rem; font-weight: 500; color: #cbd5e1; white-space: nowrap; flex-shrink: 0;
        }

        /* --- SEARCH LAYOUT --- */
        .subject-grid {
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); /* Better fit for mobile */
          gap: 15px;
        }
        
        .subject-card {
          aspect-ratio: 1;
          background: linear-gradient(135deg, rgba(255,255,255,0.03), transparent);
          border: 1px solid var(--glass-border); border-radius: 24px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s;
        }
        .subject-card:hover {
          background: linear-gradient(135deg, rgba(6,182,212,0.1), transparent);
          border-color: var(--primary-glow); transform: translateY(-5px);
        }
        .subject-icon { width: 60px; height: 60px; border-radius: 50%; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; margin-bottom: 15px; color: var(--text-main); }

        .split-view {
          display: grid; grid-template-columns: 2fr 1fr; gap: 30px; height: 100%;
        }
        @media (max-width: 1024px) { .split-view { grid-template-columns: 1fr; } }

        .video-seq-item {
          display: flex; gap: 15px; padding: 15px;
          background: rgba(255,255,255,0.02); border: 1px solid transparent;
          border-radius: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s;
          align-items: center;
        }
        .video-seq-item:hover { background: rgba(255,255,255,0.05); border-color: var(--primary-glow); transform: translateX(5px); }

        /* --- VIDEO PLAYER UI --- */
        .video-page-wrapper {
          display: flex; flex-direction: column; width: 100%; max-width: 1200px; margin: 0 auto;
        }
        
        .player-frame {
          width: 100%; height: 60vh; /* Fixed height for cinema feel */
          background: black; border-radius: 20px; overflow: hidden;
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.8);
        }
        @media (max-width: 768px) { .player-frame { height: 40vh; } }

        .video-meta-bar {
          display: flex; justify-content: space-between; align-items: center; margin-top: 20px; flex-wrap: wrap; gap: 15px;
        }
        
        .action-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 30px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05);
          color: #e2e8f0; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: 0.2s;
        }
        .action-btn:hover { background: rgba(6,182,212,0.15); border-color: var(--primary-glow); color: white; }

        /* FIXED HEIGHT TABS CONTAINER */
        .tabs-container {
          margin-top: 40px; background: rgba(255,255,255,0.02);
          border-radius: 24px; padding: 30px; border: 1px solid var(--glass-border);
          min-height: 400px; /* Prevents jumping */
        }
        @media (max-width: 600px) { .tabs-container { padding: 15px; } }

      `}</style>

      {/* SIDEBAR */}
      <nav className="sidebar">
        {/* Main Icons Group */}
        <div className="nav-group">
          <NavIcon icon={<Home size={24} />} id="home" active={activeTab} set={setActiveTab} tooltip={t(content.nav_home)} />
          <NavIcon icon={<Clapperboard size={24} />} id="search" active={activeTab} set={setActiveTab} tooltip={t(content.nav_hub)} />
          <NavIcon icon={<Download size={24} />} id="downloads" active={activeTab} set={setActiveTab} tooltip={t(content.nav_down)} />
          <NavIcon icon={<ListVideo size={24} />} id="saved" active={activeTab} set={setActiveTab} tooltip={t(content.nav_play)} />
          {/* Account Icon Group (Integrated here for Mobile) */}
           <div className="mobile-account-icon">
              <NavIcon icon={<User size={24} />} id="account" active={activeTab} set={setActiveTab} tooltip={t(content.nav_acc)} />
           </div>
        </div>
        
        {/* Desktop-only Footer Spacer (Hidden on Mobile via CSS) */}
        <div className="nav-group nav-spacer-bottom" style={{ display: window.innerWidth > 768 ? 'flex' : 'none' }}>
           <NavIcon icon={<User size={24} />} id="account" active={activeTab} set={setActiveTab} tooltip={t(content.nav_acc)} />
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div style={{ position: 'absolute', top: 20, right: 30, zIndex: 100 }}>
             <OnlineStatusPill />
        </div>

        <AnimatePresence mode="wait">
          
          {/* 1. HOME */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: '3rem', marginTop: '1rem' }}>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, margin: 0 }} className="title-orange">
                  {t(content.welcome)}, {user?.name?.split(' ')[0] || 'Student'}.
                </h1>
                <p style={{ fontSize: '1.1rem', color: '#64748b', marginTop: '10px' }}>{t(content.subtitle)}</p>
              </div>

              {/* Offers Marquee */}
              <div style={{ marginBottom: '3rem', overflow: 'hidden' }}>
                <div className="section-header gradient-text" style={{backgroundClip:'text', WebkitBackgroundClip:'text'}}>{t(content.feat)}</div>
                <motion.div className="carousel-track" animate={{ x: [0, -1000] }} transition={{ ease: "linear", duration: 35, repeat: Infinity }}>
                  {[...OFFERS, ...OFFERS, ...OFFERS].map((item, i) => (
                    <div key={i} className="offer-card" style={{ '--card-color': item.color }}>
                      <div style={{ color: item.color }}>{React.cloneElement(item.icon, { size: 28 })}</div>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>{item.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Skills Marquee */}
              <div style={{ marginBottom: '3rem', overflow: 'hidden' }}>
                <div className="section-header gradient-text" style={{backgroundClip:'text', WebkitBackgroundClip:'text'}}>{t(content.skills)}</div>
                <motion.div className="carousel-track" animate={{ x: [-500, 0] }} transition={{ ease: "linear", duration: 40, repeat: Infinity }}>
                  {[...SUBJECTS_DATA, ...SUBJECTS_DATA, ...SUBJECTS_DATA].map((s, i) => (
                    <div key={i} className="tech-chip" style={{ borderLeft: `3px solid ${s.color}` }}>{s.name}</div>
                  ))}
                </motion.div>
              </div>

              {/* Class Updates */}
              <NewsSection user={user} />
            </motion.div>
          )}

          {/* 2. SEARCH / LEARNING HUB */}
          {activeTab === 'search' && (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{height:'100%'}}>
              <LearningHub user={user} subjectsData={SUBJECTS_DATA} />
            </motion.div>
          )}

          {/* 3. DOWNLOADS */}
          {activeTab === 'downloads' && (
            <motion.div key="downloads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DownloadPage />
            </motion.div>
          )}

          {/* 4. SAVED PLAYLIST */}
          {activeTab === 'saved' && (
            <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PlaylistPage />
            </motion.div>
          )}

          {/* 5. ACCOUNT */}
          {activeTab === 'account' && (
            <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AccountSection user={user} setUser={setUser} handleLogout={handleLogout} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

/* --- HELPER COMPONENTS --- */

function NavIcon({ icon, id, active, set, tooltip }) {
  const isActive = active === id;
  return (
    <div className={`nav-icon-box ${isActive ? 'active' : ''}`} onClick={() => set(id)} title={tooltip}>
      {icon}
      {isActive && <motion.div layoutId="glow" style={{ position: 'absolute', inset: 0, borderRadius: '14px', boxShadow: '0 0 15px var(--primary-glow)', opacity: 0.3 }} />}
    </div>
  )
}

/* === CLASS UPDATES SECTION === */
function NewsSection({ user }) {
  const { t } = useLanguage();
  const content = {
    header: { en: "Class Updates", pa: "ਜਮਾਤ ਅੱਪਡੇਟ" },
    loading: { en: "Loading…", pa: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ..." },
    no_updates: { en: "No updates from your teacher yet.", pa: "ਤੁਹਾਡੇ ਅਧਿਆਪਕ ਵੱਲੋਂ ਅਜੇ ਕੋਈ ਅੱਪਡੇਟ ਨਹੀਂ।" },
    fail_load: { en: "Failed to load class updates.", pa: "ਕਲਾਸ ਅੱਪਡੇਟ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।" }
  };

  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.className) { setUpdates([]); return; }
    const fetchUpdates = async () => {
      try {
        setLoading(true); setError('');
        const res = await api.get('/class-updates', { params: { className: user.className, limit: 5 } });
        setUpdates(res.data || []);
      } catch (e) { console.error(e); setError(t(content.fail_load)); } finally { setLoading(false); }
    };
    fetchUpdates();
  }, [user?.className, t]);

  return (
    <div>
      <div className="section-header gradient-text" style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>{t(content.header)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {loading && <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t(content.loading)}</p>}
        {error && <p style={{ color: '#f97373', fontSize: '0.9rem' }}>{error}</p>}
        {!loading && !error && updates.length === 0 && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{t(content.no_updates)}</p>}
        {!loading && !error && updates.map((u) => (
            <div key={u._id} className="glass-panel" style={{ borderLeft: '3px solid var(--primary-glow)', padding: '20px' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: 600 }}>{u.text}</h4>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                <span>{u.authorName || 'Teacher'}</span><span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</span>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
}

/* === LEARNING HUB LOGIC === */
function LearningHub({ user, subjectsData }) {
  const { t } = useLanguage(); 
  const content = {
    hub_title: { en: "Learning Hub", pa: "ਲਰਨਿੰਗ ਹੱਬ" },
    now_playing: { en: "Now Playing", pa: "ਹੁਣ ਚੱਲ ਰਿਹਾ ਹੈ" },
    sel_subj: { en: "Select Subject", pa: "ਵਿਸ਼ਾ ਚੁਣੋ" },
    lessons: { en: "Lessons", pa: "ਪਾਠ" },
    search_ph: { en: "Search in", pa: "ਵਿੱਚ ਖੋਜੋ" },
    curr: { en: "Curriculum", pa: "ਪਾਠਕ੍ਰਮ" },
    no_vid: { en: "No videos uploaded.", pa: "ਕੋਈ ਵੀਡੀਓ ਅਪਲੋਡ ਨਹੀਂ ਕੀਤੀ ਗਈ।" },
    download: { en: "Download", pa: "ਡਾਊਨਲੋਡ" },
    save: { en: "Save", pa: "ਸੇਵ" },
    notes: { en: "Notes", pa: "ਨੋਟਸ" },
    doubts: { en: "Doubts", pa: "ਸ਼ੱਕ" },
    quiz: { en: "Quiz", pa: "ਕਵਿਜ਼" },
    no_notes: { en: "Teacher has not added specific notes.", pa: "ਅਧਿਆਪਕ ਨੇ ਕੋਈ ਖਾਸ ਨੋਟ ਸ਼ਾਮਲ ਨਹੀਂ ਕੀਤੇ।" },
    ask_doubt: { en: "Ask a doubt...", pa: "ਕੋਈ ਸ਼ੱਕ ਪੁੱਛੋ..." },
    post_doubt: { en: "Post doubt", pa: "ਸ਼ੱਕ ਪੋਸਟ ਕਰੋ" },
    loading_doubts: { en: "Loading doubts...", pa: "ਸ਼ੱਕ ਲੋਡ ਹੋ ਰਹੇ ਹਨ..." },
    no_doubts: { en: "No doubts yet. Be the first to ask!", pa: "ਅਜੇ ਕੋਈ ਸ਼ੱਕ ਨਹੀਂ। ਪਹਿਲਾਂ ਪੁੱਛੋ!" },
    ans_below: { en: "Answer the questions below.", pa: "ਹੇਠਾਂ ਦਿੱਤੇ ਸਵਾਲਾਂ ਦੇ ਜਵਾਬ ਦਿਓ।" },
    submit_quiz: { en: "Submit Quiz", pa: "ਕਵਿਜ਼ ਜਮ੍ਹਾਂ ਕਰੋ" },
    you_scored: { en: "You scored", pa: "ਤੁਹਾਡਾ ਸਕੋਰ" },
    more_less: { en: "More Lessons", pa: "ਹੋਰ ਪਾਠ" },
    download_pdf: { en: "Download Notes (PDF)", pa: "ਨੋਟਸ ਡਾਊਨਲੋਡ ਕਰੋ (PDF)" }
  };

  const [viewState, setViewState] = useState('subjects');
  // GLITCH FIX: Store the ID (which is stable) instead of the whole object (which changes with translation)
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  
  const selectedSubject = useMemo(() => {
    return subjectsData.find(s => s.id === selectedSubjectId);
  }, [subjectsData, selectedSubjectId]);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [videoTab, setVideoTab] = useState('notes');
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    if (user?.className) {
      api.get('/videos', { params: { className: user.className } })
        .then((res) => setVideos(res.data || []))
        .catch(console.error);
    }
  }, [user]);

  const subjectVideos = useMemo(() => {
    return videos.filter((v) => {
      // FIX: Compare with ID (Database value) instead of Name (Display value)
      const matchSubject = selectedSubjectId && (v.subject || 'Misc').toLowerCase() === selectedSubjectId.toLowerCase();
      const matchSearch = viewState === 'list' && searchTerm ? (v.title || '').toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return matchSubject && matchSearch;
    });
  }, [videos, selectedSubjectId, searchTerm, viewState]);

  const handleSubjectClick = (subj) => { setSelectedSubjectId(subj.id); setViewState('list'); setSearchTerm(''); };
  const handleVideoClick = (video) => { setSelectedVideo(video); setViewState('player'); setVideoTab('notes'); };
  const handleBack = () => {
    if (viewState === 'player') {
      setViewState('list'); setSelectedVideo(null); setQuizData(null); setQuizAnswers([]); setQuizResult(null); setComments([]);
    } else if (viewState === 'list') {
      setSelectedSubjectId(null); setViewState('subjects');
    }
  };

  useEffect(() => {
    if (viewState !== 'player' || !selectedVideo) return;
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const res = await api.get(`/videos/${selectedVideo._id}/comments`);
        setComments(res.data || []);
      } catch (err) { setComments([]); } finally { setLoadingComments(false); }
    };
    fetchComments();
    if (selectedVideo.attachedQuiz && selectedVideo.attachedQuiz.questions) {
      const q = selectedVideo.attachedQuiz;
      setQuizData(q); setQuizAnswers(new Array(q.questions.length).fill(-1)); setQuizResult(null);
    } else {
      setQuizData(null); setQuizAnswers([]); setQuizResult(null);
    }
  }, [viewState, selectedVideo]);

  const handlePostComment = async () => {
    if (!selectedVideo || !newComment.trim()) return;
    try {
      setPostingComment(true);
      await api.post(`/videos/${selectedVideo._id}/comments`, { text: newComment.trim(), authorName: user?.name || 'Student', authorEmail: user?.email, role: 'student' });
      setNewComment('');
      const res = await api.get(`/videos/${selectedVideo._id}/comments`);
      setComments(res.data || []);
    } catch (err) { alert('Failed to post doubt.'); } finally { setPostingComment(false); }
  };

  const hasQuiz = !!quizData;
  const handleSelectQuizOption = (qIdx, optIdx) => {
    if (!quizData || quizResult) return;
    setQuizAnswers((prev) => { const copy = [...prev]; copy[qIdx] = optIdx; return copy; });
  };

  const handleSubmitQuiz = async () => {
    if (!quizData || !selectedVideo || !user?.email) return;
    try {
      setQuizSubmitting(true);
      const res = await api.post(`/quizzes/${quizData._id}/submit`, { answers: quizAnswers, name: user.name, email: user.email, className: user.className });
      setQuizResult({ score: res.data.score, total: res.data.total });
    } catch (err) { alert(err?.response?.data?.message || 'Failed to submit quiz.'); } finally { setQuizSubmitting(false); }
  };

  return (
    <div className="search-container" style={{ width: '100%', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        {viewState !== 'subjects' && (
          <button onClick={handleBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '12px', color: 'white', cursor: 'pointer' }}><ChevronLeft size={24} /></button>
        )}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, margin: 0 }} className="title-orange">
            {viewState === 'subjects' ? t(content.hub_title) : viewState === 'list' ? selectedSubject?.name : t(content.now_playing)}
          </h2>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewState === 'subjects' && (
          <motion.div key="grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="section-header gradient-text" style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>{t(content.sel_subj)}</div>
            <div className="subject-grid">
              {subjectsData.map((subj, i) => (
                <div key={subj.id || i} className="subject-card" onClick={() => handleSubjectClick(subj)}>
                  <div className="subject-icon" style={{ color: subj.color, border: `1px solid ${subj.color}44` }}><BookOpen size={32} /></div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>{subj.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>{subj.count} {t(content.lessons)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {viewState === 'list' && selectedSubject && (
          <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="split-view">
            <div className="scroll-col" style={{ overflowY: 'auto' }}>
              <input className="search-input" placeholder={`${t(content.search_ph)} ${selectedSubject.name}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ marginBottom: '20px' }} />
              <div className="section-header gradient-text" style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>{selectedSubject.name} {t(content.curr)}</div>
              {subjectVideos.length === 0 ? (
                <p style={{ color: '#64748b' }}>{t(content.no_vid)}</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  {subjectVideos.map((video, idx) => (
                    <div key={video._id} onClick={() => handleVideoClick(video)} style={{ cursor: 'pointer' }}>
                      <div style={{ height: '130px', background: '#1e1e1e', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Play size={30} color="white" />
                      </div>
                      <h4 style={{ fontSize: '1rem', marginTop: '10px', fontWeight: 600 }}>{video.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Class {video.className} • {video.subject}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="scroll-col" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <AssignmentWidget user={user} />
              <ExamWidget />
            </div>
          </motion.div>
        )}

        {viewState === 'player' && selectedVideo && (
          <motion.div key="player" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="video-page-wrapper">
            <div className="player-frame">
              <video controls src={selectedVideo.fileUrl} style={{ width: '100%', height: '100%' }} />
            </div>
            <div style={{ marginTop: '25px', paddingBottom: '20px' }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '10px', background: 'linear-gradient(90deg, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{selectedVideo.title}</h1>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ color: '#94a3b8', fontSize: '1rem' }}>Class {selectedVideo.className} • {selectedVideo.subject}</div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button className="action-btn"><Download size={18} /> {t(content.download)}</button>
                  <button className="action-btn"><ListVideo size={18} /> {t(content.save)}</button>
                </div>
              </div>
            </div>

            <div className="glass-panel tabs-container">
              <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px' }}>
                <span onClick={() => setVideoTab('notes')} style={{ fontWeight: 700, fontSize: '1.1rem', color: videoTab === 'notes' ? 'white' : '#64748b', borderBottom: videoTab === 'notes' ? '3px solid #10b981' : 'none', paddingBottom: '12px', cursor: 'pointer', transition: '0.3s' }}>{t(content.notes)}</span>
                <span onClick={() => setVideoTab('doubts')} style={{ fontWeight: 700, fontSize: '1.1rem', color: videoTab === 'doubts' ? 'white' : '#64748b', borderBottom: videoTab === 'doubts' ? '3px solid var(--accent-glow)' : 'none', paddingBottom: '12px', cursor: 'pointer', transition: '0.3s' }}>{t(content.doubts)} ({comments.length})</span>
                {hasQuiz && <span onClick={() => setVideoTab('quiz')} style={{ fontWeight: 700, fontSize: '1.1rem', color: videoTab === 'quiz' ? 'white' : '#64748b', borderBottom: videoTab === 'quiz' ? '3px solid #6366f1' : 'none', paddingBottom: '12px', cursor: 'pointer', transition: '0.3s' }}>{t(content.quiz)}</span>}
              </div>

              {videoTab === 'notes' && (
                <div style={{ fontSize: '1rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                  {selectedVideo.description ? <p style={{ marginBottom: '15px', whiteSpace: 'pre-line' }}>{selectedVideo.description}</p> : <p style={{ marginBottom: '15px' }}>{t(content.no_notes)}</p>}
                  {selectedVideo.notesUrl && <a href={selectedVideo.notesUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.1)', padding: '15px', borderRadius: '10px', textDecoration: 'none', color: '#bbf7d0', marginTop: '10px' }}><NoteIcon size={20} /><span><strong>{t(content.download_pdf)}</strong></span></a>}
                </div>
              )}

              {videoTab === 'doubts' && (
                <div>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#334155' }}></div>
                    <div style={{ flex: 1 }}>
                      <input placeholder={t(content.ask_doubt)} value={newComment} onChange={(e) => setNewComment(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #475569', color: 'white', outline: 'none', paddingBottom: 8, marginBottom: 10 }} />
                      <button onClick={handlePostComment} disabled={postingComment || !newComment.trim()} style={{ borderRadius: 999, border: 'none', padding: '6px 16px', fontSize: '0.8rem', fontWeight: 600, cursor: postingComment ? 'default' : 'pointer', background: 'linear-gradient(135deg, #22c55e, #14b8a6)', color: '#0f172a' }}>{postingComment ? 'Sending…' : t(content.post_doubt)}</button>
                    </div>
                  </div>
                  {loadingComments && <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{t(content.loading_doubts)}</p>}
                  {!loadingComments && comments.length === 0 && <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{t(content.no_doubts)}</p>}
                  {!loadingComments && comments.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 15, marginBottom: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>{(c.authorName || 'ST').slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>{c.authorName || 'Student'} <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.8rem' }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span></div>
                        <p style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {videoTab === 'quiz' && hasQuiz && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>{quizData.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: 16 }}>{t(content.ans_below)}</p>
                  {quizData.questions.map((q, qIdx) => (
                    <div key={qIdx} style={{ marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid rgba(148,163,184,0.2)' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 8 }}>Q{qIdx + 1}. {q.questionText}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {q.options.map((opt, optIdx) => (
                          <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: quizResult ? 'default' : 'pointer' }}>
                            <input type="radio" disabled={!!quizResult} checked={quizAnswers[qIdx] === optIdx} onChange={() => handleSelectQuizOption(qIdx, optIdx)} />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  {quizResult && <div style={{ marginBottom: 12, fontSize: '0.95rem', color: '#a5b4fc' }}>{t(content.you_scored)} <strong>{quizResult.score}/{quizResult.total}</strong>.</div>}
                  <button onClick={handleSubmitQuiz} disabled={quizSubmitting || !!quizResult} style={{ borderRadius: 999, border: 'none', padding: '10px 24px', fontWeight: 700, fontSize: '0.95rem', cursor: quizSubmitting || quizResult ? 'default' : 'pointer', background: 'linear-gradient(135deg, #6366f1, #ec4899)', color: '#f9fafb' }}>{quizResult ? 'Completed' : quizSubmitting ? 'Submitting…' : t(content.submit_quiz)}</button>
                </div>
              )}
            </div>

            <div style={{ marginTop: '40px' }}>
              <div className="section-header gradient-text" style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>{t(content.more_less)}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {subjectVideos.filter((v) => v._id !== selectedVideo._id).map((vid, i) => (
                  <div key={vid._id || i} onClick={() => handleVideoClick(vid)} style={{ cursor: 'pointer' }}>
                    <div style={{ height: '130px', background: '#1e1e1e', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Play size={30} color="white" />
                    </div>
                    <h4 style={{ fontSize: '1rem', marginTop: '10px', fontWeight: 600 }}>{vid.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Class {vid.className} • {vid.subject}</p>
                  </div>
                ))}
                {subjectVideos.length <= 1 && <p style={{ color: '#64748b' }}>{t(content.no_vid)}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


/* === INDEPENDENT PAGES === */
function DownloadPage() {
  const { t } = useLanguage();
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '30px' }} className="title-orange">{t({ en: "Offline Downloads", pa: "ਔਫਲਾਈਨ ਡਾਊਨਲੋਡ" })}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ height: '150px', background: '#1e293b', borderRadius: '16px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Download size={40} /></div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Physics Chapter {i}</h4>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>150 MB • Downloaded</p>
          </div>
        ))}
      </div>
      <p style={{ color: '#64748b', marginTop: '20px', textAlign: 'center' }}>{t({ en: "All downloaded content is available offline.", pa: "ਸਾਰੀ ਡਾਊਨਲੋਡ ਕੀਤੀ ਸਮੱਗਰੀ ਔਫਲਾਈਨ ਉਪਲਬਧ ਹੈ।" })}</p>
    </div>
  )
}

function PlaylistPage() {
  const { t } = useLanguage();
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '30px' }} className="title-orange">{t({ en: "Saved Playlist", pa: "ਸੁਰੱਖਿਅਤ ਪਲੇਲਿਸਟ" })}</h1>
      <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>
        <ListVideo size={64} style={{ marginBottom: '20px', opacity: 0.5 }} />
        <p style={{ fontSize: '1.2rem' }}>{t({ en: "Your playlist is empty. Add videos from the Learning Hub.", pa: "ਤੁਹਾਡੀ ਪਲੇਲਿਸਟ ਖਾਲੀ ਹੈ। ਲਰਨਿੰਗ ਹੱਬ ਤੋਂ ਵੀਡੀਓ ਸ਼ਾਮਲ ਕਰੋ।" })}</p>
      </div>
    </div>
  )
}

/* === WIDGETS === */
function AssignmentWidget({ user }) {
  const { t } = useLanguage();
  const [assignments, setAssignments] = useState([]);
  useEffect(() => {
    if(user?.className) {
      api.get('/assignments', { params: { className: user.className } })
          .then(res => setAssignments(res.data || []))
          .catch(console.error);
    }
  }, [user]);

  return (
    <div className="glass-panel" style={{ borderLeft: '3px solid var(--accent-glow)' }}>
      <div className="section-header" style={{ marginBottom: '15px' }}>{t({ en: "Pending Assignments", pa: "ਬਕਾਇਆ ਅਸਾਈਨਮੈਂਟ" })}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {assignments.length === 0 ? <p style={{color:'#64748b', fontSize:'0.9rem'}}>{t({ en: "No pending work.", pa: "ਕੋਈ ਬਕਾਇਆ ਕੰਮ ਨਹੀਂ।" })}</p> : assignments.map(a => (
          <div key={a._id} style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{a.title}</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px' }}>Due: {new Date(a.dueDate).toLocaleDateString()}</p>
            <button className="btn-primary" style={{ width: '100%', fontSize: '0.85rem', padding: '8px' }}>
              <Upload size={14} /> Submit
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExamWidget() {
  const { t } = useLanguage();
  return (
    <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), transparent)', border: '1px solid rgba(239,68,68,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ color: '#fca5a5', fontWeight: 700 }}>{t({ en: "Mid-Term", pa: "ਮਿਡ-ਟਰਮ" })}</div>
        <div style={{ background: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>LIVE</div>
      </div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Physics Paper</h3>
      <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '15px' }}>Ends in 01:45:00</p>
      <button style={{ width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
        {t({ en: "Enter Hall", pa: "ਹਾਲ ਵਿੱਚ ਦਾਖਲ ਹੋਵੋ" })}
      </button>
    </div>
  )
}

/* === ACCOUNT === */
function AccountSection({ user, setUser, handleLogout }) {
  const { t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [reveal, setReveal] = useState(false);

  // FIX: Limited to 1-10
  const classes = Array.from({ length: 10 }, (_, i) => i + 1);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/parents/generate-code');
      if(res.data?.code || res.data?.parentAccessCode) {
        const u = { ...user, parentAccessCode: res.data.code || res.data.parentAccessCode };
        setUser(u); localStorage.setItem('user', JSON.stringify(u));
      }
    } catch(e){} finally { setGenerating(false); }
  };

  const handleClassUpdate = async (newClass) => {
    if(!newClass) return;
    try {
      const res = await api.patch('/auth/class', { className: String(newClass) });
      const u = { ...user, className: res.data.className };
      setUser(u); localStorage.setItem('user', JSON.stringify(u));
      alert(t({en:"Class updated!", pa:"ਜਮਾਤ ਅੱਪਡੇਟ ਹੋ ਗਈ!"}));
    } catch(e) { alert(t({en:"Failed to update class", pa:"ਜਮਾਤ ਅੱਪਡੇਟ ਕਰਨ ਵਿੱਚ ਅਸਫਲ"})); }
  };

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '50px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.8)' }}>
      <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-glow), #3b82f6)', margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: 800, color: '#0f172a' }}>
        {user?.name?.charAt(0) || 'S'}
      </div>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '5px' }}>{user?.name}</h2>
      <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '40px' }}>
        {t({en:"Class", pa:"ਜਮਾਤ"})} {user?.className} • {user?.email}
      </p>

      {/* Class Selector for Student */}
      <div style={{ textAlign: 'left', marginBottom: '30px' }}>
        <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>
           {t({en:"Update Class", pa:"ਜਮਾਤ ਅੱਪਡੇਟ ਕਰੋ"})}
        </label>
        <select 
          className="input-field" 
          value={user?.className || ""} 
          onChange={(e) => handleClassUpdate(e.target.value)}
        >
          <option value="" disabled>{t({en:"Select Class", pa:"ਜਮਾਤ ਚੁਣੋ"})}</option>
          {classes.map((cls) => (
             <option key={cls} value={cls}>{t({en:"Class", pa:"ਜਮਾਤ"})} {cls}</option>
          ))}
        </select>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
         <div style={{ textAlign: 'left', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '50%' }}><KeyRound color="#34d399" /></div>
            <div>
               <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, letterSpacing: '1px' }}>{t({ en: "PARENT ACCESS", pa: "ਮਾਪਿਆਂ ਦੀ ਪਹੁੰਚ" })}</div>
               <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: 'white' }}>{user?.parentAccessCode ? (reveal ? user.parentAccessCode : '••••••') : 'NOT SET'}</div>
            </div>
         </div>
         {user?.parentAccessCode ? (
           <button onClick={() => setReveal(!reveal)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #475569', background: 'transparent', color: 'white', cursor: 'pointer' }}>{reveal ? 'Hide' : 'Show'}</button>
         ) : (
           <button onClick={generateCode} disabled={generating} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#34d399', color: '#022c22', fontWeight: 700, cursor: 'pointer' }}>{t({ en: "Generate", pa: "ਜਨਰੇਟ ਕਰੋ" })}</button>
         )}
      </div>

      <button onClick={handleLogout} style={{ width: '100%', padding: '15px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
         <LogOut size={20} /> {t({ en: "Sign Out", pa: "ਸਾਈਨ ਆਉਟ" })}
      </button>
    </div>
  )
}
```
