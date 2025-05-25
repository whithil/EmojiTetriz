
"use client";
import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Board, CurrentPiece, EmojiSet, GameState, TetrominoType } from "@/lib/tetris-constants";
import { 
  createEmptyBoard, 
  getRandomPiece, 
  checkCollision, 
  rotatePiece as rotateLogic, 
  mergePieceToBoard, 
  clearLines as clearLinesLogic,
  getGhostPiece as getGhostPieceLogic
} from "@/lib/tetris-logic";
import { 
  BOARD_HEIGHT,
  INITIAL_LEVEL, 
  INITIAL_SCORE, 
  INITIAL_LINES_CLEARED, 
  DEFAULT_EMOJI_SET,
  TETROMINO_TYPES
} from "@/lib/tetris-constants";
import { useLocalization } from "./LocalizationContext"; // For game over text potentially

interface GameContextType {
  board: Board;
  currentPiece: CurrentPiece | null;
  nextPiece: CurrentPiece | null;
  ghostPiece: CurrentPiece | null;
  score: number;
  level: number;
  linesCleared: number;
  gameState: GameState;
  emojiSet: EmojiSet;
  isSoftDropping: boolean;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  rotatePiece: () => void;
  softDrop: () => void;
  hardDrop: () => void;
  setEmojiSet: (newEmojiSet: EmojiSet) => void;
  getCurrentGameStateForAI: () => { score: number; level: number; linesCleared: number; gameState: GameState };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const calculateGameSpeed = (level: number) => Math.max(1000 / level, 100);


export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<CurrentPiece | null>(null);
  const [nextPiece, setNextPiece] = useState<CurrentPiece | null>(null);
  const [ghostPiece, setGhostPiece] = useState<CurrentPiece | null>(null);
  const [pieceBag, setPieceBag] = useState<TetrominoType[]>([]);
  const [score, setScore] = useState(INITIAL_SCORE);
  const [level, setLevel] = useState(INITIAL_LEVEL);
  const [linesCleared, setLinesCleared] = useState(INITIAL_LINES_CLEARED);
  const [gameState, setGameState] = useState<GameState>("gameOver"); // Start in gameOver state
  const [emojiSet, setEmojiSetState] = useState<EmojiSet>(DEFAULT_EMOJI_SET);
  const [gameSpeed, setGameSpeed] = useState(calculateGameSpeed(INITIAL_LEVEL));
  const [isSoftDropping, setIsSoftDropping] = useState(false);
  
  const { t } = useLocalization();

  const setEmojiSet = useCallback((newEmojiSet: EmojiSet) => {
    setEmojiSetState(newEmojiSet);
    localStorage.setItem("emojiSet", JSON.stringify(newEmojiSet));
  }, []);

  useEffect(() => {
    const storedEmojiSet = localStorage.getItem("emojiSet");
    if (storedEmojiSet) {
      try {
        const parsedEmojiSet = JSON.parse(storedEmojiSet) as EmojiSet;
        // Basic validation: ensure all types exist
        let valid = true;
        for(const type of TETROMINO_TYPES) {
          if(!parsedEmojiSet[type]) {
            valid = false;
            break;
          }
        }
        if(valid) setEmojiSetState(parsedEmojiSet);
        else setEmojiSetState(DEFAULT_EMOJI_SET);

      } catch (e) {
        setEmojiSetState(DEFAULT_EMOJI_SET);
      }
    }
  }, []);

  const spawnNewPiece = useCallback(() => {
    const currentIsNext = nextPiece;
    const { piece: newNextPieceVal, newBag } = getRandomPiece(emojiSet, pieceBag);
    setPieceBag(newBag);
    
    if (currentIsNext) {
      if (checkCollision(currentIsNext, board, {})) {
        setGameState("gameOver");
        setCurrentPiece(null);
      } else {
        setCurrentPiece(currentIsNext);
      }
    }
    setNextPiece(newNextPieceVal);
  }, [nextPiece, board, emojiSet, pieceBag]);


  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setScore(INITIAL_SCORE);
    setLevel(INITIAL_LEVEL);
    setLinesCleared(INITIAL_LINES_CLEARED);
    setGameSpeed(calculateGameSpeed(INITIAL_LEVEL));
    setGameState("playing");
    
