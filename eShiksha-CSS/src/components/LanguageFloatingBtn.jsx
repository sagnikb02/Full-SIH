import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react'; // Ensure lucide-react is installed

export default function LanguageFloatingBtn() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 9999, // Ensures it floats above everything
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        borderRadius: '50px',
        background: 'rgba(15, 23, 42, 0.85)', // Dark translucent background
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        color: '#fff',
        fontWeight: '600',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)'; // Purple glow
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      <Languages size={20} color="#8b5cf6" />
      <span>{language === 'en' ? 'ਪੰਜਾਬੀ' : 'English'}</span>
    </button>
  );
}