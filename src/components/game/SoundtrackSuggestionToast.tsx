
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGameContext } from "@/contexts/GameContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { suggestSoundtrack, type SuggestSoundtrackInput, type SuggestSoundtrackOutput } from "@/ai/flows/suggest-soundtrack";
import { Music2, Loader2 } from "lucide-react";

export function SoundtrackSuggestionButton() {
  const { getCurrentGameStateForAI } = useGameContext();
  const { t } = useLocalization();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuggestSoundtrack = async () => {
    setIsLoading(true);
    const gameState = getCurrentGameStateForAI();
    
    // Ensure gameState is one of the enum values
    const aiGameState = gameState.gameState === "playing" || gameState.gameState === "paused" || gameState.gameState === "gameOver"
      ? gameState.gameState
      : "playing"; // Default to playing if somehow invalid

    const input: SuggestSoundtrackInput = {
      score: gameState.score,
      level: gameState.level,
      linesCleared: gameState.linesCleared,
      gameState: aiGameState,
    };

    try {
      const { toastId } = toast({
        title: t("soundtrackSuggestion"),
        description: t("suggestionLoading"),
      });
      
      const result: SuggestSoundtrackOutput = await suggestSoundtrack(input);
      
      toast({
        id: toastId, // Update existing toast
        title: t("soundtrackSuggestion"),
        description: (
          <div>
            <p className="font-semibold">{result.suggestedSoundtrack}</p>
            <p className="text-sm mt-1">{result.reason}</p>
          </div>
        ),
        duration: 10000, // Keep suggestion longer
      });
    } catch (error) {
      console.error("Error suggesting soundtrack:", error);
      toast({
        title: "Error",
        description: t("suggestionError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSuggestSoundtrack} 
      disabled={isLoading}
      variant="outline"
      className="w-full mt-2"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Music2 className="mr-2 h-4 w-4" />
      )}
      {t("getSoundtrackSuggestion")}
    </Button>
  );
}