    // Initialize piece bag and first two pieces
    let initialBag: TetrominoType[] = [...TETROMINO_TYPES].sort(() => Math.random() - 0.5);
    const { piece: firstPiece, newBag: bagAfterFirst } = getRandomPiece(emojiSet, initialBag);
    const { piece: secondPiece, newBag: bagAfterSecond } = getRandomPiece(emojiSet, bagAfterFirst);
    
    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);
    setPieceBag(bagAfterSecond);

  }, [emojiSet]);


  const processMoveDown = useCallback(() => {
    if (!currentPiece || gameState !== "playing") return;

    if (!checkCollision(currentPiece, board, { yOffset: 1 })) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
    } else {
      // Lock piece and spawn new
      let newBoard = mergePieceToBoard(currentPiece, board);
      const { board: boardAfterClear, linesCleared: numLinesCleared } = clearLinesLogic(newBoard);
      setBoard(boardAfterClear);

      if (numLinesCleared > 0) {
        const newLinesCleared = linesCleared + numLinesCleared;
        setLinesCleared(newLinesCleared);
        // Score based on lines cleared (simple version)
        // 1 line: 40 * level, 2 lines: 100 * level, 3 lines: 300 * level, 4 lines: 1200 * level
        let lineScore = 0;
        if (numLinesCleared === 1) lineScore = 40;
        else if (numLinesCleared === 2) lineScore = 100;
        else if (numLinesCleared === 3) lineScore = 300;
        else if (numLinesCleared >= 4) lineScore = 1200;
        setScore(prev => prev + lineScore * level);
        
        // Level up every 10 lines
        const newLevel = Math.floor(newLinesCleared / 10) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
          setGameSpeed(calculateGameSpeed(newLevel));
        }
      }
      spawnNewPiece();
    }
  }, [currentPiece, board, gameState, spawnNewPiece, linesCleared, level, score]);

  useEffect(() => {
    if (gameState === "playing" && !isSoftDropping) {
      const gameInterval = setInterval(processMoveDown, gameSpeed);
      return () => clearInterval(gameInterval);
    }
  }, [gameState, processMoveDown, gameSpeed, isSoftDropping]);

  // Update ghost piece
  useEffect(() => {
    if (currentPiece && gameState === "playing") {
      setGhostPiece(getGhostPieceLogic(currentPiece, board));
    } else {
      setGhostPiece(null);
    }
  }, [currentPiece, board, gameState]);

  const moveLeft = () => {
    if (!currentPiece || gameState !== "playing" || checkCollision(currentPiece, board, { xOffset: -1 })) return;
    setCurrentPiece(prev => prev ? { ...prev, x: prev.x - 1 } : null);
  };

  const moveRight = () => {
    if (!currentPiece || gameState !== "playing" || checkCollision(currentPiece, board, { xOffset: 1 })) return;
    setCurrentPiece(prev => prev ? { ...prev, x: prev.x + 1 } : null);
  };

  const rotatePiece = () => {
    if (!currentPiece || gameState !== "playing") return;
    const rotated = rotateLogic(currentPiece, board, emojiSet);
    setCurrentPiece(rotated);
  };
  
  const softDrop = () => {
    if (!currentPiece || gameState !== "playing") return;
    setIsSoftDropping(true); // Indicate soft drop is active
    processMoveDown();
    // Set a short timeout to reset isSoftDropping, allowing normal gravity to resume smoothly
    // This also prevents multiple soft drops from stacking intervals if key is held.
    // A more robust solution might use requestAnimationFrame or better input handling.
    setTimeout(() => setIsSoftDropping(false), 50); 
  };

  const hardDrop = () => {
    if (!currentPiece || gameState !== "playing") return;
    let tempPiece = { ...currentPiece };
    while (!checkCollision(tempPiece, board, { yOffset: 1 })) {
      tempPiece.y += 1;
    }
    setCurrentPiece(tempPiece);
    // After hard drop, the piece will lock on the next game tick via processMoveDown
  };

  const pauseGame = () => {
    if (gameState === "playing") setGameState("paused");
  };

  const resumeGame = () => {
    if (gameState === "paused") setGameState("playing");
  };

  const getCurrentGameStateForAI = useCallback(() => {
    return { score, level, linesCleared, gameState };
  }, [score, level, linesCleared, gameState]);


  return (
    <GameContext.Provider value={{
      board, currentPiece, nextPiece, ghostPiece, score, level, linesCleared, gameState, emojiSet, isSoftDropping,
      startGame, pauseGame, resumeGame, moveLeft, moveRight, rotatePiece, softDrop, hardDrop, setEmojiSet, getCurrentGameStateForAI
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
