import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. Import Context and Floating Button
import { LanguageProvider } from './context/LanguageContext';
import LanguageFloatingBtn from './components/LanguageFloatingBtn';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ParentDashboard from './pages/parent/ParentDashboard';

export default function App() {
  return (
    // 2. Wrap the entire app in LanguageProvider
    <LanguageProvider>
      <BrowserRouter>
        
        {/* 3. This button sits on top of every page automatically */}
        <LanguageFloatingBtn />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Role-Based Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}