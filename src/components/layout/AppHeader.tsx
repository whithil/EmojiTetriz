
"use client";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useGameContext } from "@/contexts/GameContext";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  onSettingsClick: () => void;
}

export function AppHeader({ onSettingsClick }: AppHeaderProps) {
  const { t } = useLocalization();
  const { score, level, linesCleared, gameState } = useGameContext();
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-2 sm:px-4">
        <Link href="/" className="text-2xl font-bold text-primary ml-2 sm:ml-4 shrink-0">
          {t("appName")}
        </Link>

        {isMobile && gameState !== 'gameOver' && (
          <div className="flex-1 flex justify-center items-center space-x-1.5 text-xs px-1 overflow-hidden mx-1">
            <span className="truncate text-foreground/80">{t("scoreAbbr")}: <span className="font-semibold text-primary">{score}</span></span>
            <span className="truncate text-foreground/80">{t("levelAbbr")}: <span className="font-semibold text-accent">{level}</span></span>
            <span className="truncate text-foreground/80">{t("linesAbbr")}: <span className="font-semibold text-accent">{linesCleared}</span></span>
          </div>
        )}
        
        {!isMobile && <div className="flex-grow"></div> /* Spacer for desktop */}

        <div className={cn("flex items-center shrink-0", isMobile ? "space-x-1" : "space-x-2")}>
          <ThemeSwitcher />
          <LanguageSwitcher />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onSettingsClick} 
            aria-label={t('settings')}
            className={cn(isMobile ? "w-9 h-9" : "")}
          >
            <Settings className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </div>
      </div>
    </header>
  );
}
