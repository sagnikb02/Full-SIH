import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // 1. Load from LocalStorage or default to English
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en';
  });

  // 2. Persist selection
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  // 3. Toggle Logic
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'pa' : 'en'));
  };

  // 4. Translation Helper
  const t = (contentObj) => {
    if (!contentObj) return "";
    return contentObj[language] || contentObj['en'] || "";
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);