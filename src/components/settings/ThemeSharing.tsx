
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGameContext } from "@/contexts/GameContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { encodeEmojiSet, decodeEmojiSet } from "@/lib/theme-utils";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

export function ThemeSharing() {
  const { emojiSet, setEmojiSet } = useGameContext();
  const { t } = useLocalization();
  const [shareString, setShareString] = useState("");
  const [inputString, setInputString] = useState("");
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleGenerateString = () => {
    const encoded = encodeEmojiSet(emojiSet);
    setShareString(encoded);
  };

  const handleApplyTheme = () => {
    const decoded = decodeEmojiSet(inputString);
    if (decoded) {
      setEmojiSet(decoded);
      toast({
        title: t("applyTheme"),
        description: "New emoji theme applied successfully!",
      });
      setInputString(""); // Clear input after applying
    } else {
      toast({
        title: "Error",
        description: t("invalidThemeString"),
        variant: "destructive",
      });
    }
  };
  
  const handleCopy = () => {
    if (!shareString) return;
    navigator.clipboard.writeText(shareString).then(() => {
      setCopied(true);
      toast({ title: t("themeCopied") });
      setTimeout(() => setCopied(false), 2000);
    });
  };


  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">{t("themeSharing")}</h3>
      
      <div className="space-y-2">
        <Button onClick={handleGenerateString} className="bg-accent hover:bg-accent/90">{t("generateShareString")}</Button>
        {shareString && (
          <div className="relative">
            <Textarea
              readOnly
              value={shareString}
              className="min-h-[80px] pr-12"
              aria-label="Shareable theme string"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              aria-label="Copy theme string"
            >
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="theme-input" className="text-muted-foreground">{t("pasteShareString")}</Label>
        <Textarea
          id="theme-input"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          placeholder="ey..."
          className="min-h-[80px]"
        />
        <Button onClick={handleApplyTheme} disabled={!inputString} className="bg-primary hover:bg-primary/90">{t("applyTheme")}</Button>
      </div>
    </div>
  );
}
