
import type { Board, Cell, CurrentPiece, EmojiSet, TetrominoType, CustomMinoData } from "./tetris-constants";
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES, TETROMINO_TYPES } from "./tetris-constants";

export const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

export const getRandomPieceLogic = (
  emojiSet: EmojiSet,
  currentPieceBag: Array<TetrominoType | string>, // string for custom mino ID
  allCustomMinoes: CustomMinoData[],
  customMinoesEnabled: boolean
): { piece: CurrentPiece; newBag: Array<TetrominoType | string> } => {
  let newBagInternal = [...currentPieceBag];
  
  const availablePieceIdentifiers: Array<TetrominoType | string> = [...TETROMINO_TYPES];
  if (customMinoesEnabled && allCustomMinoes.length > 0) {
    allCustomMinoes.forEach(customMino => availablePieceIdentifiers.push(customMino.id));
  }

  if (newBagInternal.length === 0) {
    // Refill bag with shuffled available piece identifiers
    newBagInternal = [...availablePieceIdentifiers].sort(() => Math.random() - 0.5);
  }
  
  const identifier = newBagInternal.pop()!; 
  let pieceDetails: Omit<CurrentPiece, 'x' | 'y' | 'rotation'>;

  // Check if it's a standard TetrominoType
  const standardPieceType = TETROMINO_TYPES.find(t => t === identifier as TetrominoType);

  if (standardPieceType) {
    const tetMino = TETROMINOES[standardPieceType];
    pieceDetails = {
      shape: tetMino.shapes[0], // Default to the first rotation
      emoji: emojiSet[standardPieceType] || tetMino.emoji,
      type: standardPieceType,
    };
  } else { // Must be a custom mino ID
    const customMino = allCustomMinoes.find(cm => cm.id === identifier);
    if (!customMino) {
      // Fallback if custom mino ID not found (should not happen if bag is managed correctly)
      // This could happen if a custom mino was deleted but its ID was still in the bag
      // For now, let's pick a random standard piece as a fallback
      console.warn(`Custom mino with ID ${identifier} not found, falling back to standard piece.`);
      const fallbackType = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
      const fallbackTetMino = TETROMINOES[fallbackType];
      pieceDetails = {
        shape: fallbackTetMino.shapes[0],
        emoji: emojiSet[fallbackType] || fallbackTetMino.emoji,
        type: fallbackType,
      };
       // Attempt to clean the bag by removing the invalid identifier
      newBagInternal = newBagInternal.filter(id => id !== identifier);
    } else {
       pieceDetails = {
        shape: customMino.shape, // Custom shapes are single arrays (number[][])
        emoji: customMino.emoji,
        type: "custom",
        id: customMino.id,
      };
    }
  }
  
  return {
    piece: {
      ...pieceDetails,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor((pieceDetails.shape[0]?.length || 1) / 2),
      y: 0, // Start at the top or just below visibility for pieces that are taller than 1 row at their highest point
      rotation: 0,
    },
    newBag: newBagInternal
  };
};


export const checkCollision = (piece: CurrentPiece, board: Board, { xOffset = 0, yOffset = 0 }: { xOffset?: number; yOffset?: number }): boolean => {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] !== 0) {
        const newX = piece.x + x + xOffset;
        const newY = piece.y + y + yOffset;

        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return true; // Collision with wall or bottom
        }
        if (newY >= 0 && board[newY] && board[newY][newX] !== null) {
          return true; // Collision with another piece
        }
      }
    }
  }
  return false;
};

export const rotatePieceLogic = (piece: CurrentPiece, board: Board, emojiSet: EmojiSet, direction: 'cw' | 'ccw'): CurrentPiece => {
  if (piece.type === "custom") { // Custom pieces do not rotate for now
    return piece;
  }

  const originalRotation = piece.rotation;
  const originalX = piece.x;
  const originalY = piece.y;
  const numRotations = TETROMINOES[piece.type].shapes.length;

  let newRotation;
  if (direction === 'cw') {
    newRotation = (piece.rotation + 1) % numRotations;
  } else { // ccw
    newRotation = (piece.rotation - 1 + numRotations) % numRotations;
  }
  
  let newShape = TETROMINOES[piece.type].shapes[newRotation];
  
  const newPiecePartial: CurrentPiece = {
    ...piece,
    shape: newShape,
    rotation: newRotation,
    emoji: emojiSet[piece.type] || TETROMINOES[piece.type].emoji,
  };

  // Basic wall kick logic (try moving piece if rotation causes collision)
  const kicks = [
    { x: 0, y: 0 }, // No kick
    { x: 1, y: 0 }, // Kick right
    { x: -1, y: 0 }, // Kick left
    { x: 2, y: 0 }, // Kick right twice
    { x: -2, y: 0 }, // Kick left twice
    { x: 0, y: -1 }, // Kick up (for I-piece mainly)
  ];

  for (const kick of kicks) {
    const kickedPiece = {
        ...newPiecePartial,
        x: originalX + kick.x,
        y: originalY + kick.y
    }
    if (!checkCollision(kickedPiece, board, {})) {
      return kickedPiece;
    }
  }
  
  // If all kicks fail, revert to original piece (no rotation)
  return piece; 
};

export const mergePieceToBoard = (piece: CurrentPiece, board: Board): Board => {
  const newBoard = board.map(row => [...row]);
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const boardY = piece.y + y;
        const boardX = piece.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
           newBoard[boardY][boardX] = { 
             emoji: piece.emoji, 
             type: piece.type,
             id: piece.type === "custom" ? piece.id : undefined 
            };
        }
      }
    });
  });
  return newBoard;
};

export const getClearedRowIndices = (board: Board): number[] => {
  const indices: number[] = [];
  board.forEach((row, y) => {
    if (row.every(cell => cell !== null)) {
      indices.push(y);
    }
  });
  return indices;
};

export const performLineClear = (board: Board, clearedRowIndices: number[]): { board: Board, linesCleared: number } => {
  let linesClearedCount = clearedRowIndices.length;
  if (linesClearedCount === 0) {
    return { board, linesCleared: 0 };
  }

  let newBoard = board.filter((_, y) => !clearedRowIndices.includes(y));

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }
  
  return { board: newBoard, linesCleared: linesClearedCount };
};


export const getGhostPiece = (currentPiece: CurrentPiece, board: Board): CurrentPiece => {
  let ghostPiece = { ...currentPiece, y: currentPiece.y };
  while (!checkCollision(ghostPiece, board, { yOffset: 1 })) {
    ghostPiece.y++;
  }
  return ghostPiece;
};
