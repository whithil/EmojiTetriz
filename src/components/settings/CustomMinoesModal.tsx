
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useGameContext } from "@/contexts/GameContext";
import type { CustomMinoData } from "@/lib/tetris-constants";
import { CUSTOM_MINO_GRID_SIZE } from "@/lib/tetris-constants";
import { cn } from "@/lib/utils";
import { Trash2, GripVertical } from "lucide-react"; // Assuming GripVertical for a potential drag handle later
import { useToast } from "@/hooks/use-toast";


interface CustomMinoesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialDrawingGrid = () => Array(CUSTOM_MINO_GRID_SIZE).fill(null).map(() => Array(CUSTOM_MINO_GRID_SIZE).fill(0));

export function CustomMinoesModal({ isOpen, onClose }: CustomMinoesModalProps) {
  const { t } = useLocalization();
  const { customMinoesData, addCustomMino, removeCustomMino } = useGameContext();
  const { toast } = useToast();

  const [newMinoName, setNewMinoName] = useState("");
  const [newMinoEmoji, setNewMinoEmoji] = useState("");
  const [drawingGrid, setDrawingGrid] = useState<number[][]>(initialDrawingGrid());

  const handleGridCellClick = (rowIndex: number, colIndex: number) => {
    setDrawingGrid(prevGrid =>
      prevGrid.map((row, rIdx) =>
        rIdx === rowIndex
          ? row.map((cell, cIdx) => (cIdx === colIndex ? (cell === 0 ? 1 : 0) : cell))
          : row
      )
    );
  };

  const handleSaveNewMino = () => {
    if (!newMinoName.trim()) {
      toast({ title: t("errorMinoNameRequired"), variant: "destructive"});
      return;
    }
    if (!newMinoEmoji.trim() || newMinoEmoji.length > 2) {
       toast({ title: t("errorMinoEmojiRequired"), variant: "destructive"});
      return;
    }
    const isShapeEmpty = drawingGrid.every(row => row.every(cell => cell === 0));
    if (isShapeEmpty) {
      toast({ title: t("errorMinoShapeRequired"), variant: "destructive"});
      return;
    }

    addCustomMino({
      name: newMinoName,
      emoji: newMinoEmoji,
      shape: drawingGrid,
    });
    setNewMinoName("");
    setNewMinoEmoji("");
    setDrawingGrid(initialDrawingGrid());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("manageCustomMinoesTitle")}</DialogTitle>
          <DialogDescription>
            {t("customMinoesModalDescription")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow pr-6">
          <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* Add New Mino Section */}
            <div className="space-y-4 p-4 border rounded-lg shadow">
              <h3 className="text-lg font-semibold">{t("addCustomMinoTitle")}</h3>
              <div>
                <Label htmlFor="mino-name">{t("minoNameLabel")}</Label>
                <Input
                  id="mino-name"
                  value={newMinoName}
                  onChange={(e) => setNewMinoName(e.target.value)}
                  placeholder={t("minoNamePlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="mino-emoji">{t("minoEmojiLabel")}</Label>
                <Input
                  id="mino-emoji"
                  value={newMinoEmoji}
                  onChange={(e) => setNewMinoEmoji(e.target.value.slice(0,2))} // Limit to 2 chars
                  placeholder={t("minoEmojiPlaceholder")}
                  maxLength={2}
                  className="w-20 text-center text-xl"
                />
              </div>
              <div>
                <Label>{t("minoShapeLabel")}</Label>
                <div
                  className="grid gap-0.5 mt-1 bg-muted p-1 rounded"
                  style={{ gridTemplateColumns: `repeat(${CUSTOM_MINO_GRID_SIZE}, 1fr)`, width: '10rem', height: '10rem' }}
                >
                  {drawingGrid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleGridCellClick(rowIndex, colIndex)}
                        className={cn(
                          "w-full h-full border border-background aspect-square focus:outline-none focus:ring-1 focus:ring-primary",
                          cell === 1 ? "bg-primary" : "bg-background/50 hover:bg-primary/30"
                        )}
                        aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1} - ${cell === 1 ? 'Selected' : 'Not selected'}`}
                      />
                    ))
                  )}
                </div>
              </div>
              <Button onClick={handleSaveNewMino} className="w-full bg-accent hover:bg-accent/90">{t("saveMinoButton")}</Button>
            </div>

            {/* List Custom Minoes Section */}
            <div className="space-y-4 p-4 border rounded-lg shadow">
              <h3 className="text-lg font-semibold">{t("customMinoListTitle")}</h3>
              {customMinoesData.length === 0 ? (
                <p className="text-muted-foreground">{t("noCustomMinoes")}</p>
              ) : (
                <ul className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                  {customMinoesData.map((mino) => (
                    <li key={mino.id} className="flex items-center justify-between p-3 bg-card rounded-md shadow-sm">
                      <div className="flex items-center gap-3">
                        {/* Small Preview Grid */}
                        <div className="grid gap-px bg-muted/50 p-0.5 rounded" style={{ gridTemplateColumns: `repeat(${CUSTOM_MINO_GRID_SIZE}, 1fr)`, width: '2.5rem', height: '2.5rem' }}>
                          {mino.shape.map((row, rIdx) =>
                            row.map((cell, cIdx) => (
                              <div
                                key={`preview-${mino.id}-${rIdx}-${cIdx}`}
                                className={cn(
                                  "w-full h-full",
                                  cell === 1 ? "bg-primary" : "bg-background/20"
                                )}
                              />
                            ))
                          )}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-2xl leading-none">{mino.emoji}</span>
                           <span className="font-medium text-foreground">{mino.name}</span>
                        </div>
                      </div>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("confirmDeleteMinoTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("confirmDeleteMinoDescription", {name: mino.name})}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeCustomMino(mino.id)} className="bg-destructive hover:bg-destructive/90">
                              {t("deleteMinoButton")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("close")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
