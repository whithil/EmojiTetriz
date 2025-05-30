
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
import { Copy, Check, Link2 } from "lucide-react"; // Added Link2 for generating link

export function ThemeSharing() {
  const { emojiSet, setEmojiSet } = useGameContext();
  const { t } = useLocalization();
  const [shareableLink, setShareableLink] = useState("");
  const [inputString, setInputString] = useState("");
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = () => {
    const encoded = encodeEmojiSet(emojiSet);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('theme', encoded);
      setShareableLink(url.toString());
    } else {
      // Fallback for environments where window is not available (e.g. SSR, though this component is client-side)
      setShareableLink(`Theme data: ${encoded} (Full link generation requires browser environment)`);
    }
  };

  const handleApplyTheme = () => {
    let themeToApply = inputString;
    // Check if the input string is a URL and try to extract the theme parameter
    try {
      const url = new URL(inputString);
      const themeFromPastedUrl = url.searchParams.get('theme');
      if (themeFromPastedUrl) {
        themeToApply = themeFromPastedUrl;
      }
    } catch (e) {
      // Not a valid URL, assume it's a direct theme string
    }

    const decoded = decodeEmojiSet(themeToApply);
    if (decoded) {
      setEmojiSet(decoded);
      toast({
        title: t("applyTheme"),
        description: "New emoji theme applied successfully!",
      });
      setInputString(""); // Clear input after applying
      setShareableLink(""); // Clear generated link as well
    } else {
      toast({
        title: "Error",
        description: t("invalidThemeString"),
        variant: "destructive",
      });
    }
  };
  
  const handleCopy = () => {
    if (!shareableLink) return;
    navigator.clipboard.writeText(shareableLink).then(() => {
      setCopied(true);
      toast({ title: t("themeCopied") });
      setTimeout(() => setCopied(false), 2000);
    });
  };


  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">{t("themeSharing")}</h3>
      <p className="text-sm text-muted-foreground">{t("themeSharingDescription")}</p>
      
      <div className="space-y-2">
        <Button onClick={handleGenerateLink} className="bg-accent hover:bg-accent/90">
          <Link2 className="mr-2" /> {t("generateShareLink")}
        </Button>
        {shareableLink && (
          <div className="relative">
            <Textarea
              readOnly
              value={shareableLink}
              className="min-h-[80px] pr-12"
              aria-label="Shareable theme link"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              aria-label="Copy theme link"
            >
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="theme-input" className="text-muted-foreground">{t("pasteShareStringOrLink")}</Label>
        <Textarea
          id="theme-input"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          placeholder={t("pasteThemePlaceholder")}
          className="min-h-[80px]"
        />
        <Button onClick={handleApplyTheme} disabled={!inputString} className="bg-primary hover:bg-primary/90">{t("applyTheme")}</Button>
      </div>
    </div>
  );
}
