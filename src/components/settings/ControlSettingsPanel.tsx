
"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameContext } from "@/contexts/GameContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import type { GameAction } from "@/lib/tetris-constants";
import { GAME_ACTIONS, getKeyDisplayName, getGamepadButtonDisplayName } from "@/lib/tetris-constants";
import { useToast } from "@/hooks/use-toast";

export function ControlSettingsPanel() {
  const { 
    keyboardMappings, 
    gamepadMappings, 
    updateKeyboardMapping, 
    updateGamepadMapping, 
    resetControlMappings 
  } = useGameContext();
  const { t } = useLocalization();
  const { toast } = useToast();
  const [listeningFor, setListeningFor] = useState<{ type: "keyboard" | "gamepad"; action: GameAction } | null>(null);

  const handleResetControls = () => {
    resetControlMappings();
    toast({
      title: t("controlsResetTitle"),
      description: t("controlsResetDescription"),
    });
  };
  
  // Placeholder for actual key/button listening logic, which is more complex
  const handleChangeMapping = (type: "keyboard" | "gamepad", action: GameAction) => {
    setListeningFor({ type, action });
    // In a full implementation, you'd add event listeners here for keydown or gamepad input
    // For now, we'll just simulate it or leave it for a follow-up
    toast({
      title: t("listeningForInputTitle"),
      description: t("listeningForInputDescription", { action: t(`action${action.charAt(0).toUpperCase() + action.slice(1)}` as keyof ReturnType<typeof useLocalization>['t_type']) || action }),
    });
    // For demonstration, we can auto-clear listening state
    // setTimeout(() => setListeningFor(null), 3000);
  };

  // This effect would handle the actual input listening
  useEffect(() => {
    if (!listeningFor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (listeningFor.type === "keyboard") {
        event.preventDefault();
        event.stopPropagation();
        updateKeyboardMapping(listeningFor.action, event.key);
        toast({ title: t("mappingUpdatedTitle"), description: `${t(`action${listeningFor.action.charAt(0).toUpperCase() + listeningFor.action.slice(1)}` as keyof ReturnType<typeof useLocalization>['t_type'])} ${t("mappedTo")} ${getKeyDisplayName(event.key)}` });
        setListeningFor(null);
      }
    };

    const handleGamepadInput = () => {
        // This requires a more complex setup to monitor gamepad buttons globally
        // For now, this part is conceptual for button press detection.
        if (listeningFor.type === 'gamepad') {
            const gamepads = navigator.getGamepads();
            for (const gamepad of gamepads) {
                if (gamepad) {
                    for (let i = 0; i < gamepad.buttons.length; i++) {
                        if (gamepad.buttons[i].pressed) {
                            updateGamepadMapping(listeningFor.action, i);
                            toast({ title: t("mappingUpdatedTitle"), description: `${t(`action${listeningFor.action.charAt(0).toUpperCase() + listeningFor.action.slice(1)}` as keyof ReturnType<typeof useLocalization>['t_type'])} ${t("mappedTo")} ${getGamepadButtonDisplayName(i)}` });
                            setListeningFor(null);
                            return; // Stop listening once a button is pressed
                        }
                    }
                }
            }
        }
    };
    
    let intervalId: NodeJS.Timeout | null = null;

    if (listeningFor.type === "keyboard") {
      document.addEventListener("keydown", handleKeyDown, { capture: true });
    } else if (listeningFor.type === "gamepad") {
      // Poll for gamepad input - this is a simplified approach
      intervalId = setInterval(handleGamepadInput, 100);
    }

    return () => {
      if (listeningFor.type === "keyboard") {
        document.removeEventListener("keydown", handleKeyDown, { capture: true });
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [listeningFor, updateKeyboardMapping, updateGamepadMapping, toast, t]);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-foreground">{t("controlSettings")}</h3>
        <Button variant="outline" onClick={handleResetControls}>
          {t("resetToDefault")}
        </Button>
      </div>

      {GAME_ACTIONS.map(action => (
        <Card key={action} className="overflow-hidden">
          <CardHeader className="bg-muted/50 p-4">
            <CardTitle className="text-lg">
              {t(`action${action.charAt(0).toUpperCase() + action.slice(1)}` as keyof ReturnType<typeof useLocalization>['t_type']) || action}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={`kb-${action}`} className="text-muted-foreground">{t("keyboard")}</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-28 text-right pr-2 border-r">
                  {keyboardMappings[action] ? getKeyDisplayName(keyboardMappings[action]!) : t("unassigned")}
                </span>
                <Button
                  id={`kb-${action}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeMapping("keyboard", action)}
                  disabled={listeningFor?.action === action && listeningFor?.type === "keyboard"}
                >
                  {listeningFor?.action === action && listeningFor?.type === "keyboard" ? t("listening") : t("change")}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor={`gp-${action}`} className="text-muted-foreground">{t("gamepad")}</Label>
               <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-28 text-right pr-2 border-r">
                  {gamepadMappings[action] !== undefined ? getGamepadButtonDisplayName(gamepadMappings[action]!) : t("unassigned")}
                </span>
                <Button
                  id={`gp-${action}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeMapping("gamepad", action)}
                  disabled={listeningFor?.action === action && listeningFor?.type === "gamepad"}
                >
                  {listeningFor?.action === action && listeningFor?.type === "gamepad" ? t("listening") : t("change")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {listeningFor && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setListeningFor(null)}>
            <Card className="p-6">
                <CardTitle>{t("pressKeyOrButtonTitle")}</CardTitle>
                <p className="text-muted-foreground mt-2">
                    {listeningFor.type === "keyboard" ? t("pressKeyPrompt") : t("pressButtonPrompt")} 
                    {t(`action${listeningFor.action.charAt(0).toUpperCase() + listeningFor.action.slice(1)}` as keyof ReturnType<typeof useLocalization>['t_type'])}.
                </p>
                <Button variant="ghost" className="mt-4" onClick={() => setListeningFor(null)}>{t("cancel")}</Button>
            </Card>
        </div>
      )}
    </div>
  );
}

// Augment LocalizationContextType for t_type to work with action keys
declare module "@/contexts/LocalizationContext" {
  interface LocalizationContextType { 
    t_type: typeof import("@/locales/en-US.json");
  }
}
