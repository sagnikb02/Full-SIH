import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/GlassCard';
import { useNavigate } from "react-router-dom";
import {
  Activity,
  MessageSquare,
  TrendingUp,
  FileText,
  Phone,
  Calendar,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import api from '../../api';

export default function ParentDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/");
};

  const [activeModal, setActiveModal] = useState(null);

  const [overview, setOverview] = useState(null); // { student, attempts }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- fetch parent overview (linked student + attempts) ---
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/parents/overview');
        setOverview(res.data || null);
      } catch (err) {
        console.error('Parent overview error:', err);
        setError(
          err.response?.data?.message ||
            'Failed to load student data for this parent.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const student = overview?.student || null;
  const attempts = overview?.attempts || [];

  // --- derived quiz stats ---
  const quizStats = useMemo(() => {
    if (!attempts.length) {
      return {
        totalAttempts: 0,
        averagePercent: null,
        bestPercent: null,
      };
    }

    let totalPercent = 0;
    let bestPercent = 0;

    attempts.forEach((att) => {
      const percent =
        att.total > 0 ? Math.round((att.score / att.total) * 100) : 0;
      totalPercent += percent;
      if (percent > bestPercent) bestPercent = percent;
    });

    const averagePercent = Math.round(totalPercent / attempts.length);

    return {
      totalAttempts: attempts.length,
      averagePercent,
      bestPercent,
    };
  }, [attempts]);

  const lastFive = useMemo(() => {
    return attempts.slice(0, 5).map((att) => {
      const percent =
        att.total > 0 ? Math.round((att.score / att.total) * 100) : 0;
      // Small date label like "Oct 15"
      let dateLabel = '';
      try {
        const d = new Date(att.createdAt);
        const opts = { month: 'short', day: '2-digit' };
        dateLabel = d.toLocaleDateString(undefined, opts);
      } catch {
        dateLabel = '';
      }

      return {
        id: att._id,
        title: att.quiz?.title || 'Quiz',
        subject: att.quiz?.subject || '',
        className: att.quiz?.className || '',
        percent,
        date: dateLabel,
      };
    });
  }, [attempts]);

  const gradeFromPercent = (p) => {
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B';
    if (p >= 60) return 'C';
    return 'D';
  };

  const closeModal = () => setActiveModal(null);

  // Simple auto-generated “alerts” based on performance
  const generatedAlerts = useMemo(() => {
    if (!attempts.length) {
      return [
        {
          type: 'info',
          msg: 'No online quiz attempts recorded yet.',
          date: 'Recently',
        },
      ];
    }

    const alerts = [];

    alerts.push({
      type: 'score',
      msg: `Completed ${quizStats.totalAttempts} quiz${
        quizStats.totalAttempts > 1 ? 'zes' : ''
      } with an average score of ${quizStats.averagePercent}%.`,
      date: 'This term',
    });

    if (quizStats.averagePercent < 60) {
      alerts.push({
        type: 'absent',
        msg: 'Average score is below 60%. Consider revising recent topics.',
        date: 'Performance note',
      });
    }

    return alerts;
  }, [attempts, quizStats]);

  return (
    <div
      className="container"
      style={{ marginTop: '40px', paddingBottom: '100px' }}
    >
      {/* --- HEADER --- */}
      <header
        className="flex-between"
        style={{ marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}
      >
        <div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'linear-gradient(to right, #fff, #4ade80)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Parent Portal
          </h1>
          {loading && !student && (
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
              Loading student details…
            </p>
          )}
          {!loading && student && (
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
              Tracking:{' '}
              <span style={{ color: 'white', fontWeight: 'bold' }}>
                {student.name}
              </span>{' '}
              {student.className && (
                <span style={{ color: '#64748b' }}>
                  (Class {student.className})
                </span>
              )}
            </p>
          )}
          {!loading && !student && error && (
            <p style={{ color: '#f97373', fontSize: '0.95rem' }}>{error}</p>
          )}
        </div>

        <div className="flex-center" style={{ gap: '15px' }}>
          <button
            className="btn-primary"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10b981',
              color: '#4ade80',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingInline: '16px',
            }}
          >
            <Phone size={18} /> Contact Teacher
          </button>
          <button
            onClick={handleLogout}
            
              style={{
                      marginTop: "4px",
                      width: "30%",
                      padding: "10px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      background: "rgba(239,68,68,0.2)",
                      color: "#fca5a5",
                      border: "1px solid rgba(239,68,68,0.4)",
                      cursor: "pointer",
                      transition: "0.25s",
                    }}
                    onMouseEnter={(e) => (e.target.style.boxShadow = "0 0 12px rgba(239,68,68,0.6)")}
                    onMouseLeave={(e) => (e.target.style.boxShadow = "none")}
            >
          Logout
        </button>

        </div>
      </header>

      {/* --- GRID LAYOUT --- */}
      <div className="grid-layout">
        {/* 1. PERFORMANCE SUMMARY (no fake graph, just stats) */}
        <GlassCard style={{ gridColumn: 'span 2' }}>
          <div
            className="flex-between"
            style={{ marginBottom: '20px', alignItems: 'flex-start' }}
          >
            <div>
              <h3
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Activity color="#4ade80" /> Academic Performance
              </h3>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  marginTop: '4px',
                }}
              >
                Based on online quizzes taken in this class.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Overall Progress
              </span>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: quizStats.averagePercent != null ? '#4ade80' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '5px',
                }}
              >
                <TrendingUp size={22} />
                {quizStats.averagePercent != null
                  ? `${quizStats.averagePercent}%`
                  : 'No data'}
              </div>
            </div>
          </div>

          {/* Stat tiles row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
            }}
          >
            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(148,163,184,0.3)',
              }}
            >
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Quizzes Attempted
              </p>
              <p
                style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: 'white',
                  marginTop: '4px',
                }}
              >
                {quizStats.totalAttempts}
              </p>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                background:
                  'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(15,23,42,0.9))',
                border: '1px solid rgba(34,197,94,0.4)',
              }}
            >
              <p style={{ fontSize: '0.75rem', color: '#bbf7d0' }}>
                Average Score
              </p>
              <p
                style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: '#bbf7d0',
                  marginTop: '4px',
                }}
              >
                {quizStats.averagePercent != null
                  ? `${quizStats.averagePercent}%`
                  : '--'}
              </p>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                background:
                  'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(15,23,42,0.9))',
                border: '1px solid rgba(59,130,246,0.4)',
              }}
            >
              <p style={{ fontSize: '0.75rem', color: '#bfdbfe' }}>
                Best Quiz Score
              </p>
              <p
                style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: '#bfdbfe',
                  marginTop: '4px',
                }}
              >
                {quizStats.bestPercent != null
                  ? `${quizStats.bestPercent}%`
                  : '--'}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* 2. RECENT QUIZ RESULTS */}
        <GlassCard
          delay={0.1}
          style={{ gridRow: 'span 2', display: 'flex', flexDirection: 'column' }}
        >
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              Recent Quizzes
            </h3>
            <FileText color="var(--primary)" size={20} />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flexGrow: 1,
            }}
          >
            {lastFive.length === 0 && !loading && (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#94a3b8',
                }}
              >
                No quiz attempts recorded yet.
              </p>
            )}

            {lastFive.map((exam) => {
              const grade = gradeFromPercent(exam.percent);
              const borderColor =
                grade === 'A+' || grade === 'A'
                  ? '#4ade80'
                  : grade === 'B'
                  ? '#fb923c'
                  : '#ef4444';

              return (
                <div
                  key={exam.id}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: '12px',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${borderColor}`,
                  }}
                >
                  <div className="flex-between">
                    <span
                      style={{
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        color: 'white',
                      }}
                    >
                      {exam.title}
                    </span>
                    {exam.date && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {exam.date}
                      </span>
                    )}
                  </div>
                  <div
                    className="flex-between"
                    style={{ marginTop: '5px', alignItems: 'center' }}
                  >
                    <div>
                      {exam.subject && (
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                          }}
                        >
                          {exam.subject}
                          {exam.className && ` • Class ${exam.className}`}
                        </p>
                      )}
                      <span
                        style={{ fontSize: '0.85rem', color: '#94a3b8' }}
                      >
                        Score:{' '}
                        <strong style={{ color: 'white' }}>
                          {exam.percent}%
                        </strong>
                      </span>
                    </div>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: grade.includes('A')
                          ? '#4ade80'
                          : grade === 'B'
                          ? '#fbbf24'
                          : '#f97373',
                        fontSize: '0.95rem',
                      }}
                    >
                      {grade}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setActiveModal('report')}
            className="btn-primary"
            style={{
              marginTop: '20px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            View Full Report Card
          </button>
        </GlassCard>

        {/* 3. ALERTS & NOTIFICATIONS (uses generated alerts) */}
        <GlassCard delay={0.2}>
          <div className="flex-between" style={{ marginBottom: '15px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              Performance Alerts
            </h3>
            <MessageSquare color="#fb923c" size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {generatedAlerts.map((alert, i) => (
              <div
                key={i}
                style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}
              >
                <div style={{ marginTop: '2px' }}>
                  {alert.type === 'absent' ? (
                    <AlertCircle size={16} color="#ef4444" />
                  ) : (
                    <CheckCircle2 size={16} color="#4ade80" />
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                    {alert.msg}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {alert.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 4. ATTENDANCE MINI-CARD – simple placeholder for now */}
        <GlassCard
          delay={0.3}
          style={{
            background:
              'linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent)',
          }}
        >
          <div className="flex-between">
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Attendance
              </p>
              <h3
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                {/* Placeholder until you wire real attendance */}
                {student ? '94%' : '--'}
              </h3>
            </div>
            <Calendar size={32} color="#3b82f6" style={{ opacity: 0.8 }} />
          </div>
          <div
            style={{
              height: '4px',
              width: '100%',
              background: '#1e293b',
              borderRadius: '2px',
              marginTop: '15px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: student ? '94%' : '0%',
                background: '#3b82f6',
                borderRadius: '2px',
              }}
            ></div>
          </div>
        </GlassCard>
      </div>

      {/* --- MODAL SYSTEM --- */}
      <AnimatePresence>
        {activeModal === 'report' && (
          <ModalWrapper onClose={closeModal}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <FileText
                size={48}
                color="var(--primary)"
                style={{ margin: '0 auto 20px' }}
              />
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                Full Academic Report
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
                This will show a detailed breakdown of all quiz performance for{' '}
                {student?.name || 'your child'}.
              </p>
              <div
                style={{
                  padding: '20px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  color: '#e5e7eb',
                }}
              >
                You can later replace this with a downloadable PDF marksheet or
                a more detailed table of scores.
              </div>
              <button className="btn-primary" onClick={closeModal}>
                Close
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );

}



// --- MODAL WRAPPER ---
function ModalWrapper({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          width: '100%',
          maxWidth: '500px',
          background: '#0f172a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '24px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
          }}
        >
          <X size={24} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
