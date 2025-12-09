import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, ArrowRight, ChevronLeft, ShieldCheck,
  CheckCircle2, UserPlus, Mail, KeyRound, Send,
  Eye, EyeOff, RefreshCw, GraduationCap, Library, BookOpen, AlertCircle, Phone 
} from 'lucide-react';

import api from '../api';

// 1. IMPORT THE HOOK
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 2. GET THE TRANSLATOR
  const { t } = useLanguage();

  const portalRole = searchParams.get('role') || 'student'; 

  const [view, setView] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); 
  const [successMsg, setSuccessMsg] = useState('');
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    studentCode: '',
    parentPhone: '',   // 🔹 NEW
  });

  const [pendingSignupData, setPendingSignupData] = useState(null);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

  // 3. DEFINE TRANSLATIONS
  const content = {
    // General
    back_home: { en: "Back to Home", pa: "ਵਾਪਸ ਘਰ" },
    back_login: { en: "Back to Login", pa: "ਲੌਗਇਨ ਤੇ ਵਾਪਸ" },
    back_details: { en: "Back to Details", pa: "ਵੇਰਵਿਆਂ ਤੇ ਵਾਪਸ" },
    change_user: { en: "Change User", pa: "ਯੂਜ਼ਰ ਬਦਲੋ" },
    
    // Role Titles
    label_student: { en: "Student Learning Hub", pa: "ਵਿਦਿਆਰਥੀ ਸਿਖਲਾਈ ਕੇਂਦਰ" },
    label_teacher: { en: "Educator Console", pa: "ਅਧਿਆਪਕ ਕੰਸੋਲ" },
    label_parent: { en: "Guardian Portal", pa: "ਸਰਪ੍ਰਸਤ ਪੋਰਟਲ" },

    // Login View
    welcome: { en: "Welcome Back", pa: "ਜੀ ਆਇਆਂ ਨੂੰ" },
    access_secure: { en: "Access your secure", pa: "ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਦਾਖਲ ਹੋਵੋ" },
    lbl_email: { en: "Academic ID / Email", pa: "ਅਕਾਦਮਿਕ ਆਈਡੀ / ਈਮੇਲ" },
    lbl_pass: { en: "Password", pa: "ਪਾਸਵਰਡ" },
    ph_email: { en: "Email Address", pa: "ਈਮੇਲ ਪਤਾ" },
    forgot_pass: { en: "Forgot Password?", pa: "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?" },
    btn_signin: { en: "Secure Sign In", pa: "ਸੁਰੱਖਿਅਤ ਸਾਈਨ ਇਨ" },
    new_platform: { en: "New to the platform?", pa: "ਪਲੇਟਫਾਰਮ 'ਤੇ ਨਵੇਂ ਹੋ?" },
    act_account: { en: "Activate Account", pa: "ਖਾਤਾ ਚਾਲੂ ਕਰੋ" },

    // Signup View
    join_the: { en: "Join the", pa: "ਸ਼ਾਮਲ ਹੋਵੋ" },
    ph_name: { en: "Full Legal Name", pa: "ਪੂਰਾ ਕਾਨੂੰਨੀ ਨਾਮ" },
    ph_school_email: { en: "School Email Address", pa: "ਸਕੂਲ ਈਮੇਲ ਪਤਾ" },
    ph_create_pass: { en: "Create Password", pa: "ਪਾਸਵਰਡ ਬਣਾਓ" },
    ph_confirm_pass: { en: "Confirm Password", pa: "ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ" },
    ph_ref_code: { en: "Class referral code", pa: "ਕਲਾਸ ਰੈਫਰਲ ਕੋਡ" },
    msg_ref_code: { en: "Ask your teacher for this code.", pa: "ਇਸ ਕੋਡ ਲਈ ਆਪਣੇ ਅਧਿਆਪਕ ਨੂੰ ਪੁੱਛੋ।" },
    ph_parent_code: { en: "Enter your child's code", pa: "ਆਪਣੇ ਬੱਚੇ ਦਾ ਕੋਡ ਦਰਜ ਕਰੋ" },
    // 🔹 NEW
    ph_parent_phone: { 
      en: "Parent phone number", 
      pa: "ਮਾਪਿਆਂ ਦਾ ਫੋਨ ਨੰਬਰ" 
    },
    msg_parent_phone: { 
      en: "Results SMS will be sent here (optional for teachers).", 
      pa: "ਨਤੀਜਿਆਂ ਦੇ SMS ਇੱਥੇ ਭੇਜੇ ਜਾਣਗੇ (ਅਧਿਆਪਕਾਂ ਲਈ ਚੋਣਵਾਂ)." 
    },

    msg_parent_code: { en: "Use the parent access code given by the school.", pa: "ਸਕੂਲ ਦੁਆਰਾ ਦਿੱਤਾ ਗਿਆ ਮਾਪਿਆਂ ਦਾ ਐਕਸੈਸ ਕੋਡ ਵਰਤੋ।" },
    btn_send_otp: { en: "Send OTP", pa: "OTP ਭੇਜੋ" },
    already_account: { en: "Already have an account?", pa: "ਪਹਿਲਾਂ ਹੀ ਖਾਤਾ ਹੈ?" },
    sign_in: { en: "Sign In", pa: "ਸਾਈਨ ਇਨ" },

    // OTP Verify
    verify_email: { en: "Verify Your Email", pa: "ਆਪਣੀ ਈਮੇਲ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ" },
    enter_code_msg: { en: "Enter the 6-digit code sent to", pa: "ਨੂੰ ਭੇਜਿਆ ਗਿਆ 6-ਅੰਕਾਂ ਦਾ ਕੋਡ ਦਰਜ ਕਰੋ" },
    btn_verify_create: { en: "Verify & Create Account", pa: "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਖਾਤਾ ਬਣਾਓ" },
    didnt_receive: { en: "Didn't receive it?", pa: "ਇਹ ਪ੍ਰਾਪਤ ਨਹੀਂ ਹੋਇਆ?" },
    resend_code: { en: "Resend Code", pa: "ਕੋਡ ਦੁਬਾਰਾ ਭੇਜੋ" },

    // Forgot Password
    acc_recovery: { en: "Account Recovery", pa: "ਖਾਤਾ ਰਿਕਵਰੀ" },
    recovery_msg: { en: "We'll send a verification code to your registered email.", pa: "ਅਸੀਂ ਤੁਹਾਡੀ ਰਜਿਸਟਰਡ ਈਮੇਲ 'ਤੇ ਇੱਕ ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ ਭੇਜਾਂਗੇ।" },
    btn_send_verif: { en: "Send Verification Code", pa: "ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ ਭੇਜੋ" },
    security_check: { en: "Security Check", pa: "ਸੁਰੱਖਿਆ ਜਾਂਚ" },
    btn_verify_access: { en: "Verify & Access", pa: "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਪਹੁੰਚ ਪ੍ਰਾਪਤ ਕਰੋ" },

    // Reset Password
    set_new_pass: { en: "Set New Password", pa: "ਨਵਾਂ ਪਾਸਵਰਡ ਸੈੱਟ ਕਰੋ" },
    create_secure_pass: { en: "Create a secure password to access your account.", pa: "ਆਪਣੇ ਖਾਤੇ ਤੱਕ ਪਹੁੰਚ ਕਰਨ ਲਈ ਇੱਕ ਸੁਰੱਖਿਅਤ ਪਾਸਵਰਡ ਬਣਾਓ।" },
    ph_new_pass: { en: "New Password", pa: "ਨਵਾਂ ਪਾਸਵਰਡ" },
    ph_conf_new_pass: { en: "Confirm New Password", pa: "ਨਵੇਂ ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ" },
    btn_update_pass: { en: "Update Password", pa: "ਪਾਸਵਰਡ ਅੱਪਡੇਟ ਕਰੋ" },

    // Class Select
    select_curr: { en: "Select Curriculum", pa: "ਪਾਠਕ੍ਰਮ ਚੁਣੋ" },
    choose_env: { en: "Choose your active learning environment", pa: "ਆਪਣਾ ਸਰਗਰਮ ਸਿੱਖਣ ਦਾ ਮਾਹੌਲ ਚੁਣੋ" },
    standard: { en: "Standard", pa: "ਕਲਾਸ" }
  };

  const roleTheme = {
    student: {
      color: '#0ea5e9',
      glow: '0 0 60px rgba(14, 165, 233, 0.25)',
      bgGradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
      label: t(content.label_student), // Dynamic Translation
      icon: <GraduationCap size={28} />
    },
    teacher: {
      color: '#f59e0b',
      glow: '0 0 60px rgba(245, 158, 11, 0.25)',
      bgGradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
      label: t(content.label_teacher), // Dynamic Translation
      icon: <Library size={28} />
    },
    parent: {
      color: '#10b981',
      glow: '0 0 60px rgba(16, 185, 129, 0.25)',
      bgGradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      label: t(content.label_parent), // Dynamic Translation
      icon: <ShieldCheck size={28} />
    }
  };

  const currentTheme = roleTheme[portalRole] || roleTheme.student;
  const classes = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const rotateX = (y - centerY) / 30;
    const rotateY = (centerX - x) / 30;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'parent') {
        navigate('/parent/dashboard');
      } else if (user.role === 'teacher') {
        setView('class-select'); 
      } else if (user.role === 'student') {
        if (user.className) navigate('/student/dashboard');
        else setView('class-select');
      } else {
        navigate('/student/dashboard'); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: portalRole,
      };

    if (portalRole === 'student') {
      payload.referralCode = form.referralCode;
      payload.parentPhone = form.parentPhone;          // 🔹 required for students
    } else if (portalRole === 'teacher') {
      // optional for teachers – only send if filled
      if (form.parentPhone?.trim()) {
        payload.parentPhone = form.parentPhone.trim();
      }
    } else if (portalRole === 'parent') {
      payload.studentCode = form.studentCode;
    }

    setPendingSignupData(payload);
    await api.post('/auth/register/send-otp', { email: payload.email, role: portalRole });


      setOtp('');
      setSuccessMsg(`OTP sent to ${payload.email}.`);
      setView('signup-otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    if (!pendingSignupData) {
      setError('Session expired.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await api.post('/auth/register', { ...pendingSignupData, otp });
      setSuccessMsg('Registration successful! Please log in.');
      setView('login');
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        referralCode: '',
        studentCode: '',
        parentPhone: '',   // 🔹 reset
      });

      setPendingSignupData(null);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendSignupOtp = async () => {
    if (!pendingSignupData?.email) return;
    setError(null);
    setIsLoading(true);
    try {
      await api.post('/auth/register/send-otp', { email: pendingSignupData.email, role: portalRole });
      setSuccessMsg(`OTP resent to ${pendingSignupData.email}.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setError(null);
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: resetEmail });
      setView('otp-verify');
      setSuccessMsg(`OTP sent to ${resetEmail}`);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(<span>Email not found. <button className="text-link-inline" onClick={() => setView('signup')}>Create Account?</button></span>);
      } else {
        setError(err.response?.data?.message || 'Failed to send OTP.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: resetEmail, otp });
      setView('reset-password');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email: resetEmail, otp, newPassword });
      setSuccessMsg("Password reset successful!");
      setView("login");
      setOtp(''); setNewPassword(''); setConfirmNewPassword(''); setResetEmail('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = async (selectedClass) => {
    if (portalRole === 'teacher') {
      localStorage.setItem('teacherActiveClass', selectedClass);
      navigate('/teacher/dashboard');
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.patch('/auth/class', { className: String(selectedClass) });
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser) {
        currentUser.className = res.data.className;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      navigate('/student/dashboard');
    } catch (err) {
      navigate('/student/dashboard'); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <style>{`
        :root { --theme-color: ${currentTheme.color}; --theme-glow: ${currentTheme.glow}; }
        .login-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; background-color: #0f172a; font-family: 'Inter', sans-serif; perspective: 1500px; padding: 20px; overflow-y: auto; }
        .knowledge-pattern { position: absolute; inset: 0; background-image: radial-gradient(circle at center, rgba(255,255,255,0.03) 2px, transparent 2px), linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 40px 40px, 80px 80px, 80px 80px; mask-image: radial-gradient(circle at center, black 40%, transparent 95%); z-index: 1; pointer-events: none; }
        .orb-1, .orb-2 { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.4; animation: float 20s infinite alternate; pointer-events: none; }
        .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, var(--theme-color) 0%, transparent 70%); top: -10%; left: -10%; }
        .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, #6366f1 0%, transparent 70%); bottom: -10%; right: -10%; animation-delay: -5s; }
        @keyframes float { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }
        .login-container { position: relative; z-index: 10; width: 100%; max-width: 440px; transform-style: preserve-3d; }
        .ed-card { background: rgba(30, 41, 59, 0.75); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.1); border-top: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 48px; box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), var(--theme-glow); overflow: hidden; transition: border-color 0.3s ease; }
        .ed-card:hover { border-color: rgba(255, 255, 255, 0.2); }
        .header-section { text-align: center; margin-bottom: 32px; transform: translateZ(20px); }
        .logo-mark { width: 72px; height: 72px; margin: 0 auto 20px; border-radius: 20px; background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 8px 32px rgba(0,0,0,0.2); position: relative; }
        .logo-mark svg { filter: drop-shadow(0 4px 12px var(--theme-color)); }
        .page-title { font-size: 1.75rem; font-weight: 800; color: white; margin-bottom: 8px; letter-spacing: -0.02em; }
        .page-subtitle { color: #94a3b8; font-size: 0.95rem; font-weight: 400; line-height: 1.5; }
        .input-group { margin-bottom: 24px; transform: translateZ(10px); }
        .input-label { display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .input-box { position: relative; }
        .ed-input { width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px 44px 16px 48px; color: white; font-size: 1rem; outline: none; transition: all 0.3s ease; }
        .ed-input:focus { border-color: var(--theme-color); background: rgba(15, 23, 42, 0.9); box-shadow: 0 0 0 1px var(--theme-color), 0 0 20px -10px var(--theme-color); }
        .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b; transition: color 0.3s; pointer-events: none; }
        .ed-input:focus ~ .input-icon { color: var(--theme-color); }
        .password-toggle { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #64748b; cursor: pointer; transition: color 0.2s; background: none; border: none; padding: 0; display: flex; }
        .password-toggle:hover { color: white; }
        .forgot-pass-wrapper { text-align: right; margin-top: -10px; margin-bottom: 24px; }
        .forgot-pass-link { font-size: 0.85rem; color: #94a3b8; cursor: pointer; transition: color 0.2s; font-weight: 500; }
        .forgot-pass-link:hover { color: var(--theme-color); text-decoration: underline; }
        .action-btn { width: 100%; padding: 16px; border-radius: 12px; border: none; background: ${currentTheme.bgGradient}; color: white; font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease; box-shadow: 0 8px 20px -8px var(--theme-color); margin-top: 10px; position: relative; overflow: hidden; transform: translateZ(15px); }
        .action-btn:hover { transform: translateZ(20px) translateY(-2px); box-shadow: 0 15px 30px -10px var(--theme-color); }
        .action-btn:active { transform: translateZ(15px) translateY(0); }
        .btn-spinner { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-footer { margin-top: 28px; text-align: center; font-size: 0.85rem; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }
        .text-link { color: var(--theme-color); font-weight: 600; cursor: pointer; margin-left: 4px; transition: opacity 0.2s; }
        .text-link:hover { opacity: 0.8; text-decoration: underline; }
        .text-link-inline { color: var(--theme-color); font-weight: 600; cursor: pointer; text-decoration: underline; background: none; border: none; padding: 0; font-size: inherit; }
        .back-nav { background: none; border: none; color: #94a3b8; font-size: 0.85rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; margin-bottom: 24px; transition: color 0.2s; }
        .back-nav:hover { color: white; }
        .error-msg { color: #ef4444; font-size: 0.85rem; margin-bottom: 12px; background: rgba(239, 68, 68, 0.1); padding: 10px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; gap: 8px; }
        .class-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 24px; max-height: 400px; overflow-y: auto; padding-right: 4px; }
        .class-grid::-webkit-scrollbar { width: 4px; }
        .class-grid::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .class-grid::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .class-btn { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 12px 8px; text-align: center; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .class-btn:hover { background: rgba(255, 255, 255, 0.06); border-color: var(--theme-color); transform: translateY(-2px); }
        .class-number { font-size: 1.5rem; font-weight: 700; color: white; line-height: 1; margin-bottom: 4px; }
        .class-label { font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        @media (max-width: 640px) { .ed-card { padding: 32px 24px; } .page-title { font-size: 1.5rem; } .logo-mark { width: 60px; height: 60px; } .class-grid { grid-template-columns: repeat(2, 1fr); } .login-container { max-width: 100%; margin: 20px 0; } }
      `}</style>

      <div className="orb-1"></div>
      <div className="orb-2"></div>
      <div className="knowledge-pattern"></div>

      <motion.div className="login-container" animate={{ y: [0, -10, 0], transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` }}>
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="ed-card">
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: LOGIN */}
            {view === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <button onClick={() => navigate('/')} className="back-nav"><ChevronLeft size={16} /> {t(content.back_home)}</button>
                <div className="header-section">
                  <div className="logo-mark">{currentTheme.icon}</div>
                  <h1 className="page-title">{t(content.welcome)}</h1>
                  <p className="page-subtitle">{t(content.access_secure)} {currentTheme.label}</p>
                </div>
                <form onSubmit={handleAuth}>
                  <div className="input-group">
                    <label className="input-label">{t(content.lbl_email)}</label>
                    <div className="input-box">
                      <input type="text" className="ed-input" placeholder={t(content.ph_email)} required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                      <User size={18} className="input-icon" />
                    </div>
                  </div>
                  <div className="input-group" style={{ marginBottom: '10px' }}>
                    <label className="input-label">{t(content.lbl_pass)}</label>
                    <div className="input-box">
                      <input type={showLoginPass ? "text" : "password"} className="ed-input" placeholder="••••••••" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                      <Lock size={18} className="input-icon" />
                      <button type="button" className="password-toggle" onClick={() => setShowLoginPass(!showLoginPass)}>{showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                  </div>
                  <div className="forgot-pass-wrapper">
                    <span className="forgot-pass-link" onClick={() => setView('forgot-password')}>{t(content.forgot_pass)}</span>
                  </div>
                  {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}
                  {successMsg && <p style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: '8px' }}>{successMsg}</p>}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="action-btn" disabled={isLoading}>
                    {isLoading ? <div className="btn-spinner"></div> : <>{t(content.btn_signin)} <ArrowRight size={18} /></>}
                  </motion.button>
                </form>
                <div className="auth-footer">
                  {t(content.new_platform)} <span className="text-link" onClick={() => { setError(null); setSuccessMsg(''); setView('signup'); }}>{t(content.act_account)}</span>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: SIGN UP */}
            {view === 'signup' && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <button onClick={() => setView('login')} className="back-nav"><ChevronLeft size={16} /> {t(content.back_login)}</button>
                <div className="header-section">
                  <div className="logo-mark"><UserPlus size={28} /></div>
                  <h1 className="page-title">{t(content.act_account)}</h1>
                  <p className="page-subtitle">{t(content.join_the)} <strong>{currentTheme.label}</strong></p>
                </div>
                <form onSubmit={handleRegister}>
                  <div className="input-group" style={{ marginBottom: '16px' }}>
                    <div className="input-box">
                      <input type="text" name="name" className="ed-input" placeholder={t(content.ph_name)} value={form.name} onChange={handleChange} required />
                      <User size={18} className="input-icon" />
                    </div>
                  </div>
                  {/* 🔹 Parent Phone – visible for all roles, required only for students */}
                  
                  <div className="input-group" style={{ marginBottom: '16px' }}>
                    <div className="input-box">
                      <input
                        type="tel"
                        name="parentPhone"
                        className="ed-input"
                        placeholder={t(content.ph_parent_phone)}
                        value={form.parentPhone}
                        onChange={handleChange}
                        required={portalRole === 'student'}   // mandatory for students only
                      />
                      {/* use the imported Phone icon */}
                      <Phone size={18} className="input-icon" />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      {t(content.msg_parent_phone)}
                    </p>
                  </div>

                  <div className="input-group" style={{ marginBottom: '16px' }}>
                    <div className="input-box">
                      <input type="email" name="email" className="ed-input" placeholder={t(content.ph_school_email)} value={form.email} onChange={handleChange} required />
                      <Mail size={18} className="input-icon" />
                    </div>
                  </div>
                  <div className="input-group" style={{ marginBottom: '16px' }}>
                    <div className="input-box">
                      <input type={showSignupPass ? "text" : "password"} name="password" className="ed-input" placeholder={t(content.ph_create_pass)} value={form.password} onChange={handleChange} required />
                      <Lock size={18} className="input-icon" />
                      <button type="button" className="password-toggle" onClick={() => setShowSignupPass(!showSignupPass)}>{showSignupPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                  </div>
                  <div className="input-group" style={{ marginBottom: '16px' }}>
                    <div className="input-box">
                      <input type={showConfirmPass ? "text" : "password"} name="confirmPassword" className="ed-input" placeholder={t(content.ph_confirm_pass)} value={form.confirmPassword} onChange={handleChange} required />
                      <KeyRound size={18} className="input-icon" />
                      <button type="button" className="password-toggle" onClick={() => setShowConfirmPass(!showConfirmPass)}>{showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                  </div>
                  {portalRole === 'student' && (
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <div className="input-box">
                        <input type="text" name="referralCode" className="ed-input" placeholder={t(content.ph_ref_code)} value={form.referralCode} onChange={handleChange} required />
                        <KeyRound size={18} className="input-icon" />
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{t(content.msg_ref_code)}</p>
                    </div>
                  )}
                  {portalRole === 'parent' && (
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <div className="input-box">
                        <input type="text" name="studentCode" className="ed-input" placeholder={t(content.ph_parent_code)} value={form.studentCode} onChange={handleChange} required />
                        <KeyRound size={18} className="input-icon" />
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{t(content.msg_parent_code)}</p>
                    </div>
                  )}
                  {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="action-btn" disabled={isLoading}>
                    {isLoading ? <div className="btn-spinner"></div> : <>{t(content.btn_send_otp)} <ArrowRight size={18} /></>}
                  </motion.button>
                </form>
                <div className="auth-footer">
                  {t(content.already_account)} <span className="text-link" onClick={() => setView('login')}>{t(content.sign_in)}</span>
                </div>
              </motion.div>
            )}

            {/* VIEW 2b: SIGN UP OTP */}
            {view === 'signup-otp' && (
              <motion.div key="signup-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <button onClick={() => setView('signup')} className="back-nav"><ChevronLeft size={16} /> {t(content.back_details)}</button>
                <div className="header-section">
                  <div className="logo-mark"><ShieldCheck size={28} /></div>
                  <h2 className="page-title">{t(content.verify_email)}</h2>
                  <p className="page-subtitle">{t(content.enter_code_msg)} <strong>{pendingSignupData?.email || form.email}</strong></p>
                </div>
                <form onSubmit={handleVerifySignupOtp}>
                  <div className="input-group">
                    <div className="input-box">
                      <input type="text" className="ed-input" placeholder="000 000" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} style={{ letterSpacing: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.4rem' }} required />
                      <Lock size={18} className="input-icon" />
                    </div>
                  </div>
                  {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}
                  {successMsg && <p style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: '8px' }}>{successMsg}</p>}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="action-btn" disabled={isLoading}>
                    {isLoading ? <div className="btn-spinner"></div> : <>{t(content.btn_verify_create)} <CheckCircle2 size={18} /></>}
                  </motion.button>
                  <div className="auth-footer" style={{ border: 'none', paddingTop: '10px' }}>
                    {t(content.didnt_receive)} <span className="text-link" onClick={handleResendSignupOtp}> {t(content.resend_code)}</span>
                  </div>
                </form>
              </motion.div>
            )}

            {/* VIEW 3: FORGOT PASSWORD */}
            {view === 'forgot-password' && (
              <motion.div key="forgot-password" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.3 }}>
                <button onClick={() => setView('login')} className="back-nav"><ChevronLeft size={16} /> {t(content.back_login)}</button>
                <div className="header-section">
                  <div className="logo-mark"><KeyRound size={28} /></div>
                  <h2 className="page-title">{t(content.acc_recovery)}</h2>
                  <p className="page-subtitle">{t(content.recovery_msg)}</p>
                </div>
                <form onSubmit={handleSendOtp}>
                  <div className="input-group">
                    <div className="input-box">
                      <input type="email" className="ed-input" placeholder="name@school.edu" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                      <Mail size={18} className="input-icon" />
                    </div>
                  </div>
                  {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}
                  {successMsg && <p style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: '8px' }}>{successMsg}</p>}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="action-btn" disabled={isLoading}>{isLoading ? <div className="btn-spinner"></div> : <>{t(content.btn_send_verif)} <Send size={18} /></>}</motion.button>
                </form>
              </motion.div>
            )}

            {/* VIEW 4: OTP VERIFY (FORGOT PASS) */}
            {view === 'otp-verify' && (
              <motion.div key="otp-verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <button onClick={() => setView('forgot-password')} className="back-nav"><ChevronLeft size={16} /> {t(content.back_details)}</button>
                <div className="header-section">
                  <div className="logo-mark"><ShieldCheck size={28} /></div>
                  <h2 className="page-title">{t(content.security_check)}</h2>
                  <p className="page-subtitle">{t(content.enter_code_msg)} <strong>{resetEmail}</strong></p>
                </div>
                <form onSubmit={handleVerifyOtp}>
                  <div className="input-group"><div className="input-box"><input type="text" className="ed-input" placeholder="000 000" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} style={{ letterSpacing: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.4rem' }} required /><Lock size={18} className="input-icon" /></div></div>
                  {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="action-btn" disabled={isLoading}>{isLoading ? <div className="btn-spinner"></div> : <>{t(content.btn_verify_access)} <CheckCircle2 size={18} /></>}</motion.button>
                  <div className="auth-footer" style={{ border: 'none', paddingTop: '10px' }}>{t(content.didnt_receive)} <span className="text-link" onClick={handleSendOtp}> {t(content.resend_code)}</span></div>
                </form>
              </motion.div>
            )}

            {/* VIEW 5: RESET PASSWORD */}
            {view === 'reset-password' && (
              <motion.div key="reset-password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="header-section">
                  <div className="logo-mark"><RefreshCw size={28} /></div>
                  <h2 className="page-title">{t(content.set_new_pass)}</h2>
                  <p className="page-subtitle">{t(content.create_secure_pass)}</p>
                </div>
                <form onSubmit={handleResetPassword}>
                  <div className="input-group"><div className="input-box"><input type={showNewPass ? "text" : "password"} className="ed-input" placeholder={t(content.ph_new_pass)} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /><Lock size={18} className="input-icon" /><button type="button" className="password-toggle" onClick={() => setShowNewPass(!showNewPass)}>{showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                  <div className="input-group"><div className="input-box"><input type={showConfirmNewPass ? "text" : "password"} className="ed-input" placeholder={t(content.ph_conf_new_pass)} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required /><KeyRound size={18} className="input-icon" /><button type="button" className="password-toggle" onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}>{showConfirmNewPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                  {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}
                  {successMsg && <p style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: '8px' }}>{successMsg}</p>}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="action-btn" disabled={isLoading}>{isLoading ? <div className="btn-spinner"></div> : <>{t(content.btn_update_pass)} <CheckCircle2 size={18} /></>}</motion.button>
                </form>
              </motion.div>
            )}

            {/* VIEW 6: CLASS SELECT */}
            {view === 'class-select' && (
              <motion.div key="class-select" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.3 }}>
                <button onClick={() => setView('login')} className="back-nav"><ChevronLeft size={16} /> {t(content.change_user)}</button>
                <div className="header-section">
                  <div className="logo-mark" style={{ borderRadius: '50%' }}><BookOpen size={28} /></div>
                  <h2 className="page-title">{t(content.select_curr)}</h2>
                  <p className="page-subtitle">{t(content.choose_env)}</p>
                </div>
                <div className="class-grid">
                  {classes.map((cls) => (
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} key={cls} className="class-btn" onClick={() => handleClassSelect(cls)}>
                      <div className="class-number">{cls}</div>
                      <div className="class-label">{t(content.standard)}</div>
                      <div style={{ position: 'absolute', top: 10, right: 10 }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cls >= 9 ? 'var(--theme-color)' : 'rgba(255,255,255,0.1)' }}></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}