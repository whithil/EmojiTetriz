
"use client";

import type { CurrentPiece } from "@/lib/tetris-constants";
import { cn } from "@/lib/utils";

interface HeldPiecePreviewProps {
  piece: CurrentPiece | null;
  title: string;
}

const PREVIEW_GRID_SIZE = 4; // Max size for any piece

export function HeldPiecePreview({ piece, title }: HeldPiecePreviewProps) {
  const grid: (string | null)[][] = Array.from({ length: PREVIEW_GRID_SIZE }, () =>
    Array(PREVIEW_GRID_SIZE).fill(null)
  );

  if (piece) {
    // Center the piece in the preview grid
    const pieceHeight = piece.shape.length;
    const pieceWidth = piece.shape[0]?.length || 0;
    const startY = Math.floor((PREVIEW_GRID_SIZE - pieceHeight) / 2);
    const startX = Math.floor((PREVIEW_GRID_SIZE - pieceWidth) / 2);

    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          if (startY + y < PREVIEW_GRID_SIZE && startX + x < PREVIEW_GRID_SIZE) {
            grid[startY + y][startX + x] = piece.emoji;
          }
        }
      });
    });
  }

  return (
    <div className="bg-card p-4 rounded-lg shadow-md text-center">
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <div
        className="grid m-auto"
        style={{
          gridTemplateColumns: `repeat(${PREVIEW_GRID_SIZE}, 1fr)`,
          width: "6rem", // Fixed size for preview
          height: "6rem",
        }}
        aria-label={`${title} piece preview`}
      >
        {grid.map((row, y) =>
          row.map((cellEmoji, x) => (
            <div
              key={`${y}-${x}-held`}
              className={cn(
                "w-full h-full flex items-center justify-center text-xl",
                cellEmoji
                  ? "border border-foreground/10"
                  : "bg-background/30 border border-transparent"
              )}
            >
              {cellEmoji}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

    