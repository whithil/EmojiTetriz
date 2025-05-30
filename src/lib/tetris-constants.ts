
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type TetrominoType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

export interface PieceShape {
  shapes: number[][][]; // Array of rotation matrices
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
    emoji: "🧊",
    colorClass: "bg-cyan-500",
  },
  J: {
    shapes: [
      [[1,0,0], [1,1,1], [0,0,0]],
      [[0,1,1], [0,1,0], [0,1,0]],
      [[0,0,0], [1,1,1], [0,0,1]],
      [[0,1,0], [0,1,0], [1,1,0]],
    ],
    emoji: "🟦",
    colorClass: "bg-blue-500",
  },
  L: {
    shapes: [
      [[0,0,1], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,0], [0,1,1]],
      [[0,0,0], [1,1,1], [1,0,0]],
      [[1,1,0], [0,1,0], [0,1,0]],
    ],
    emoji: "🟧",
    colorClass: "bg-orange-500",
  },
  O: {
    shapes: [
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]],
    ],
    emoji: "🟨",
    colorClass: "bg-yellow-500",
  },
  S: {
    shapes: [
      [[0,1,1], [1,1,0], [0,0,0]],
      [[0,1,0], [0,1,1], [0,0,1]],
      [[0,0,0], [0,1,1], [1,1,0]],
      [[1,0,0], [1,1,0], [0,1,0]],
    ],
    emoji: "🟩",
    colorClass: "bg-green-500",
  },
  T: {
    shapes: [
      [[0,1,0], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,1], [0,1,0]],
      [[0,1,0], [1,1,0], [0,1,0]],
    ],
    emoji: "🟪",
    colorClass: "bg-purple-500",
  },
  Z: {
    shapes: [
      [[1,1,0], [0,1,1], [0,0,0]],
      [[0,0,1], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,0], [0,1,1]],
      [[0,1,0], [1,1,0], [1,0,0]],
    ],
    emoji: "🟥",
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
  type: TetrominoType | "custom"; // Added "custom" type
  id?: string; // Optional ID for custom minoes
} | null;

export type Board = Cell[][];

export interface CurrentPiece {
  x: number;
  y: number;
  shape: number[][];
  emoji: string;
  type: TetrominoType | "custom";
  rotation: number;
  id?: string; // Optional ID for custom minoes
}

export type EmojiSet = Record<TetrominoType, string>;

export const DEFAULT_EMOJI_SET: EmojiSet = TETROMINO_TYPES.reduce((acc, type) => {
  acc[type] = TETROMINOES[type].emoji;
  return acc;
}, {} as EmojiSet);


// Control Mapping Constants
export const GAME_ACTIONS = [
  "moveLeft", "moveRight", "softDrop", "hardDrop",
  "rotateCW", "rotateCCW", "holdPiece", "pauseResume"
] as const;

export type GameAction = typeof GAME_ACTIONS[number];

export type KeyboardMapping = Partial<Record<GameAction, string>>;
export type GamepadMapping = Partial<Record<GameAction, number>>; // Stores button index

// Standard Gamepad Button Mappings (indices)
export const GP_BUTTON_A_CROSS = 0;
export const GP_BUTTON_B_CIRCLE = 1;
export const GP_BUTTON_X_SQUARE = 2;
export const GP_BUTTON_Y_TRIANGLE = 3;
export const GP_BUTTON_L1_LB = 4;
export const GP_BUTTON_R1_RB = 5;
export const GP_BUTTON_L2_LT = 6;
export const GP_BUTTON_R2_RT = 7;
export const GP_BUTTON_SELECT_BACK = 8;
export const GP_BUTTON_START_OPTIONS = 9;
export const GP_BUTTON_L3_STICK = 10;
export const GP_BUTTON_R3_STICK = 11;
export const GP_DPAD_UP = 12;
export const GP_DPAD_DOWN = 13;
export const GP_DPAD_LEFT = 14;
export const GP_DPAD_RIGHT = 15;

// Standard Gamepad Axes
export const GP_AXIS_LEFT_HORIZONTAL = 0;
export const GP_AXIS_LEFT_VERTICAL = 1;
export const GP_AXIS_RIGHT_HORIZONTAL = 2;
export const GP_AXIS_RIGHT_VERTICAL = 3;

export const AXIS_THRESHOLD = 0.5; // Threshold for analog stick input


export const DEFAULT_KEYBOARD_MAPPINGS: Readonly<KeyboardMapping> = {
  moveLeft: "arrowleft",
  moveRight: "arrowright",
  softDrop: "arrowdown",
  hardDrop: " ", // Space bar
  rotateCW: "arrowup",
  rotateCCW: "z",
  holdPiece: "c",
  pauseResume: "p",
};

export const DEFAULT_GAMEPAD_MAPPINGS: Readonly<GamepadMapping> = {
  moveLeft: GP_DPAD_LEFT,
  moveRight: GP_DPAD_RIGHT,
  softDrop: GP_DPAD_DOWN,
  hardDrop: GP_DPAD_UP,
  rotateCW: GP_BUTTON_A_CROSS,
  rotateCCW: GP_BUTTON_B_CIRCLE,
  holdPiece: GP_BUTTON_Y_TRIANGLE,
  pauseResume: GP_BUTTON_START_OPTIONS,
};

// Helper to get a display-friendly name for keys
export const getKeyDisplayName = (key: string): string => {
  if (key === " ") return "Space";
  if (key.startsWith("arrow")) return key.charAt(5).toUpperCase() + key.slice(6) + " Arrow";
  return key.toUpperCase();
};

// Helper to get a display-friendly name for gamepad buttons
export const getGamepadButtonDisplayName = (buttonIndex: number): string => {
  switch (buttonIndex) {
    case GP_BUTTON_A_CROSS: return "A/Cross";
    case GP_BUTTON_B_CIRCLE: return "B/Circle";
    case GP_BUTTON_X_SQUARE: return "X/Square";
    case GP_BUTTON_Y_TRIANGLE: return "Y/Triangle";
    case GP_BUTTON_L1_LB: return "L1/LB";
    case GP_BUTTON_R1_RB: return "R1/RB";
    case GP_BUTTON_L2_LT: return "L2/LT";
    case GP_BUTTON_R2_RT: return "R2/RT";
    case GP_BUTTON_SELECT_BACK: return "Select/Back";
    case GP_BUTTON_START_OPTIONS: return "Start/Options";
    case GP_DPAD_UP: return "D-Pad Up";
    case GP_DPAD_DOWN: return "D-Pad Down";
    case GP_DPAD_LEFT: return "D-Pad Left";
    case GP_DPAD_RIGHT: return "D-Pad Right";
    default: return `Button ${buttonIndex}`;
  }
};

// Custom Minoes
export interface CustomMinoData {
  id: string; // Unique identifier
  name: string;
  emoji: string;
  shape: number[][]; // For now, only one shape (no rotations)
}

export const INITIAL_CUSTOM_MINOES_DATA: CustomMinoData[] = [];
export const CUSTOM_MINO_GRID_SIZE = 4; // For drawing

// Augment LocalizationContextType to ensure t_type is recognized for strong typing t function
declare module "@/contexts/LocalizationContext" {
  interface LocalizationContextType {
    t_type: typeof import("@/locales/en-US.json");
  }
}
