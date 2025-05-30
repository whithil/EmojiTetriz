
"use client";
import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Board, CurrentPiece, EmojiSet, GameState, TetrominoType } from "@/lib/tetris-constants";
import { 
  createEmptyBoard, 
  getRandomPiece as getRandomPieceLogic, 
  checkCollision, 
  rotatePiece as rotateLogic, 
  mergePieceToBoard, 
  clearLines as clearLinesLogic,
  getGhostPiece as getGhostPieceLogic
} from "@/lib/tetris-logic";
import { 
  BOARD_HEIGHT,
  BOARD_WIDTH, 
  INITIAL_LEVEL, 
  INITIAL_SCORE, 
  INITIAL_LINES_CLEARED, 
  DEFAULT_EMOJI_SET,
  TETROMINO_TYPES
} from "@/lib/tetris-constants";
import { useLocalization } from "./LocalizationContext";

interface GameContextType {
  board: Board;
  currentPiece: CurrentPiece | null;
  nextPiece: CurrentPiece | null;
  ghostPiece: CurrentPiece | null;
  heldPiece: CurrentPiece | null;
  canHold: boolean;
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
  holdPiece: () => void;
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
  const [heldPiece, setHeldPiece] = useState<CurrentPiece | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [pieceBag, setPieceBag] = useState<TetrominoType[]>([]);
  const [score, setScore] = useState(INITIAL_SCORE);
  const [level, setLevel] = useState(INITIAL_LEVEL);
  const [linesCleared, setLinesCleared] = useState(INITIAL_LINES_CLEARED);
  const [gameState, setGameState] = useState<GameState>("gameOver");
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

  const internalGetRandomPiece = useCallback(() => {
    return getRandomPieceLogic(emojiSet, pieceBag);
  }, [emojiSet, pieceBag]);

  const spawnNewPiece = useCallback((pieceToSpawnInsteadOfNext?: CurrentPiece) => {
    const pieceForCurrent = pieceToSpawnInsteadOfNext || nextPiece;
    const { piece: newNextPieceVal, newBag } = internalGetRandomPiece();
    
    setPieceBag(newBag);
    setNextPiece(newNextPieceVal);
    
    if (pieceForCurrent) {
      const positionedPiece: CurrentPiece = {
        ...pieceForCurrent,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(pieceForCurrent.shape[0].length / 2),
        y: 0, 
      };

      if (checkCollision(positionedPiece, board, {})) {
        setGameState("gameOver");
        setCurrentPiece(null);
        setNextPiece(null); 
        setHeldPiece(null);
      } else {
        setCurrentPiece(positionedPiece);
      }
    } else { 
      const { piece: firstPiece, newBag: firstBag } = internalGetRandomPiece();
      setPieceBag(firstBag);
      const positionedFirstPiece: CurrentPiece = {
        ...firstPiece,
         x: Math.floor(BOARD_WIDTH / 2) - Math.floor(firstPiece.shape[0].length / 2),
        y: 0,
      };
      if (checkCollision(positionedFirstPiece, board, {})) {
         setGameState("gameOver");
         setCurrentPiece(null);
      } else {
        setCurrentPiece(positionedFirstPiece);
      }
    }
  }, [nextPiece, board, internalGetRandomPiece]);


  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setScore(INITIAL_SCORE);
    setLevel(INITIAL_LEVEL);
    setLinesCleared(INITIAL_LINES_CLEARED);
    setGameSpeed(calculateGameSpeed(INITIAL_LEVEL));
    setGameState("playing");
    
    setHeldPiece(null);
    setCanHold(true);

    // Initialize piece bag and first two pieces
    const { piece: firstPieceVal, newBag: bagAfterFirst } = internalGetRandomPiece(); // Use internal which handles bag
    const { piece: secondPieceVal, newBag: bagAfterSecond } = getRandomPieceLogic(emojiSet, bagAfterFirst); // Use direct for next to ensure bag is used
    
    const positionedFirstPiece: CurrentPiece = {
        ...firstPieceVal,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(firstPieceVal.shape[0].length / 2),
        y: 0,
    };
    setCurrentPiece(positionedFirstPiece);
    setNextPiece(secondPieceVal);
    setPieceBag(bagAfterSecond);

  }, [emojiSet, internalGetRandomPiece]); // internalGetRandomPiece has emojiSet and pieceBag as deps

  const lockPieceAndSpawnNew = useCallback((pieceToLock: CurrentPiece) => {
    let newBoard = mergePieceToBoard(pieceToLock, board);
    const { board: boardAfterClear, linesCleared: numLinesCleared } = clearLinesLogic(newBoard);
    setBoard(boardAfterClear);

    if (numLinesCleared > 0) {
      const newLinesClearedTotal = linesCleared + numLinesCleared;
      setLinesCleared(newLinesClearedTotal);
      let lineScore = 0;
      if (numLinesCleared === 1) lineScore = 40;
      else if (numLinesCleared === 2) lineScore = 100;
      else if (numLinesCleared === 3) lineScore = 300;
      else if (numLinesCleared >= 4) lineScore = 1200; // Tetris bonus
      setScore(prev => prev + lineScore * level);
      
      const newLevel = Math.floor(newLinesClearedTotal / 10) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setGameSpeed(calculateGameSpeed(newLevel));
      }
    }
    spawnNewPiece();
    setCanHold(true); 
  }, [board, linesCleared, level, score, spawnNewPiece]);

  const processMoveDown = useCallback(() => {
    if (!currentPiece || gameState !== "playing") return;

    if (!checkCollision(currentPiece, board, { yOffset: 1 })) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
    } else {
      lockPieceAndSpawnNew(currentPiece);
    }
  }, [currentPiece, board, gameState, lockPieceAndSpawnNew]);

  const holdPiece = useCallback(() => {
    if (!currentPiece || gameState !== "playing" || !canHold) return;

    const pieceToStoreInHold: CurrentPiece = { 
        ...currentPiece, 
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2),
        y: 0 
    };

    if (!heldPiece) {
      setHeldPiece(pieceToStoreInHold);
      spawnNewPiece(); 
    } else {
      const pieceFromHold = heldPiece;
      setHeldPiece(pieceToStoreInHold);
      spawnNewPiece(pieceFromHold); 
    }
    setCanHold(false);
  }, [currentPiece, heldPiece, gameState, canHold, spawnNewPiece]);


  useEffect(() => {
    if (gameState === "playing" && !isSoftDropping) {
      const gameInterval = setInterval(processMoveDown, gameSpeed);
      return () => clearInterval(gameInterval);
    }
  }, [gameState, processMoveDown, gameSpeed, isSoftDropping]);

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
    setIsSoftDropping(true); 
    processMoveDown();
    setTimeout(() => setIsSoftDropping(false), 50); 
  };

  const hardDrop = () => {
    if (!currentPiece || gameState !== "playing") return;
    let finalLandedPiece = { ...currentPiece };
    while (!checkCollision(finalLandedPiece, board, { yOffset: 1 })) {
      finalLandedPiece.y += 1;
    }
    // Directly lock the piece at its final determined position
    lockPieceAndSpawnNew(finalLandedPiece);
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
      board, currentPiece, nextPiece, ghostPiece, heldPiece, canHold, score, level, linesCleared, gameState, emojiSet, isSoftDropping,
      startGame, pauseGame, resumeGame, moveLeft, moveRight, rotatePiece, softDrop, hardDrop, holdPiece, setEmojiSet, getCurrentGameStateForAI
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

    

    