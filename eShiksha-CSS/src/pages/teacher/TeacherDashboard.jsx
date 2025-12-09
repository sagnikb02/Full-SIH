import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { 
  Home, Upload, FilePlus, Users, BarChart, FileText, 
  User, LogOut, KeyRound, ChevronDown, Trash2, CheckCircle, 
  X, Search, TrendingUp, Activity, Calendar, Globe, AlertCircle, Video, Film, CheckSquare, Bell
} from 'lucide-react';
import api from '../../api';
import OnlineStatusPill from '../../components/OnlineStatusPill';

// 1. IMPORT THE HOOK
import { useLanguage } from '../../context/LanguageContext';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('home'); 
  const [teacherUser, setTeacherUser] = useState(null);
  const [activeClass, setActiveClass] = useState('');
  const [homeStats, setHomeStats] = useState({
    totalStudents: null,
    avgAttendance: null,
    avgScore: null,
  });

  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [postingReply, setPostingReply] = useState(false);

  // 3. TRANSLATIONS
  const content = {
    // Sidebar (Removed Quiz Tab)
    nav_home: { en: "Home", pa: "ਘਰ" },
    nav_upload: { en: "Upload", pa: "ਅਪਲੋਡ" },
    nav_students: { en: "Students", pa: "ਵਿਦਿਆਰਥੀ" },
    nav_analytics: { en: "Analytics", pa: "ਅੰਕੜੇ" },
    nav_news: { en: "News", pa: "ਖ਼ਬਰਾਂ" },
    nav_exams: { en: "Exams", pa: "ਪ੍ਰੀਖਿਆਵਾਂ" },
    nav_assign: { en: "Assignments", pa: "ਅਸਾਈਨਮੈਂਟ" },
    nav_account: { en: "Account", pa: "ਖਾਤਾ" },

    // Home
    cmd_center: { en: "Command Center", pa: "ਕਮਾਂਡ ਸੈਂਟਰ" },
    welcome: { en: "Welcome", pa: "ਜੀ ਆਇਆਂ ਨੂੰ" },
    act_env: { en: "Active Environment: Class", pa: "ਸਰਗਰਮ ਮਾਹੌਲ: ਜਮਾਤ" },
    sel_cls_warn: { en: "Select a class in Account settings.", pa: "ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਜਮਾਤ ਚੁਣੋ।" },
    live_ana: { en: "Live Analytics", pa: "ਲਾਈਵ ਅੰਕੜੇ" },
    
    // Stats
    tot_stu: { en: "Total Students", pa: "ਕੁੱਲ ਵਿਦਿਆਰਥੀ" },
    avg_att: { en: "Avg. Attendance", pa: "ਔਸਤ ਹਾਜ਼ਰੀ" },
    avg_grow: { en: "Avg. Class Growth", pa: "ਔਸਤ ਜਮਾਤ ਵਿਕਾਸ" },

    // Quick Start
    q_start: { en: "Quick Start", pa: "ਤੁਰੰਤ ਸ਼ੁਰੂਆਤ" },
    act_up: { en: "Upload Lesson", pa: "ਪਾਠ ਅਪਲੋਡ ਕਰੋ" },
    desc_up: { en: "Video & Notes", pa: "ਵੀਡੀਓ ਅਤੇ ਨੋਟਸ" },
    act_tsk: { en: "New Assignment", pa: "ਨਵੀਂ ਅਸਾਈਨਮੈਂਟ" },
    desc_tsk: { en: "Homework portal", pa: "ਹੋਮਵਰਕ ਪੋਰਟਲ" },
    act_pst: { en: "Post Update", pa: "ਅੱਪਡੇਟ ਪੋਸਟ ਕਰੋ" },
    desc_pst: { en: "Class alert", pa: "ਜਮਾਤ ਚੇਤਾਵਨੀ" },

    // Notifications
    latest_dbt: { en: "Latest Doubts", pa: "ਨਵੀਨਤਮ ਸ਼ੱਕ" },
    refresh: { en: "Refresh", pa: "ਰੀਫ੍ਰੈਸ਼" },
    loading: { en: "Loading...", pa: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ..." },
    no_dbts: { en: "No doubts have been posted yet.", pa: "ਅਜੇ ਕੋਈ ਸ਼ੱਕ ਪੋਸਟ ਨਹੀਂ ਕੀਤਾ ਗਿਆ।" },
    reply: { en: "Reply", pa: "ਜਵਾਬ ਦਿਓ" },
    replying: { en: "Replying to", pa: "ਜਵਾਬ ਦਿੱਤਾ ਜਾ ਰਿਹਾ ਹੈ" },
    type_rep: { en: "Type your reply...", pa: "ਆਪਣਾ ਜਵਾਬ ਲਿਖੋ..." },
    cancel: { en: "Cancel", pa: "ਰੱਦ ਕਰੋ" },
    send_rep: { en: "Send Reply", pa: "ਜਵਾਬ ਭੇਜੋ" },
    sending: { en: "Sending...", pa: "ਭੇਜ ਰਿਹਾ ਹੈ..." }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setTeacherUser(JSON.parse(stored));
    } catch {}
    const envClass = localStorage.getItem('teacherActiveClass');
    setActiveClass(envClass || '');
  }, []);

  useEffect(() => {
    if (!activeClass) {
      setHomeStats({ totalStudents: null, avgAttendance: null, avgScore: null });
      return;
    }
    const fetchStats = async () => {
      try {
        const [userRes, progressRes] = await Promise.all([
          api.get('/users/stats/by-class', { params: { className: activeClass } }),
          api.get('/quizzes/class-progress', { params: { className: activeClass } }),
        ]);
        const totalStudents = userRes.data?.totalStudents ?? 0;
        const progress = progressRes.data || [];
        let avgAttendance = 0; let avgScore = 0;
        if (progress.length > 0) {
          avgAttendance = progress.reduce((acc, s) => acc + (s.attendancePercent || 0), 0) / progress.length;
          avgScore = progress.reduce((acc, s) => acc + (s.avgScore || 0), 0) / progress.length;
        }
        setHomeStats({ totalStudents, avgAttendance: Number(avgAttendance.toFixed(1)), avgScore: Number(avgScore.toFixed(1)) });
      } catch (err) { setHomeStats({ totalStudents: null, avgAttendance: null, avgScore: null }); }
    };
    fetchStats();
  }, [activeClass]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getDisplayName = () => {
    if (teacherUser?.name && teacherUser.name !== 'Teacher') return teacherUser.name;
    if (teacherUser?.email) return teacherUser.email.split('@')[0];
    return 'Faculty';
  };

  const fetchNotifications = async () => {
    if (!activeClass) return;
    try {
      setNotifLoading(true); setNotifError('');
      const res = await api.get('/videos/comments/latest', { params: { className: activeClass, limit: 10 } });
      setNotifications(res.data || []);
    } catch (err) { setNotifError('Failed to load comments'); } finally { setNotifLoading(false); }
  };

  const handleToggleNotifications = () => {
    if (!activeClass) { alert(t(content.sel_cls_warn)); return; }
    setShowNotifications((prev) => {
      if (!prev) fetchNotifications();
      if (prev) { setReplyTarget(null); setReplyText(''); }
      return !prev;
    });
  };

  const handleReplySend = async () => {
    if (!replyTarget || !replyText.trim()) return;
    try {
      setPostingReply(true);
      await api.post(`/videos/${replyTarget.videoId}/comments`, {
        text: replyText.trim(), authorName: teacherUser?.name || 'Teacher', authorEmail: teacherUser?.email, role: 'teacher',
      });
      setReplyText(''); setReplyTarget(null); fetchNotifications();
    } catch (err) { alert('Failed to send reply'); } finally { setPostingReply(false); }
  };

  return (
    <div className="dashboard-wrapper">
      <style>{`
        :root { --bg-deep: #020617; --glass-surface: rgba(30, 41, 59, 0.6); --glass-border: rgba(255, 255, 255, 0.08); --primary-glow: #06b6d4; --accent-glow: #8b5cf6; --text-main: #f1f5f9; --text-muted: #94a3b8; }
        .dashboard-wrapper { height: 100vh; width: 100vw; background-color: var(--bg-deep); color: var(--text-main); font-family: 'Inter', sans-serif; display: flex; overflow: hidden; background-image: radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.08), transparent 40%), radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.08), transparent 40%); }
        .sidebar { width: 90px; height: 100vh; background: rgba(15, 23, 42, 0.8); border-right: 1px solid var(--glass-border); display: flex; flex-direction: column; align-items: center; padding-top: 2rem; gap: 1.2rem; backdrop-filter: blur(20px); z-index: 50; transition: all 0.3s ease; }
        @media (max-width: 768px) { .dashboard-wrapper { flex-direction: column-reverse; } .sidebar { width: 100vw; height: 70px; flex-direction: row; justify-content: space-around; padding: 0; border-right: none; border-top: 1px solid var(--glass-border); position: fixed; bottom: 0; left: 0; background: #020617; } .nav-spacer { display: none; } }
        .nav-icon-box { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: all 0.3s ease; position: relative; }
        .nav-icon-box:hover { background: rgba(255,255,255,0.05); color: white; transform: scale(1.1); }
        .nav-icon-box.active { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05)); color: var(--accent-glow); border: 1px solid rgba(139, 92, 246, 0.4); box-shadow: 0 0 15px rgba(139, 92, 246, 0.25); }
        .main-content { flex: 1; height: 100vh; overflow-y: auto; padding: 2rem 3rem; position: relative; padding-bottom: 100px; }
        .main-content::-webkit-scrollbar { width: 6px; } .main-content::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        @media (max-width: 768px) { .main-content { padding: 1.5rem; height: calc(100vh - 70px); } }
        
        /* 🔥 ORANGE GRADIENT TITLE ANIMATION 🔥 */
        .title-orange {
          font-weight: 800;
          background: linear-gradient(to right, #ffedd5, #fb923c, #f97316, #ea580c, #ffedd5);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 5s linear infinite;
          
          /* PUNJABI FONT FIX */
          line-height: 1.6;
          padding-top: 5px;
          padding-bottom: 5px;
          display: inline-block;
        }
        @keyframes shine { to { background-position: 200% center; } }

        .section-header { font-size: 0.85rem; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
        .section-header::after { content: ''; height: 1px; flex: 1; background: linear-gradient(90deg, var(--glass-border), transparent); }
        .glass-panel { background: var(--glass-surface); border: 1px solid var(--glass-border); border-radius: 20px; padding: 24px; backdrop-filter: blur(12px); }
        .quick-card { cursor: pointer; transition: all 0.2s ease; } .quick-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.03); border-color: var(--accent-glow); }
        .btn-primary { background: linear-gradient(135deg, var(--accent-glow), #ec4899); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); } .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .input-field { width: 100%; padding: 12px 16px; border-radius: 12px; background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); color: white; font-size: 0.95rem; outline: none; transition: 0.3s; }
        .input-field:focus { border-color: var(--accent-glow); box-shadow: 0 0 15px rgba(139, 92, 246, 0.15); }
        textarea.input-field { resize: vertical; min-height: 80px; }
      `}</style>

      {/* SIDEBAR */}
      <nav className="sidebar">
        <div style={{ marginBottom: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop:'1rem' }}>
          <NavIcon icon={<Home size={22} />} id="home" active={activeTab} set={setActiveTab} tooltip={t(content.nav_home)} />
          <NavIcon icon={<Upload size={22} />} id="upload" active={activeTab} set={setActiveTab} tooltip={t(content.nav_upload)} />
          <NavIcon icon={<Users size={22} />} id="students" active={activeTab} set={setActiveTab} tooltip={t(content.nav_students)} />
          <NavIcon icon={<BarChart size={22} />} id="analytics" active={activeTab} set={setActiveTab} tooltip={t(content.nav_analytics)} />
          <NavIcon icon={<Globe size={22} />} id="news" active={activeTab} set={setActiveTab} tooltip={t(content.nav_news)} />
          {/* REMOVED STANDALONE QUIZ TAB */}
          <NavIcon icon={<AlertCircle size={22} />} id="exams" active={activeTab} set={setActiveTab} tooltip={t(content.nav_exams)} />
          <NavIcon icon={<FilePlus size={22} />} id="assignments" active={activeTab} set={setActiveTab} tooltip={t(content.nav_assign)} />
        </div>
        <div style={{ marginBottom: '2rem' }}>
           <NavIcon icon={<User size={22} />} id="account" active={activeTab} set={setActiveTab} tooltip={t(content.nav_account)} />
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div style={{ position: 'absolute', top: 30, right: 40, zIndex: 120, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <OnlineStatusPill />
          <button onClick={handleToggleNotifications} style={{ position: 'relative', width: 40, height: 40, borderRadius: '999px', border: '1px solid rgba(148,163,184,0.4)', background: showNotifications ? 'rgba(15,23,42,0.9)' : 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Bell size={18} color="#e5e7eb" />
            {notifications.length > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: '999px', background: '#fb923c', color: '#0f172a', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{notifications.length}</span>}
          </button>
        </div>

        {/* NOTIFICATIONS PANEL */}
        {showNotifications && (
          <div className="glass-panel" style={{ position: 'absolute', top: 80, right: 40, width: 380, maxHeight: 420, overflowY: 'auto', padding: 20, zIndex: 110, background: 'rgba(15,23,42,0.96)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{t(content.latest_dbt)} – {activeClass || '—'}</div>
              <button onClick={fetchNotifications} style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}>{t(content.refresh)}</button>
            </div>
            {notifLoading && <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t(content.loading)}</p>}
            {!notifLoading && notifications.length === 0 && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{t(content.no_dbts)}</p>}
            {!notifLoading && notifications.map((item, idx) => (
               <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid rgba(30,64,175,0.4)', display: 'flex', gap: 10 }}>
                 <div style={{ width: 32, height: 32, borderRadius: '999px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#e5e7eb', flexShrink: 0 }}>{(item.authorName || 'ST').slice(0, 2).toUpperCase()}</div>
                 <div style={{ flex: 1 }}>
                   <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 2 }}>{item.authorName} • <span style={{ color: '#e5e7eb' }}>{item.videoTitle}</span></div>
                   <div style={{ fontSize: '0.9rem', color: '#e5e7eb', marginBottom: 4 }}>{item.text}</div>
                   <button onClick={() => { setReplyTarget(item); setReplyText(item.authorName ? `@${item.authorName} ` : ''); }} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.75rem' }}>{t(content.reply)}</button>
                 </div>
               </div>
            ))}
            {replyTarget && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(30,64,175,0.6)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>{t(content.replying)} {replyTarget.authorName}</div>
                <textarea
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                placeholder="Type update..."
                className="your-textarea-class"
              />
<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => { setReplyTarget(null); setReplyText(''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }}>{t(content.cancel)}</button>
                  <button onClick={handleReplySend} disabled={postingReply || !replyText.trim()} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>{postingReply ? t(content.sending) : t(content.send_rep)}</button>
                </div>
              </div>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: '3rem', marginTop: '1rem' }}>
                {/* 🌈 ORANGE GRADIENT TITLE */}
                <h1 style={{ fontSize: '3rem', margin: 0 }} className="title-orange">{t(content.cmd_center)}</h1>
                <p style={{ fontSize: '1.5rem', color: 'white', marginTop: '10px', fontWeight: 600 }}>{t(content.welcome)}, {getDisplayName()}</p>
                <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '5px' }}>{activeClass ? `${t(content.act_env)} ${activeClass}` : t(content.sel_cls_warn)}</p>
              </div>
              <div className="section-header">{t(content.live_ana)}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
                <StatCard label={t(content.tot_stu)} value={homeStats.totalStudents ?? '--'} icon={<Users size={28} color="#fb923c" />} bg="rgba(251, 146, 60, 0.1)" color="white" />
                <StatCard label={t(content.avg_att)} value={homeStats.avgAttendance ? `${homeStats.avgAttendance}%` : '--'} icon={<CheckCircle size={28} color="#4ade80" />} bg="rgba(74, 222, 128, 0.1)" color="#4ade80" />
                <StatCard label={t(content.avg_grow)} value={homeStats.avgScore ? `+${homeStats.avgScore}%` : '--'} icon={<TrendingUp size={28} color="#8b5cf6" />} bg="rgba(139, 92, 246, 0.1)" color="#8b5cf6" />
              </div>
              <div className="section-header" style={{ marginTop: '40px' }}>{t(content.q_start)}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <QuickCard icon={<Upload size={24} color="#a78bfa" />} bg="rgba(139, 92, 246, 0.1)" title={t(content.act_up)} desc={t(content.desc_up)} onClick={() => setActiveTab('upload')} />
                  {/* REMOVED CREATE QUIZ CARD (It's in upload now) */}
                  <QuickCard icon={<FilePlus size={24} color="#f472b6" />} bg="rgba(236, 72, 153, 0.1)" title={t(content.act_tsk)} desc={t(content.desc_tsk)} onClick={() => setActiveTab('assignments')} />
                  <QuickCard icon={<Globe size={24} color="#fb923c" />} bg="rgba(251, 146, 60, 0.1)" title={t(content.act_pst)} desc={t(content.desc_pst)} onClick={() => setActiveTab('news')} />
              </div>
            </motion.div>
          )}

          {activeTab === 'upload' && <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><UploadModule /></motion.div>}
          {activeTab === 'students' && <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><StudentTracker activeClass={activeClass} /></motion.div>}
          {activeTab === 'analytics' && <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AnalyticsModule /></motion.div>}

          {activeTab === 'news' && (
          <motion.div
            key="news"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <NewsManager activeClass={activeClass} teacherUser={teacherUser} />
          </motion.div>
        )}
        
          {activeTab === 'exams' && <motion.div key="exams" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ExamManager /></motion.div>}
          {activeTab === 'assignments' && <motion.div key="assignments" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AssignmentManager activeClass={activeClass} /></motion.div>}
          {activeTab === 'account' && <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AccountSection user={teacherUser} activeClass={activeClass} setActiveClass={setActiveClass} handleLogout={handleLogout} /></motion.div>}
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
      {isActive && <motion.div layoutId="glow" style={{ position: 'absolute', inset: 0, borderRadius: '12px', boxShadow: '0 0 15px var(--accent-glow)', opacity: 0.3 }} />}
    </div>
  )
}
function StatCard({ label, value, icon, bg, color }) {
  return (
    <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
       <div><div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div><div style={{ fontSize: '2.5rem', fontWeight: 700, color: color, marginTop: '5px' }}>{value}</div></div>
       <div style={{ background: bg, padding: '15px', borderRadius: '50%' }}>{icon}</div>
    </div>
  )
}
function QuickCard({ icon, bg, title, desc, onClick }) {
    return (
        <div className="glass-panel quick-card" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
            <div style={{ background: bg, padding: '12px', borderRadius: '12px' }}>{icon}</div>
            <div><div style={{ fontWeight: 600, color: 'white' }}>{title}</div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{desc}</div></div>
        </div>
    )
}

