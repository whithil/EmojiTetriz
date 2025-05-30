
"use client";
import type { ChangeEvent } from "react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGameContext } from "@/contexts/GameContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import type { EmojiSet, TetrominoType, LocalizationContextType as AugmentedLocalizationContextType } from "@/lib/tetris-constants"; // LocalizationContextType might conflict if not aliased or used carefully
import { TETROMINO_TYPES, DEFAULT_EMOJI_SET } from "@/lib/tetris-constants";
import { useToast } from "@/hooks/use-toast";

export function EmojiSettingsPanel() {
  const { emojiSet: currentGlobalEmojiSet, setEmojiSet: setGlobalEmojiSet } = useGameContext();
  const { t } = useLocalization();
  const [localEmojiSet, setLocalEmojiSet] = useState<EmojiSet>(currentGlobalEmojiSet);
  const { toast } = useToast();

  useEffect(() => {
    setLocalEmojiSet(currentGlobalEmojiSet);
  }, [currentGlobalEmojiSet]);

  const handleEmojiChange = (piece: TetrominoType, event: ChangeEvent<HTMLInputElement>) => {
    // Allow one or two characters for emojis (e.g., single emoji or flag)
    const newValue = event.target.value.slice(0, 2);
    setLocalEmojiSet(prev => ({ ...prev, [piece]: newValue }));
  };

  const handleSave = () => {
    setGlobalEmojiSet(localEmojiSet);
    toast({
      title: t("emojisSaved"),
      description: "Your new emoji theme is active.",
    });
  };
  
  const handleResetToDefault = () => {
    setLocalEmojiSet(DEFAULT_EMOJI_SET);
    setGlobalEmojiSet(DEFAULT_EMOJI_SET);
     toast({
      title: "Emojis Reset",
      description: "Emojis have been reset to default.",
    });
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">{t("emojiSettings")}</h3>
      <div className="grid grid-cols-2 gap-4"> {/* Changed from grid-cols-1 sm:grid-cols-2 */}
        {TETROMINO_TYPES.map(piece => (
          <div key={piece} className="space-y-1">
            <Label htmlFor={`emoji-${piece}`} className="text-muted-foreground">
              {t("selectEmojiForPiece", { pieceName: t(`piece${piece}` as keyof ReturnType<typeof useLocalization>['t_type']) || piece })}
            </Label>
            <Input
              id={`emoji-${piece}`}
              type="text"
              value={localEmojiSet[piece] || ""}
              onChange={(e) => handleEmojiChange(piece, e)}
              maxLength={2}
              className="text-2xl p-2 h-12 w-20 text-center"
            />
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">{t("saveEmojis")}</Button>
        <Button variant="outline" onClick={handleResetToDefault}>Reset to Default</Button>
      </div>
    </div>
  );
}

// Helper type for t function keys to avoid `any`
declare module "@/contexts/LocalizationContext" {
  // Augment the actual interface used by the context and hook
  interface LocalizationContextType { 
    t_type: typeof import("@/locales/en-US.json");
  }
}
