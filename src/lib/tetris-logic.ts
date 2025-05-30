
import type { Board, Cell, CurrentPiece, EmojiSet, TetrominoType } from "./tetris-constants";
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES, TETROMINO_TYPES } from "./tetris-constants";

export const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

export const getRandomPiece = (emojiSet: EmojiSet, pieceBag: TetrominoType[]): { piece: CurrentPiece, newBag: TetrominoType[] } => {
  let newBag = [...pieceBag];
  if (newBag.length === 0) {
    // Refill bag with shuffled tetromino types
    newBag = [...TETROMINO_TYPES].sort(() => Math.random() - 0.5);
  }
  
  const type = newBag.pop()!; // Assert non-null as bag is refilled if empty
  const pieceData = TETROMINOES[type];
  
  return {
    piece: {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(pieceData.shapes[0][0].length / 2),
      y: 0,
      shape: pieceData.shapes[0],
      emoji: emojiSet[type] || pieceData.emoji,
      type: type,
      rotation: 0,
    },
    newBag
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
  
  const newPiece: CurrentPiece = {
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
    newPiece.x = originalX + kick.x;
    newPiece.y = originalY + kick.y;
    if (!checkCollision(newPiece, board, {})) {
      return newPiece;
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
           newBoard[boardY][boardX] = { emoji: piece.emoji, type: piece.type };
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

