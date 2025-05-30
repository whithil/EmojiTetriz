
"use client";

import React, { useState, useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { GameBoard } from "@/components/game/GameBoard";
import { PiecePreview } from "@/components/game/PiecePreview";
import { HeldPiecePreview } from "@/components/game/HeldPiecePreview";
import { GameInfoPanel } from "@/components/game/GameInfoPanel";
import { GameControls } from "@/components/game/GameControls";
import { MobileGameControls } from "@/components/game/MobileGameControls";
import { GameOverOverlay } from "@/components/game/GameOverOverlay";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { Confetti } from "@/components/game/Confetti";
import { useGameContext } from "@/contexts/GameContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";


export default function HomePage() {
  const {
    board, currentPiece, nextPiece, ghostPiece, heldPiece, canHold,
    score, level, linesCleared, gameState, startGame, pauseGame, resumeGame,
    holdPiece: triggerHoldPiece,
    showLineClearConfetti,
    showLevelUpConfetti,
    animatingRows
  } = useGameContext();
  const { t } = useLocalization();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSettingsModalOpen) {
        setIsSettingsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsModalOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader onSettingsClick={() => setIsSettingsModalOpen(true)} />
      <main className="flex-grow container mx-auto px-2 py-4 md:py-8">
        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start", isMobile ? "flex flex-col" : "")}>
          {/* Desktop: Left Panel */}
          {!isMobile && (
            <div className="md:col-span-1 space-y-4 order-2 md:order-1">
              <HeldPiecePreview
                piece={heldPiece}
                title={t("holdPieceTitle")}
                onHoldActionTrigger={triggerHoldPiece}
                isMobile={isMobile}
                canHold={canHold}
                gameState={gameState}
              />
              <PiecePreview piece={nextPiece} title={t("nextPiece")} />
              <GameInfoPanel score={score} level={level} linesCleared={linesCleared} />
              <GameControls />
            </div>
          )}

          {/* Game Board Area - full width on mobile */}
          <div className={cn("relative order-1 md:order-2", isMobile ? "w-full" : "md:col-span-2")}>
            <GameBoard board={board} currentPiece={currentPiece} ghostPiece={ghostPiece} animatingRows={animatingRows} />
            
            {gameState === "gameOver" && !currentPiece && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <h1 className="text-4xl font-bold text-primary mb-6">{t("appName")}</h1>
                  <Button onClick={startGame} size="lg" className="text-xl py-8 px-10 animate-pulse">
                    <Play className="mr-2 h-6 w-6" /> {t("play")}
                  </Button>
                </div>
              </div>
            )}

            {gameState === "gameOver" && currentPiece && <GameOverOverlay />}

            {gameState === "paused" && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg flex flex-col items-center justify-center">
                 <div className="flex flex-col items-center justify-center h-full w-full">
                  <h2 className="text-5xl font-bold text-primary mb-4">{t("pauseStateTitle")}</h2>
                  <Button onClick={resumeGame} size="lg" className="text-xl py-8 px-10">
                    <Play className="mr-2 h-6 w-6" /> {t("resume")}
                  </Button>
                </div>
              </div>
            )}

            {showLevelUpConfetti && <Confetti key="levelup-confetti" animationType="levelUp" />}
            {showLineClearConfetti && <Confetti key="lineclear-confetti" animationType="lineClear" />}
            
            {isMobile && gameState === 'playing' && <MobileGameControls />}
          </div>

          {/* Mobile: Info panels stacked below board (GameInfoPanel removed) */}
          {isMobile && (
            <div className="mt-4 space-y-3 order-2 w-full">
              <div className="grid grid-cols-2 gap-3">
                <HeldPiecePreview
                  piece={heldPiece}
                  title={t("holdPieceTitle")}
                  onHoldActionTrigger={triggerHoldPiece}
                  isMobile={isMobile}
                  canHold={canHold}
                  gameState={gameState}
                />
                <PiecePreview piece={nextPiece} title={t("nextPiece")} />
              </div>
              {/* GameInfoPanel is intentionally removed here for mobile as info is in header */}
            </div>
          )}
        </div>
      </main>
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
       <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        EmojiTetriz - Built with Next.js and Firebase Studio.
      </footer>
    </div>
  );
}
