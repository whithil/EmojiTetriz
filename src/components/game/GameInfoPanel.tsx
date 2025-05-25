
"use client";

import { useLocalization } from "@/contexts/LocalizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GameInfoPanelProps {
  score: number;
  level: number;
  linesCleared: number;
}

export function GameInfoPanel({ score, level, linesCleared }: GameInfoPanelProps) {
  const { t } = useLocalization();

  return (
    <Card className="shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("score")}</p>
          <p className="text-3xl font-bold text-primary">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("level")}</p>
          <p className="text-2xl font-semibold text-accent">{level}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("lines")}</p>
          <p className="text-2xl font-semibold text-accent">{linesCleared}</p>
        </div>
      </CardContent>
    </Card>
  );
}
