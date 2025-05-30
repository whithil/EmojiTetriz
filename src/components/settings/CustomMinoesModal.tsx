
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/contexts/LocalizationContext";

interface CustomMinoesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomMinoesModal({ isOpen, onClose }: CustomMinoesModalProps) {
  const { t } = useLocalization();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("manageCustomMinoesTitle")}</DialogTitle>
          <DialogDescription>
            {t("customMinoesModalDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-muted-foreground">
            {t("featureComingSoon")}
          </p>
          {/* 
            Future UI for drawing grid, emoji input, add/remove rows/columns, save, list of custom minoes.
          */}
        </div>
        <DialogClose asChild>
          <Button type="button" variant="outline" className="mt-4">
            {t("close")}
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

    