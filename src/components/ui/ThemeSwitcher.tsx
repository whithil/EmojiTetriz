
"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useLocalization } from "@/contexts/LocalizationContext";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useThemeContext();
  const { t } = useLocalization();

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label={theme === 'light' ? t('darkMode') : t('lightMode')}>
      {theme === 'light' ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}
