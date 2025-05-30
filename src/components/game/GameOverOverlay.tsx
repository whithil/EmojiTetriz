
"use client";

import { Button } from "@/components/ui/button";
import { useGameContext } from "@/contexts/GameContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { RefreshCw } from "lucide-react";

export function GameOverOverlay() {
  const { gameState, score, startGame } = useGameContext();
  const { t } = useLocalization();

  if (gameState !== "gameOver") {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg">
      <div className="flex flex-col items-center justify-center h-full w-full">
        <h2 className="text-5xl font-bold text-primary mb-4 animate-bounce">{t("gameOver")}</h2>
        <p className="text-2xl text-foreground mb-2">
          {t("score")}: <span className="font-bold text-accent">{score}</span>
        </p>
        <Button onClick={startGame} size="lg" className="text-lg py-3 px-6 mt-4">
          <RefreshCw className="mr-2 h-5 w-5" />
          {t("restart")}
        </Button>
      </div>
    </div>
  );
}
