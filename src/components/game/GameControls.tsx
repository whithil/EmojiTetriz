
"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Zap, Play, PauseIcon } from "lucide-react";
import { useGameContext } from "@/contexts/GameContext";
import { useLocalization } from "@/contexts/LocalizationContext";

export function GameControls() {
  const { 
    gameState, startGame, pauseGame, resumeGame, 
    moveLeft, moveRight, rotatePiece, softDrop, hardDrop 
  } = useGameContext();
  const { t } = useLocalization();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState === "gameOver") return;

      switch (event.key) {
        case "ArrowLeft":
          moveLeft();
          break;
        case "ArrowRight":
          moveRight();
          break;
        case "ArrowDown":
          softDrop();
          break;
        case "ArrowUp":
          rotatePiece();
          break;
        case " ": // Space bar
          event.preventDefault(); // Prevent page scroll
          hardDrop();
          break;
        case "p":
        case "P":
          if (gameState === "playing") pauseGame();
          else if (gameState === "paused") resumeGame();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState, moveLeft, moveRight, rotatePiece, softDrop, hardDrop, pauseGame, resumeGame]);

  const mainAction = () => {
    if (gameState === "gameOver") startGame();
    else if (gameState === "playing") pauseGame();
    else if (gameState === "paused") resumeGame();
  };

  const getMainActionIcon = () => {
    if (gameState === "gameOver") return <Play className="mr-2 h-5 w-5" />;
    if (gameState === "playing") return <PauseIcon className="mr-2 h-5 w-5" />;
    return <Play className="mr-2 h-5 w-5" />;
  };

  const getMainActionText = () => {
    if (gameState === "gameOver") return t("play");
    if (gameState === "playing") return t("pause");
    return t("resume");
  };

  return (
    <div className="space-y-3 mt-4">
      <Button onClick={mainAction} className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
        {getMainActionIcon()}
        {getMainActionText()}
      </Button>
      {gameState !== "gameOver" && (
         <div className="grid grid-cols-3 gap-2">
         <Button variant="outline" onClick={moveLeft} aria-label="Move Left" className="py-4"><ArrowLeft /></Button>
         <Button variant="outline" onClick={softDrop} aria-label="Move Down" className="py-4"><ArrowDown /></Button>
         <Button variant="outline" onClick={moveRight} aria-label="Move Right" className="py-4"><ArrowRight /></Button>
         <Button variant="outline" onClick={rotatePiece} aria-label="Rotate" className="py-4 col-span-1"><RotateCcw /></Button>
         <Button variant="outline" onClick={hardDrop} aria-label="Hard Drop" className="py-4 col-span-2"><Zap className="mr-2"/> Drop</Button>
       </div>
      )}
    </div>
  );
}
