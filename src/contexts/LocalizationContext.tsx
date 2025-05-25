
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import enUS from "@/locales/en-US.json";
import ptBR from "@/locales/pt-BR.json";

type Locale = "en-US" | "pt-BR";
type Translations = typeof enUS; // Assuming en-US has all keys

interface LocalizationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
}

const translations: Record<Locale, Translations> = {
  "en-US": enUS,
  "pt-BR": ptBR,
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>("en-US");

  useEffect(() => {
    const storedLocale = localStorage.getItem("locale") as Locale | null;
    if (storedLocale && translations[storedLocale]) {
      setLocaleState(storedLocale);
    } else {
      // Basic browser language detection
      const browserLang = navigator.language;
      if (browserLang.startsWith("pt")) {
        setLocaleState("pt-BR");
      } else {
        setLocaleState("en-US");
      }
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  }, []);

  const t = useCallback((key: keyof Translations, params?: Record<string, string | number>): string => {
    let translation = translations[locale][key] || translations["en-US"][key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    return translation;
  }, [locale]);

  return (
    <LocalizationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }
  return context;
};
