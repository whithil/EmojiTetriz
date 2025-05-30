
"use client";

import type { Board, CurrentPiece } from "@/lib/tetris-constants";
import { BOARD_HEIGHT, BOARD_WIDTH } from "@/lib/tetris-constants";
import { cn } from "@/lib/utils";

interface GameBoardProps {
  board: Board;
  currentPiece: CurrentPiece | null;
  ghostPiece: CurrentPiece | null;
  animatingRows: number[];
}

export function GameBoard({ board, currentPiece, ghostPiece, animatingRows }: GameBoardProps) {
  const displayBoard: Board = board.map(row => [...row]);

  // Draw ghost piece first
  if (ghostPiece) {
    ghostPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = ghostPiece.y + y;
          const boardX = ghostPiece.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            if (!displayBoard[boardY][boardX]) { // Only draw if cell is empty
              displayBoard[boardY][boardX] = { emoji: ghostPiece.emoji, type: ghostPiece.type };
            }
          }
        }
      });
    });
  }
  
  // Draw current piece over ghost and board
  if (currentPiece) {
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = currentPiece.y + y;
          const boardX = currentPiece.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = { emoji: currentPiece.emoji, type: currentPiece.type };
          }
        }
      });
    });
  }


  return (
    <div
      className="grid bg-card shadow-lg rounded-lg p-1 md:p-2"
      style={{
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
        aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}`,
        maxHeight: 'calc(90vh - 120px)', // Prevent board from being too tall
        maxWidth: `calc((90vh - 120px) * (${BOARD_WIDTH} / ${BOARD_HEIGHT}))`, // Maintain aspect ratio
        margin: '0 auto', // Center the board
      }}
      role="grid"
      aria-label="Tetris game board"
    >
      {displayBoard.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={cn(
              "tetris-board-cell",
              cell ? "filled" : "empty",
              ghostPiece && ghostPiece.shape.some((gr, gy) => gr.some((gv, gx) => gv !== 0 && ghostPiece.y + gy === y && ghostPiece.x + gx === x)) && ! (currentPiece && currentPiece.shape.some((cr, cy) => cr.some((cv, cx) => cv !== 0 && currentPiece.y + cy === y && currentPiece.x + cx === x))) ? 'ghost-piece' : '',
              cell && animatingRows.includes(y) && "line-clearing" // Apply animation class
            )}
            role="gridcell"
            aria-label={cell ? `Cell ${x + 1}, ${y + 1} filled with ${cell.type} piece` : `Cell ${x + 1}, ${y + 1} empty`}
          >
            {cell ? cell.emoji : ""}
          </div>
        ))
      )}
    </div>
  );
}
