
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

  if (newBagInternal.length === 0 && availablePieceIdentifiers.length > 0) {
    // Refill bag with shuffled available piece identifiers
    newBagInternal = [...availablePieceIdentifiers].sort(() => Math.random() - 0.5);
  } else if (availablePieceIdentifiers.length === 0) {
    // Should not happen if there are standard pieces, but as a safeguard
    // If no pieces are available at all (e.g. standard disabled and no custom)
    // This will become an issue. For now, assume standard pieces are always implicitly available.
    // Or, throw an error / return a dummy piece.
    // For now, if bag is empty and no available identifiers, means we can't generate. This is an edge case.
    // Let's ensure the bag is refilled if empty AND there are identifiers to fill it with.
    // If availablePieceIdentifiers is empty, the game would be unplayable; this logic assumes it's not.
    const fallbackType = TETROMINO_TYPES[0]; // Default to 'I' if everything else fails
    const tetMino = TETROMINOES[fallbackType];
     return {
        piece: {
            shape: tetMino.shapes[0],
            emoji: emojiSet[fallbackType] || tetMino.emoji,
            type: fallbackType,
            x: Math.floor(BOARD_WIDTH / 2) - Math.floor((tetMino.shapes[0][0]?.length || 1) / 2),
            y: 0,
            rotation: 0,
        },
        newBag: [] // Bag remains empty
     };
  }
  
  const identifier = newBagInternal.pop()!; 
  let pieceDetails: Omit<CurrentPiece, 'x' | 'y' | 'rotation'>;

  const standardPieceType = TETROMINO_TYPES.find(t => t === identifier as TetrominoType);

  if (standardPieceType) {
    const tetMino = TETROMINOES[standardPieceType];
    pieceDetails = {
      shape: tetMino.shapes[0],
      emoji: emojiSet[standardPieceType] || tetMino.emoji,
      type: standardPieceType,
    };
  } else { 
    const customMino = allCustomMinoes.find(cm => cm.id === identifier);
    if (!customMino) {
      console.warn(`Custom mino with ID ${identifier} not found, falling back to standard piece.`);
      const fallbackType = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
      const fallbackTetMino = TETROMINOES[fallbackType];
      pieceDetails = {
        shape: fallbackTetMino.shapes[0],
        emoji: emojiSet[fallbackType] || fallbackTetMino.emoji,
        type: fallbackType,
      };
      newBagInternal = newBagInternal.filter(id => id !== identifier);
    } else {
       pieceDetails = {
        shape: customMino.shape, 
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
      y: 0, 
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
          return true; 
        }
        if (newY >= 0 && board[newY] && board[newY][newX] !== null) {
          return true; 
        }
      }
    }
  }
  return false;
};

function rotateMatrixCW(matrix: number[][]): number[][] {
  const rows = matrix.length;
  if (rows === 0) return [];
  const cols = matrix[0]?.length || 0;
  if (cols === 0) return matrix.map(() => []);

  const newMatrix: number[][] = Array(cols).fill(null).map(() => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      newMatrix[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return newMatrix;
}

function rotateMatrixCCW(matrix: number[][]): number[][] {
  const rows = matrix.length;
  if (rows === 0) return [];
  const cols = matrix[0]?.length || 0;
  if (cols === 0) return matrix.map(() => []);

  const newMatrix: number[][] = Array(cols).fill(null).map(() => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      newMatrix[cols - 1 - c][r] = matrix[r][c];
    }
  }
  return newMatrix;
}

export const rotatePieceLogic = (piece: CurrentPiece, board: Board, emojiSet: EmojiSet, direction: 'cw' | 'ccw'): CurrentPiece => {
  if (piece.type === "custom") {
    let newCustomShape: number[][];
    if (direction === 'cw') {
      newCustomShape = rotateMatrixCW(piece.shape);
    } else { // ccw
      newCustomShape = rotateMatrixCCW(piece.shape);
    }

    const newPieceCandidate: CurrentPiece = {
      ...piece,
      shape: newCustomShape,
      rotation: (piece.rotation + (direction === 'cw' ? 1 : -1) + 4) % 4, // Update rotation number
    };

    // Check for collision without kicks for simplicity
    if (!checkCollision(newPieceCandidate, board, {})) {
      return newPieceCandidate;
    } else {
      return piece; // Rotation failed due to collision
    }
  }

  // Standard piece rotation logic
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

  const kicks = [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 2, y: 0 }, { x: -2, y: 0 }, { x: 0, y: -1 },
    // Add more kicks specific to piece types (especially I) if needed for full SRS-like behavior
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

