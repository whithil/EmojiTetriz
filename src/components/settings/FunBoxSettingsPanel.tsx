
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGameContext } from "@/contexts/GameContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { CustomMinoesModal } from "./CustomMinoesModal";

export function FunBoxSettingsPanel() {
  const { 
    confettiOnLineClearEnabled, setConfettiOnLineClearEnabled,
    confettiOnLevelUpEnabled, setConfettiOnLevelUpEnabled,
    customMinoesEnabled, setCustomMinoesEnabled 
  } = useGameContext();
  const { t } = useLocalization();
  const [isCustomMinoesModalOpen, setIsCustomMinoesModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">{t("funBoxSettings")}</h3>
      
      <div className="space-y-4">
        {/* Confetti on Line Clear Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <Label htmlFor="confetti-line-clear-toggle" className="text-base">
            {t("confettiOnLineClear")}
          </Label>
          <Switch
            id="confetti-line-clear-toggle"
            checked={confettiOnLineClearEnabled}
            onCheckedChange={setConfettiOnLineClearEnabled}
            aria-label={t("confettiOnLineClear")}
          />
        </div>

        {/* Confetti on Level Up Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <Label htmlFor="confetti-level-up-toggle" className="text-base">
            {t("confettiOnLevelUp")}
          </Label>
          <Switch
            id="confetti-level-up-toggle"
            checked={confettiOnLevelUpEnabled}
            onCheckedChange={setConfettiOnLevelUpEnabled}
            aria-label={t("confettiOnLevelUp")}
          />
        </div>

        {/* Draw Your Own Minoes Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <Label htmlFor="custom-minoes-toggle" className="text-base">
            {t("enableCustomMinoes")}
          </Label>
          <Switch
            id="custom-minoes-toggle"
            checked={customMinoesEnabled}
            onCheckedChange={setCustomMinoesEnabled}
            aria-label={t("enableCustomMinoes")}
          />
        </div>
        
        {/* Manage Custom Minoes Button (conditionally enabled) */}
        <Button 
          onClick={() => setIsCustomMinoesModalOpen(true)} 
          disabled={!customMinoesEnabled}
          variant="outline"
          className="w-full"
        >
          {t("manageCustomMinoes")}
        </Button>
      </div>

      <CustomMinoesModal 
        isOpen={isCustomMinoesModalOpen} 
        onClose={() => setIsCustomMinoesModalOpen(false)} 
      />
      <p className="text-sm text-muted-foreground">
        {t("funBoxDescription")}
      </p>
    </div>
  );
}
