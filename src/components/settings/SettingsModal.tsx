
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmojiSettingsPanel } from "./EmojiSettingsPanel";
import { ControlSettingsPanel } from "./ControlSettingsPanel"; // Import new panel
import { ThemeSharing } from "./ThemeSharing";
import { useLocalization } from "@/contexts/LocalizationContext";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useLocalization();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t("settings")}</DialogTitle>
          <DialogDescription>
            {t("appName")} - {t("settingsDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 py-4">
          <Tabs defaultValue="emoji-settings" className="w-full">
            <TabsList className="grid w-full grid-cols-3"> {/* Adjusted for 3 tabs */}
              <TabsTrigger value="emoji-settings">{t("emojiSettings")}</TabsTrigger>
              <TabsTrigger value="control-settings">{t("controlSettings")}</TabsTrigger> {/* New tab */}
              <TabsTrigger value="theme-sharing">{t("themeSharing")}</TabsTrigger>
            </TabsList>
            <TabsContent value="emoji-settings" className="mt-4">
              <EmojiSettingsPanel />
            </TabsContent>
            <TabsContent value="control-settings" className="mt-4"> {/* New tab content */}
              <ControlSettingsPanel />
            </TabsContent>
            <TabsContent value="theme-sharing" className="mt-4">
              <ThemeSharing />
            </TabsContent>
          </Tabs>
        </div>
         <DialogClose asChild>
          <Button type="button" variant="outline" className="mt-4 self-end">
            {t("close")}
          </Button>
        </DialogClose>
        <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            aria-label={t("closeSettings")}
          >
            <X className="h-4 w-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
