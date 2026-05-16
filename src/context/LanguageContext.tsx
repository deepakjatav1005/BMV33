import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

const LanguageContext = createContext({
  language: 'English',
  setLanguage: (lang: string) => {},
  t: (key: string) => key
});

export const useTranslation = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('app_language') || 'English');

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = (key: string) => {
    // Basic translation logic or just return key if not found
    return key;
  };

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
