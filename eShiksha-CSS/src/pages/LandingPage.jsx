import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api'; 
import { BookOpen, Users, ChevronRight, Activity, Wifi, Globe } from 'lucide-react';

// 1. IMPORT THE HOOK
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const [userStats, setUserStats] = useState({ totalUsers: 0, studentCount: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // 2. GET THE TRANSLATOR FUNCTION
  const { t } = useLanguage();

  // 3. DEFINE YOUR TRANSLATIONS
  const content = {
    version: { en: "SYSTEM v2.0 ONLINE", pa: "ਸਿਸਟਮ v2.0 ਔਨਲਾਈਨ" },
    status: { en: "Status", pa: "ਸਥਿਤੀ" },
    statusVal: { en: "Optimal", pa: "ਵਧੀਆ" },
    active: { en: "Active", pa: "ਐਕਟਿਵ" },
    online: { en: "Online", pa: "ਔਨਲਾਈਨ" },
    titleStart: { en: "eShiksha", pa: "ਈ-ਸਿੱਖਿਆ" },
    titleEnd: { en: "Nabha", pa: "ਨਾਭਾ" },
    subtitle: { en: "Next-generation offline-first infrastructure for rural education.", pa: "ਪੇਂਡੂ ਸਿੱਖਿਆ ਲਈ ਅਗਲੀ ਪੀੜ੍ਹੀ ਦਾ ਔਫਲਾਈਨ ਬੁਨਿਆਦੀ ਢਾਂਚਾ।" },
    subtitle2: { en: "Bridging the digital divide with AI.", pa: "ਏਆਈ (AI) ਨਾਲ ਡਿਜੀਟਲ ਪਾੜੇ ਨੂੰ ਪੂਰਾ ਕਰਨਾ।" },
    stu_portal: { en: "Student Portal", pa: "ਵਿਦਿਆਰਥੀ ਪੋਰਟਲ" },
    stu_desc: { en: "Access immersive lessons, adaptive AI quizzes, and real-time performance tracking.", pa: "ਦਿਲਚਸਪ ਪਾਠ, ਅਨੁਕੂਲਿਤ ਕਵਿਜ਼ ਅਤੇ ਰੀਅਲ-ਟਾਈਮ ਪ੍ਰਦਰਸ਼ਨ ਟ੍ਰੈਕਿੰਗ ਪ੍ਰਾਪਤ ਕਰੋ।" },
    enter: { en: "Enter Portal", pa: "ਪੋਰਟਲ ਖੋਲ੍ਹੋ" },
    teach_portal: { en: "Teacher Portal", pa: "ਅਧਿਆਪਕ ਪੋਰਟਲ" },
    teach_desc: { en: "Manage classrooms, upload content, and view comprehensive analytics.", pa: "ਕਲਾਸਰੂਮਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ, ਸਮੱਗਰੀ ਅਪਲੋਡ ਕਰੋ ਅਤੇ ਵਿਆਪਕ ਰਿਪੋਰਟਾਂ ਦੇਖੋ।" }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/stats');
        setUserStats({
          totalUsers: res.data?.totalUsers ?? 0,
          studentCount: res.data?.studentCount ?? 0,
        });
      } catch (err) {
        console.error('Failed to fetch user stats', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="landing-wrapper">
      <style>{`
        /* ... (Your existing CSS remains exactly the same, do not delete it) ... */
        :root {
          --bg-deep: #030712;
          --glass-surface: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(255, 255, 255, 0.08);
          --primary-glow: #06b6d4;
          --accent-glow: #8b5cf6;
        }
        .landing-wrapper { min-height: 100vh; width: 100%; display: flex; flex-direction: column; align-items: center; position: relative; background-color: var(--bg-deep); color: white; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        .ambient-light { position: absolute; width: 100%; height: 100%; z-index: 0; background: radial-gradient(circle at 15% 20%, rgba(6, 182, 212, 0.08), transparent 40%), radial-gradient(circle at 85% 80%, rgba(139, 92, 246, 0.08), transparent 40%); pointer-events: none; }
        .grid-lines { position: absolute; inset: 0; z-index: 0; background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(circle at center, black 40%, transparent 90%); pointer-events: none; }
        .landing-container { z-index: 10; padding: 2rem 1.5rem; width: 100%; max-width: 1400px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
        .header-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 3rem; flex-wrap: wrap; gap: 1.5rem; }
        @media (max-width: 768px) { .header-bar { flex-direction: column; margin-bottom: 2rem; } .landing-container { justify-content: flex-start; padding-top: 3rem; } }
        .version-pill { display: flex; align-items: center; gap: 12px; padding: 8px 20px; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--glass-border); border-radius: 100px; backdrop-filter: blur(10px); }
        .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 12px #22c55e; }
        .version-text { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; letter-spacing: 1.5px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
        .stats-deck { display: flex; gap: 30px; align-items: center; padding: 10px 24px; background: linear-gradient(90deg, rgba(255,255,255,0.01), rgba(255,255,255,0.04)); border: 1px solid var(--glass-border); border-radius: 100px; backdrop-filter: blur(5px); flex-wrap: wrap; justify-content: center; }
        @media (max-width: 480px) { .stats-deck { gap: 20px; padding: 8px 16px; width: 100%; border-radius: 20px; } }
        .stat-unit { display: flex; align-items: center; gap: 10px; }
        .stat-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 2px; }
        .stat-num { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 700; color: #e2e8f0; }
        
        .hero-section { text-align: center; margin-top: 2vh; margin-bottom: 6vh; width: 100%; }
        .main-title { font-size: clamp(3rem, 10vw, 7rem); font-weight: 800; line-height: 1.4; letter-spacing: -0.04em; background: linear-gradient(180deg, #fff 0%, #94a3b8 100%); -webkit-background-clip: text; color: transparent; margin-bottom: 20px; padding-top: 0.15em; padding-bottom: 0.15em; }
        .highlight-gradient { background: linear-gradient(135deg, var(--primary-glow) 0%, #22c55e 100%); -webkit-background-clip: text; color: transparent; padding-top: 0.15em; padding-bottom: 0.15em; }
        .sub-text { font-size: clamp(1rem, 4vw, 1.25rem); color: #94a3b8; max-width: 600px; margin: 0 auto; line-height: 1.6; padding: 0 1rem; }
        
        .portal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; width: 100%; max-width: 1000px; margin-bottom: 2rem; }
        @media (max-width: 850px) { .portal-grid { grid-template-columns: 1fr; gap: 24px; max-width: 500px; } }
        .portal-card { position: relative; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); padding: 40px; height: 280px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); border-radius: 40px; }
        @media (max-width: 480px) { .portal-card { padding: 30px; height: 260px; border-radius: 30px; } }
        .portal-card:hover { background: rgba(255, 255, 255, 0.04); transform: translateY(-5px); border-color: rgba(255, 255, 255, 0.15); }
        .icon-box { width: 60px; height: 60px; background: rgba(255, 255, 255, 0.05); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .icon-box svg { display: block; }
        .card-h { font-size: 2rem; font-weight: 700; color: white; margin-bottom: 8px; letter-spacing: -0.02em; }
        .card-p { font-size: 1rem; color: #94a3b8; line-height: 1.5; max-width: 95%; }
        .action-row { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 0.9rem; letter-spacing: 0.5px; text-transform: uppercase; }
        .theme-student .icon-box { color: var(--primary-glow); box-shadow: 0 0 20px rgba(6, 182, 212, 0.1); }
        .theme-student .action-row { color: var(--primary-glow); }
        .theme-student:hover { box-shadow: 0 20px 40px -10px rgba(6, 182, 212, 0.15); border-color: rgba(6, 182, 212, 0.3); }
        .theme-teacher .icon-box { color: var(--accent-glow); box-shadow: 0 0 20px rgba(139, 92, 246, 0.1); }
        .theme-teacher .action-row { color: var(--accent-glow); }
        .theme-teacher:hover { box-shadow: 0 20px 40px -10px rgba(139, 92, 246, 0.15); border-color: rgba(139, 92, 246, 0.3); }
      `}</style>
      
      <div className="ambient-light"></div>
      <div className="grid-lines"></div>

      <motion.div 
        className="landing-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* HEADER */}
        <motion.div className="header-bar" variants={itemVariants}>
          <div className="version-pill">
            <span className="live-dot"></span>
            {/* 4. USE TRANSLATION FUNCTION */}
            <span className="version-text">{t(content.version)}</span>
          </div>

          <div className="stats-deck">
             <StatItem icon={<Activity size={16} color="#06b6d4" />} label={t(content.status)} value={t(content.statusVal)} />
             <StatItem icon={<Wifi size={16} color="#8b5cf6" />} label={t(content.active)} value={statsLoading ? '...' : userStats.totalUsers} />
             <StatItem icon={<Globe size={16} color="#22c55e" />} label={t(content.online)} value={statsLoading ? '...' : userStats.studentCount} />
          </div>
        </motion.div>

        {/* HERO */}
        <motion.div className="hero-section" variants={itemVariants}>
          <h1 className="main-title">
            {t(content.titleStart)} <span className="highlight-gradient">{t(content.titleEnd)}</span>
          </h1>
          <p className="sub-text">
            {t(content.subtitle)}
            <br /> {t(content.subtitle2)}
          </p>
        </motion.div>

        {/* CARDS */}
        <motion.div className="portal-grid" variants={itemVariants}>
          
          <Link to="/login?role=student" style={{ textDecoration: 'none' }}>
            <div className="portal-card theme-student">
              <div>
                <div className="icon-box"><BookOpen size={32} strokeWidth={1.5} /></div>
                <h2 className="card-h">{t(content.stu_portal)}</h2>
                <p className="card-p">{t(content.stu_desc)}</p>
              </div>
              <div className="action-row">
                {t(content.enter)} <ChevronRight size={16} />
              </div>
            </div>
          </Link>

          <Link to="/login?role=teacher" style={{ textDecoration: 'none' }}>
            <div className="portal-card theme-teacher">
              <div>
                <div className="icon-box"><Users size={32} strokeWidth={1.5} /></div>
                <h2 className="card-h">{t(content.teach_portal)}</h2>
                <p className="card-p">{t(content.teach_desc)}</p>
              </div>
              <div className="action-row">
                {t(content.enter)} <ChevronRight size={16} />
              </div>
            </div>
          </Link>

        </motion.div>

      </motion.div>
    </div>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <div className="stat-unit">
      {icon}
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-num">{value}</div>
      </div>
    </div>
  );
}