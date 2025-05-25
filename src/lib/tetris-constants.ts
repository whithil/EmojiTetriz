
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type TetrominoType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

export interface PieceShape {
  shape: number[][][]; // Array of rotation matrices
  emoji: string;
  colorClass: string; // For potential styling beyond emoji
}

export const TETROMINOES: Record<TetrominoType, PieceShape> = {
  I: {
    shapes: [
      [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
      [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
      [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]],
    ],
    emoji: "🧊", // Cyan block
    colorClass: "bg-cyan-500",
  },
  J: {
    shapes: [
      [[1,0,0], [1,1,1], [0,0,0]],
      [[0,1,1], [0,1,0], [0,1,0]],
      [[0,0,0], [1,1,1], [0,0,1]],
      [[0,1,0], [0,1,0], [1,1,0]],
    ],
    emoji: "🟦", // Blue block
    colorClass: "bg-blue-500",
  },
  L: {
    shapes: [
      [[0,0,1], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,0], [0,1,1]],
      [[0,0,0], [1,1,1], [1,0,0]],
      [[1,1,0], [0,1,0], [0,1,0]],
    ],
    emoji: "🟧", // Orange block
    colorClass: "bg-orange-500",
  },
  O: {
    shapes: [
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]],
    ],
    emoji: "🟨", // Yellow block
    colorClass: "bg-yellow-500",
  },
  S: {
    shapes: [
      [[0,1,1], [1,1,0], [0,0,0]],
      [[0,1,0], [0,1,1], [0,0,1]],
      [[0,0,0], [0,1,1], [1,1,0]],
      [[1,0,0], [1,1,0], [0,1,0]],
    ],
    emoji: "🟩", // Green block
    colorClass: "bg-green-500",
  },
  T: {
    shapes: [
      [[0,1,0], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,1], [0,1,0]],
      [[0,1,0], [1,1,0], [0,1,0]],
    ],
    emoji: "🟪", // Purple block
    colorClass: "bg-purple-500",
  },
  Z: {
    shapes: [
      [[1,1,0], [0,1,1], [0,0,0]],
      [[0,0,1], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,0], [0,1,1]],
      [[0,1,0], [1,1,0], [1,0,0]],
    ],
    emoji: "🟥", // Red block
    colorClass: "bg-red-500",
  },
};

export const TETROMINO_TYPES = Object.keys(TETROMINOES) as TetrominoType[];

export const INITIAL_LEVEL = 1;
export const INITIAL_SCORE = 0;
export const INITIAL_LINES_CLEARED = 0;

export type GameState = "playing" | "paused" | "gameOver";

export type Cell = {
  emoji: string;
  type: TetrominoType;
} | null;

export type Board = Cell[][];

export interface CurrentPiece {
  x: number;
  y: number;
  shape: number[][];
  emoji: string;
  type: TetrominoType;
  rotation: number;
}

export type EmojiSet = Record<TetrominoType, string>;

export const DEFAULT_EMOJI_SET: EmojiSet = TETROMINO_TYPES.reduce((acc, type) => {
  acc[type] = TETROMINOES[type].emoji;
  return acc;
}, {} as EmojiSet);