/* === SUB MODULES === */
function UploadModule() {
  const { t } = useLanguage();
  const content = {
      title: { en: "Content Studio", pa: "ਸਮੱਗਰੀ ਸਟੂਡੀਓ" },
      full_less: { en: "Full Lesson", pa: "ਪੂਰਾ ਪਾਠ" },
      vid_title: { en: "Video Title", pa: "ਵੀਡੀਓ ਸਿਰਲੇਖ" },
      sel_sub: { en: "Select Subject", pa: "ਵਿਸ਼ਾ ਚੁਣੋ" },
      sel_cls: { en: "Select Class", pa: "ਜਮਾਤ ਚੁਣੋ" },
      click_vid: { en: "Click to Upload Video", pa: "ਵੀਡੀਓ ਅਪਲੋਡ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ" },
      desc_ph: { en: "Description (optional)", pa: "ਵੇਰਵਾ (ਵਿਕਲਪਿਕ)" },
      attach_pdf: { en: "Attach Notes PDF", pa: "ਨੋਟਸ PDF ਨੱਥੀ ਕਰੋ" },
      att_quiz: { en: "Attach Quiz", pa: "ਕਵਿਜ਼ ਨੱਥੀ ਕਰੋ" },
      hide: { en: "Hide builder", pa: "ਬਿਲਡਰ ਲੁਕਾਓ" },
      build: { en: "Build quiz", pa: "ਕਵਿਜ਼ ਬਣਾਓ" },
      quiz_ti: { en: "Quiz Title", pa: "ਕਵਿਜ਼ ਸਿਰਲੇਖ" },
      q_txt: { en: "Question Text", pa: "ਸਵਾਲ" },
      opt: { en: "Option", pa: "ਵਿਕਲਪ" },
      add_q: { en: "+ Add Question", pa: "+ ਸਵਾਲ ਸ਼ਾਮਲ ਕਰੋ" },
      save_att: { en: "Save Quiz & Attach", pa: "ਕਵਿਜ਼ ਸੇਵ ਅਤੇ ਨੱਥੀ ਕਰੋ" },
      pub: { en: "Publish Content", pa: "ਸਮੱਗਰੀ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ" },
      rec_up: { en: "Recent Uploads", pa: "ਹਾਲੀਆ ਅਪਲੋਡਸ" }
  };

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [notesFile, setNotesFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [makeQuiz, setMakeQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [attachedQuizId, setAttachedQuizId] = useState(null);
  const [updateText, setUpdateText] = useState('');


  useEffect(() => { api.get('/videos').then(res => setVideos(res.data || [])).catch(console.error); }, []);

  const handleAddQuestion = () => {
     if(!qText.trim()) return alert("Question text required");
     setQuizQuestions(p => [...p, { questionText: qText, options: [...qOptions], correctIndex: correctIdx }]);
     setQText(''); setQOptions(['','','','']); setCorrectIdx(0);
  };

  const handleSaveQuiz = async () => {
     if(!subject || !className) return alert("Select subject/class first");
     setSavingQuiz(true);
     try {
        const res = await api.post('/quizzes', { title: quizTitle || title + " Quiz", subject, className, questions: quizQuestions });
        setAttachedQuizId(res.data._id); alert("Quiz Attached!");
     } catch(e) { alert("Failed to save quiz"); } finally { setSavingQuiz(false); }
  };

  const handleUpload = async (e) => {
     e.preventDefault();
     if(!file || !title || !className || !subject) return alert("Missing fields");
     setUploading(true);
     const fd = new FormData();
     fd.append('title', title); fd.append('subject', subject); fd.append('className', className);
     fd.append('type', 'long'); fd.append('description', description); fd.append('video', file);
     if(notesFile) fd.append('notes', notesFile);
     if(attachedQuizId) fd.append('attachedQuizId', attachedQuizId);
     try {
        const res = await api.post('/videos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setVideos(p => [res.data, ...p]); alert("Uploaded!");
        setTitle(''); setFile(null); setDescription(''); setNotesFile(null); setMakeQuiz(false); setAttachedQuizId(null);
     } catch(e) { alert("Upload failed"); } finally { setUploading(false); }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* 🌈 ORANGE TITLE */}
      <h2 style={{ fontSize: '2rem', marginBottom: '30px' }} className="title-orange">{t(content.title)}</h2>
      <div className="glass-panel" style={{ marginBottom: '30px' }}>
         <div style={{display:'flex', gap:20, marginBottom:20}}>
            <button style={{ flex: 1, padding: 12, borderRadius: 10, background: 'var(--accent-glow)', border: 'none', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
               <Video size={16} /> {t(content.full_less)}
            </button>
         </div>
         <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <input className="input-field" placeholder={t(content.vid_title)} value={title} onChange={e => setTitle(e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 15 }}>
               <select className="input-field" value={subject} onChange={e => setSubject(e.target.value)}>
                  <option value="">{t(content.sel_sub)}</option>
                  {['Science', 'Maths', 'English', 'SST', 'Second Language', 'Misc'].map(s => <option key={s} value={s}>{t({en: s, pa: s==='Science'?'ਵਿਗਿਆਨ':s==='Maths'?'ਗਣਿਤ':s==='English'?'ਅੰਗਰੇਜ਼ੀ':s==='SST'?'ਸਮਾਜਿਕ ਸਿੱਖਿਆ':s==='Second Language'?'ਦੂਜੀ ਭਾਸ਼ਾ':'ਫੁਟਕਲ'})}</option>)}
               </select>
               <select className="input-field" value={className} onChange={e => setClassName(e.target.value)}>
                  <option value="">{t(content.sel_cls)}</option>
                  {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{t({en:'Class', pa:'ਜਮਾਤ'})} {i+1}</option>)}
               </select>
            </div>
            <div onClick={() => document.getElementById('vid').click()} style={{ border: '2px dashed #475569', padding: 30, borderRadius: 15, textAlign: 'center', cursor: 'pointer' }}>
               <p style={{ color: file ? 'var(--accent-glow)' : '#94a3b8' }}>{file ? file.name : t(content.click_vid)}</p>
               <input id="vid" type="file" accept="video/*" hidden onChange={e => setFile(e.target.files[0])} />
            </div>
            <textarea className="input-field" placeholder={t(content.desc_ph)} value={description} onChange={e => setDescription(e.target.value)} />
            <div onClick={() => document.getElementById('note').click()} style={{ border: '2px dashed #475569', padding: 20, borderRadius: 15, textAlign: 'center', cursor: 'pointer' }}>
               <p style={{ color: notesFile ? 'var(--accent-glow)' : '#94a3b8' }}>{notesFile ? notesFile.name : t(content.attach_pdf)}</p>
               <input id="note" type="file" accept="application/pdf" hidden onChange={e => setNotesFile(e.target.files[0])} />
            </div>
            
            {/* Quiz Builder */}
            <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.35)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600, fontSize: '0.9rem' }}><CheckSquare size={16}/> {t(content.att_quiz)}</div>
                  <button type="button" onClick={() => setMakeQuiz(!makeQuiz)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.8rem' }}>{makeQuiz ? t(content.hide) : t(content.build)}</button>
               </div>
               {attachedQuizId && <p style={{ color: '#4ade80', fontSize: '0.8rem' }}>Quiz Attached!</p>}
               {makeQuiz && (
                  <div style={{ marginTop: 8 }}>
                     <input className="input-field" placeholder={t(content.quiz_ti)} value={quizTitle} onChange={e => setQuizTitle(e.target.value)} style={{ marginBottom: 10 }} />
                     <div style={{ background: 'rgba(15,23,42,0.9)', padding: 12, borderRadius: 10, border: '1px solid rgba(51,65,85,0.9)', marginBottom: 10 }}>
                        <input className="input-field" placeholder={t(content.q_txt)} value={qText} onChange={e => setQText(e.target.value)} style={{ marginBottom: 8 }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                           {qOptions.map((opt, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                 <input type="radio" checked={correctIdx===i} onChange={() => setCorrectIdx(i)} />
                                 <input className="input-field" placeholder={`${t(content.opt)} ${i+1}`} value={opt} onChange={e => { const n = [...qOptions]; n[i] = e.target.value; setQOptions(n); }} />
                              </div>
                           ))}
                        </div>
                        <button type="button" onClick={handleAddQuestion} style={{ marginTop: 8, background: 'transparent', border: '1px solid var(--accent-glow)', color: 'white', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem' }}>{t(content.add_q)}</button>
                     </div>
                     <button type="button" onClick={handleSaveQuiz} disabled={savingQuiz} className="btn-primary" style={{ width: '100%', padding: '10px 0' }}>{savingQuiz ? 'Saving...' : t(content.save_att)}</button>
                  </div>
               )}
            </div>
            <button className="btn-primary" disabled={uploading}>{uploading ? 'Uploading...' : t(content.pub)}</button>
         </form>
      </div>
      <div className="section-header">{t(content.rec_up)}</div>
      <div style={{ display: 'grid', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
         {videos.map(v => (
            <div key={v._id} className="glass-panel" style={{ padding: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div><h4 style={{ fontWeight: 600 }}>{v.title}</h4><p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{v.subject} • Class {v.className}</p></div>
               <Trash2 size={18} color="#ef4444" style={{ cursor: 'pointer' }} onClick={async () => { if(window.confirm('Delete?')) { await api.delete(`/videos/${v._id}`); setVideos(p => p.filter(x => x._id !== v._id)); }}} />
            </div>
         ))}
      </div>
    </div>
  )
}

function StudentTracker({ activeClass }) {
  const { t } = useLanguage();
  const content = {
     prog: { en: "Student Progress", pa: "ਵਿਦਿਆਰਥੀ ਦੀ ਪ੍ਰਗਤੀ" },
     trk_for: { en: "Tracking performance for Class", pa: "ਲਈ ਪ੍ਰਦਰਸ਼ਨ ਟ੍ਰੈਕਿੰਗ: ਜਮਾਤ" },
     sel_ac: { en: "Select an Active Classroom in Account settings.", pa: "ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਇੱਕ ਸਰਗਰਮ ਜਮਾਤ ਚੁਣੋ।" },
     stu_nm: { en: "Student Name", pa: "ਵਿਦਿਆਰਥੀ ਦਾ ਨਾਮ" },
     scr: { en: "Avg Score", pa: "ਔਸਤ ਸਕੋਰ" },
     att: { en: "Attendance", pa: "ਹਾਜ਼ਰੀ" },
     qz: { en: "Quizzes", pa: "ਕਵਿਜ਼" }
  };
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
     if(!activeClass) return;
     setLoading(true);
     api.get('/quizzes/class-progress', { params: { className: activeClass } })
        .then(res => setStats(res.data || [])).finally(() => setLoading(false));
  }, [activeClass]);

  return (
     <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* 🌈 ORANGE TITLE */}
        <h2 style={{ fontSize: '2rem', marginBottom: 20 }} className="title-orange">{t(content.prog)}</h2>
        <p style={{ color: '#94a3b8', marginBottom: 30 }}>{activeClass ? `${t(content.trk_for)} ${activeClass}` : t(content.sel_ac)}</p>
        <div className="glass-panel">
           {loading && <p style={{textAlign:'center'}}>Loading...</p>}
           {!loading && (
              <div style={{overflowX:'auto'}}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', minWidth:'500px' }}>
                   <thead>
                      <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
                         <th style={{ padding: 15 }}>{t(content.stu_nm)}</th><th style={{ padding: 15 }}>{t(content.scr)}</th><th style={{ padding: 15 }}>{t(content.att)}</th><th style={{ padding: 15 }}>{t(content.qz)}</th>
                      </tr>
                   </thead>
                   <tbody>
                      {stats.map(s => (
                         <tr key={s.studentId} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: 15, fontWeight: 600, color: 'white' }}>{s.name}</td>
                            <td style={{ padding: 15, color: '#4ade80' }}>{s.avgScore}%</td>
                            <td style={{ padding: 15 }}>{s.attendancePercent}%</td>
                            <td style={{ padding: 15 }}>{s.attemptsCount} / {s.totalQuizzes}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           )}
        </div>
     </div>
  )
}

function AnalyticsModule() { 
   const { t } = useLanguage();
   // 🌈 ORANGE TITLE
   return <div style={{maxWidth:900, margin:'0 auto'}}><h2 className="title-orange" style={{fontSize:'2rem', marginBottom:30}}>{t({en:"Class Analytics", pa:"ਜਮਾਤ ਵਿਸ਼ਲੇਸ਼ਣ"})}</h2><div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:30}}><div className="glass-panel" style={{height:300, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}><BarChart size={48} color="#8b5cf6" style={{marginBottom:10}}/><h3>Pass/Fail</h3><p style={{color:'#94a3b8'}}>Graph Placeholder</p></div><div className="glass-panel" style={{height:300, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}><TrendingUp size={48} color="#06b6d4" style={{marginBottom:10}}/><h3>Trend</h3><p style={{color:'#94a3b8'}}>Graph Placeholder</p></div></div></div> 
}

function NewsManager({ activeClass, teacherUser }) {
  const { t } = useLanguage();

  const content = {
    title: { en: "Class Updates", pa: "ਕਲਾਸ ਅੱਪਡੇਟ" },
    env_label: { en: "Environment", pa: "ਮਾਹੌਲ" },
    no_class: { en: "No class selected", pa: "ਕੋਈ ਜਮਾਤ ਨਹੀਂ ਚੁਣੀ ਗਈ" },
    recent: { en: "Recent Updates", pa: "ਤਾਜ਼ਾ ਅੱਪਡੇਟ" },
    no_updates: {
      en: "No updates have been posted for this class yet.",
      pa: "ਇਸ ਜਮਾਤ ਲਈ ਅਜੇ ਕੋਈ ਅੱਪਡੇਟ ਨਹੀਂ ਪੋਸਟ ਕੀਤੀ ਗਈ।"
    },
    posting: { en: "Broadcasting…", pa: "ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…" },
    button: { en: "Broadcast Update", pa: "ਅੱਪਡੇਟ ਭੇਜੋ" },
    loading: { en: "Loading…", pa: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ..." },
    fail_load: {
      en: "Failed to load updates.",
      pa: "ਅੱਪਡੇਟ ਲੋਡ ਨਹੀਂ ਹੋਏ।"
    },
    sel_class_alert: {
      en: "Select an Active Classroom in Account settings first.",
      pa: "ਪਹਿਲਾਂ ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਸਰਗਰਮ ਜਮਾਤ ਚੁਣੋ।"
    },
    fail_post: {
      en: "Failed to post update.",
      pa: "ਅੱਪਡੇਟ ਪੋਸਟ ਨਹੀਂ ਹੋ ਸਕੀ।"
    }
  };

  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUpdates = async () => {
    if (!activeClass) {
      setUpdates([]);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/class-updates', {
        params: { className: activeClass, limit: 5 },
      });
      setUpdates(res.data || []);
    } catch (e) {
      console.error(e);
      setError(t(content.fail_load));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, [activeClass]);

  const handlePost = async () => {
    if (!activeClass) {
      alert(t(content.sel_class_alert));
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) return;

    try {
      setPosting(true);

      await api.post('/class-updates', {
        className: activeClass,   // e.g. "8"
        message: trimmed,         // text from textarea
        // if your backend uses auth middleware, it can pick teacherName/email from req.user
      });

      setMessage('');       // clear textarea
      await loadUpdates();  // refresh recent updates list
    } catch (e) {
      console.error(e);
      alert(t(content.fail_post));
    } finally {
      setPosting(false);
    }
  };


  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* 🌈 ORANGE TITLE */}
      <h2
        className="title-orange"
        style={{ fontSize: '2rem', marginBottom: 30 }}
      >
        {t(content.title)}
      </h2>

      <div className="glass-panel" style={{ marginBottom: 30 }}>
        <div
          style={{
            fontSize: '0.85rem',
            color: '#94a3b8',
            marginBottom: 10,
          }}
        >
          {t(content.env_label)}:{' '}
          {activeClass ? `${t({ en: "Class", pa: "ਜਮਾਤ" })} ${activeClass}` : t(content.no_class)}
        </div>

        <textarea
          className="input-field"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          // no placeholder – lets teachers type anything / any language
        />

        <button
          className="btn-primary"
          style={{ marginTop: 20, width: '100%' }}
          onClick={handlePost}
          disabled={posting || !message.trim()}
        >
          {posting ? t(content.posting) : t(content.button)}
        </button>
      </div>

      <div className="section-header">{t(content.recent)}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {t(content.loading)}
          </p>
        )}
        {error && (
          <p style={{ color: '#f97373', fontSize: '0.9rem' }}>{error}</p>
        )}
        {!loading && !error && updates.length === 0 && (
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {t(content.no_updates)}
          </p>
        )}

        {!loading &&
          !error &&
          updates.map((u) => (
            <div
              key={u._id}
              className="glass-panel"
              style={{
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                borderLeft: '3px solid var(--accent-glow)',
              }}
            >
              <div
                style={{
                  color: '#e5e7eb',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                {u.message}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                }}
              >
                <span>{u.teacherName || 'Teacher'}</span>
                <span>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleString()
                    : ''}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function ExamManager() {
   const { t } = useLanguage();
   // 🌈 ORANGE TITLE
   return <div style={{maxWidth:800, margin:'0 auto'}}><h2 className="title-orange" style={{fontSize:'2rem', marginBottom:30}}>{t({en:"Exam Control", pa:"ਪ੍ਰੀਖਿਆ ਕੰਟਰੋਲ"})}</h2><div className="glass-panel" style={{textAlign:'center', padding:40}}><AlertCircle size={48} color="#ef4444" style={{marginBottom:20}}/><h3>{t({en:"No Live Exams", pa:"ਕੋਈ ਲਾਈਵ ਪ੍ਰੀਖਿਆ ਨਹੀਂ"})}</h3></div></div>
}

function AssignmentManager({ activeClass }) {
   const { t } = useLanguage();
   const content = {
      title: { en: "Assignments", pa: "ਅਸਾਈਨਮੈਂਟ" },
      ph_title: { en: "Title", pa: "ਸਿਰਲੇਖ" },
      ph_desc: { en: "Description", pa: "ਵੇਰਵਾ" },
      btn: { en: "Create Assignment", pa: "ਅਸਾਈਨਮੈਂਟ ਬਣਾਓ" },
      active: { en: "Active Assignments", pa: "ਸਰਗਰਮ ਅਸਾਈਨਮੈਂਟ" }
   };
   const [title, setTitle] = useState('');
   const [desc, setDesc] = useState('');
   const [file, setFile] = useState(null);
   const [ass, setAss] = useState([]);
   useEffect(() => { if(activeClass) api.get('/assignments', {params:{className:activeClass}}).then(res => setAss(res.data || [])); }, [activeClass]);
   
   const handleCreate = async (e) => {
      e.preventDefault();
      if(!file || !title) return alert("Missing fields");
      const fd = new FormData();
      fd.append('title', title); fd.append('description', desc); fd.append('className', activeClass); fd.append('file', file);
      try { await api.post('/assignments', fd); alert("Created"); setTitle(''); setDesc(''); setFile(null); } catch(e){ alert("Error"); }
   };
   
   // 🌈 ORANGE TITLE
   return <div style={{maxWidth:800, margin:'0 auto'}}><h2 className="title-orange" style={{fontSize:'2rem', marginBottom:30}}>{t(content.title)}</h2><div className="glass-panel" style={{marginBottom:30}}><form onSubmit={handleCreate} style={{display:'flex', flexDirection:'column', gap:15}}><input className="input-field" placeholder={t(content.ph_title)} value={title} onChange={e=>setTitle(e.target.value)} /><textarea className="input-field" placeholder={t(content.ph_desc)} value={desc} onChange={e=>setDesc(e.target.value)} /><input type="file" onChange={e=>setFile(e.target.files[0])} style={{color:'#cbd5e1'}} /><button className="btn-primary">{t(content.btn)}</button></form></div><div className="section-header">{t(content.active)}</div><div style={{display:'flex', flexDirection:'column', gap:10}}>{ass.map(a=><div key={a._id} className="glass-panel" style={{padding:15}}>{a.title}</div>)}</div></div>
}

function AccountSection({ user, activeClass, setActiveClass, handleLogout }) {
   const { t } = useLanguage();
   const [code, setCode] = useState('');
   const fetchCode = async () => { if(!activeClass) return alert("Select class"); const res = await api.get('/auth/referral-code', {params:{className:activeClass}}); setCode(res.data.referralCode); };
   return <div className="glass-panel" style={{width:'100%', maxWidth:500, padding:50, textAlign:'center', background:'rgba(15,23,42,0.8)'}}><div style={{width:100, height:100, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent-glow), #ec4899)', margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', fontWeight:800, color:'#0f172a'}}>{user?.name?.charAt(0)||'T'}</div><h2 style={{fontSize:'1.8rem', fontWeight:700}}>{user?.name}</h2><p style={{color:'#94a3b8', fontSize:'1rem', marginBottom:30}}>{user?.email} • {t({en:"Faculty", pa:"ਫੈਕਲਟੀ"})}</p><div style={{textAlign:'left', marginBottom:30}}><label style={{color:'#94a3b8', fontSize:'0.85rem', display:'block', marginBottom:8}}>{t({en:"Active Classroom", pa:"ਸਰਗਰਮ ਕਲਾਸਰੂਮ"})}</label><select className="input-field" value={activeClass} onChange={e=>{setActiveClass(e.target.value); localStorage.setItem('teacherActiveClass', e.target.value); setCode('');}}><option value="">{t({en:"Select Environment", pa:"ਮਾਹੌਲ ਚੁਣੋ"})}</option>{[...Array(10)].map((_,i)=><option key={i} value={i+1}>{t({en:"Class", pa:"ਜਮਾਤ"})} {i+1}</option>)}</select></div><div style={{background:'rgba(0,0,0,0.3)', padding:15, borderRadius:12, marginBottom:25, display:'flex', alignItems:'center', justifyContent:'space-between', border:'1px solid rgba(255,255,255,0.05)'}}><div style={{textAlign:'left'}}><div style={{fontSize:'0.75rem', color:'#fb923c', fontWeight:700, letterSpacing:'1px'}}>{t({en:"REFERRAL CODE", pa:"ਰੈਫਰਲ ਕੋਡ"})}</div><div style={{fontSize:'1.1rem', fontFamily:'monospace', color:'white'}}>{code||'••••••'}</div></div><button onClick={fetchCode} style={{padding:'8px 16px', borderRadius:8, border:'none', background:'#fb923c', color:'#431407', fontWeight:700, cursor:'pointer'}}>{t({en:"Get Code", pa:"ਕੋਡ ਪ੍ਰਾਪਤ ਕਰੋ"})}</button></div><button onClick={handleLogout} style={{width:'100%', padding:15, borderRadius:16, background:'rgba(239, 68, 68, 0.15)', color:'#f87171', border:'1px solid rgba(239, 68, 68, 0.3)', fontSize:'1rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10}}><LogOut size={20}/> {t({en:"Sign Out", pa:"ਸਾਈਨ ਆਉਟ"})}</button></div>
}