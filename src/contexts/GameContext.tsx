
"use client";
import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Board, CurrentPiece, EmojiSet, GameState, TetrominoType, KeyboardMapping, GamepadMapping, GameAction } from "@/lib/tetris-constants";
import { 
  createEmptyBoard, 
  getRandomPiece as getRandomPieceLogic, 
  checkCollision, 
  rotatePieceLogic, 
  mergePieceToBoard,
  getClearedRowIndices,
  performLineClear,
  getGhostPiece as getGhostPieceLogic
} from "@/lib/tetris-logic";
import { 
  BOARD_HEIGHT,
  BOARD_WIDTH, 
  INITIAL_LEVEL, 
  INITIAL_SCORE, 
  INITIAL_LINES_CLEARED, 
  DEFAULT_EMOJI_SET,
  TETROMINO_TYPES,
  DEFAULT_KEYBOARD_MAPPINGS,
  DEFAULT_GAMEPAD_MAPPINGS,
  GAME_ACTIONS,
} from "@/lib/tetris-constants";
import { useLocalization } from "./LocalizationContext";

const LINE_CLEAR_ANIMATION_DURATION = 300; // ms
const LOCAL_STORAGE_KEYBOARD_MAPPINGS_KEY = "tetrisKeyboardMappings";
const LOCAL_STORAGE_GAMEPAD_MAPPINGS_KEY = "tetrisGamepadMappings";


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
  animatingRows: number[];
  keyboardMappings: KeyboardMapping;
  gamepadMappings: GamepadMapping;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  rotatePiece: (direction: 'cw' | 'ccw') => void;
  softDrop: () => void;
  hardDrop: () => void;
  holdPiece: () => void;
  setEmojiSet: (newEmojiSet: EmojiSet) => void;
  getCurrentGameStateForAI: () => { score: number; level: number; linesCleared: number; gameState: GameState };
  updateKeyboardMapping: (action: GameAction, key: string) => void;
  updateGamepadMapping: (action: GameAction, buttonIndex: number) => void;
  resetControlMappings: () => void;
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
  const [animatingRows, setAnimatingRows] = useState<number[]>([]);

  const [keyboardMappings, setKeyboardMappingsInternal] = useState<KeyboardMapping>(DEFAULT_KEYBOARD_MAPPINGS);
  const [gamepadMappings, setGamepadMappingsInternal] = useState<GamepadMapping>(DEFAULT_GAMEPAD_MAPPINGS);
  
  const { t } = useLocalization();

  // Load mappings from localStorage on mount
  useEffect(() => {
    const storedKeyboardMappings = localStorage.getItem(LOCAL_STORAGE_KEYBOARD_MAPPINGS_KEY);
    if (storedKeyboardMappings) {
      try {
        setKeyboardMappingsInternal(JSON.parse(storedKeyboardMappings));
      } catch (e) {
        console.error("Failed to parse keyboard mappings from localStorage", e);
        setKeyboardMappingsInternal(DEFAULT_KEYBOARD_MAPPINGS);
      }
    }

    const storedGamepadMappings = localStorage.getItem(LOCAL_STORAGE_GAMEPAD_MAPPINGS_KEY);
    if (storedGamepadMappings) {
       try {
        setGamepadMappingsInternal(JSON.parse(storedGamepadMappings));
      } catch (e) {
        console.error("Failed to parse gamepad mappings from localStorage", e);
        setGamepadMappingsInternal(DEFAULT_GAMEPAD_MAPPINGS);
      }
    }
  }, []);

  const updateKeyboardMapping = useCallback((action: GameAction, newKey: string) => {
    setKeyboardMappingsInternal(prev => {
      const newMappings = { ...prev, [action]: newKey.toLowerCase() };
      // Ensure no other action is mapped to this new key
      GAME_ACTIONS.forEach(act => {
        if (act !== action && newMappings[act] === newKey.toLowerCase()) {
          delete newMappings[act]; // Unassign from old action
        }
      });
      localStorage.setItem(LOCAL_STORAGE_KEYBOARD_MAPPINGS_KEY, JSON.stringify(newMappings));
      return newMappings;
    });
  }, []);

  const updateGamepadMapping = useCallback((action: GameAction, newButtonIndex: number) => {
    setGamepadMappingsInternal(prev => {
      const newMappings = { ...prev, [action]: newButtonIndex };
      // Ensure no other action is mapped to this new button
      GAME_ACTIONS.forEach(act => {
        if (act !== action && newMappings[act] === newButtonIndex) {
           delete newMappings[act]; // Unassign from old action
        }
      });
      localStorage.setItem(LOCAL_STORAGE_GAMEPAD_MAPPINGS_KEY, JSON.stringify(newMappings));
      return newMappings;
    });
  }, []);

  const resetControlMappings = useCallback(() => {
    setKeyboardMappingsInternal(DEFAULT_KEYBOARD_MAPPINGS);
    setGamepadMappingsInternal(DEFAULT_GAMEPAD_MAPPINGS);
    localStorage.setItem(LOCAL_STORAGE_KEYBOARD_MAPPINGS_KEY, JSON.stringify(DEFAULT_KEYBOARD_MAPPINGS));
    localStorage.setItem(LOCAL_STORAGE_GAMEPAD_MAPPINGS_KEY, JSON.stringify(DEFAULT_GAMEPAD_MAPPINGS));
  }, []);


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
    setAnimatingRows([]);
    
    setHeldPiece(null);
    setCanHold(true);

    const { piece: firstPieceVal, newBag: bagAfterFirst } = internalGetRandomPiece();
    const { piece: secondPieceVal, newBag: bagAfterSecond } = getRandomPieceLogic(emojiSet, bagAfterFirst);
    
    const positionedFirstPiece: CurrentPiece = {
        ...firstPieceVal,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(firstPieceVal.shape[0].length / 2),
        y: 0,
    };
    setCurrentPiece(positionedFirstPiece);
    setNextPiece(secondPieceVal);
    setPieceBag(bagAfterSecond);

  }, [emojiSet, internalGetRandomPiece]);

  const lockPieceAndSpawnNew = useCallback((pieceToLock: CurrentPiece) => {
    const boardWithPiece = mergePieceToBoard(pieceToLock, board);
    const clearedIndices = getClearedRowIndices(boardWithPiece);

    if (clearedIndices.length > 0) {
      setBoard(boardWithPiece); 
      setAnimatingRows(clearedIndices);
      
      const numLinesCleared = clearedIndices.length;
      const newLinesClearedTotal = linesCleared + numLinesCleared;
      setLinesCleared(newLinesClearedTotal);
      let lineScore = 0;
      if (numLinesCleared === 1) lineScore = 40;
      else if (numLinesCleared === 2) lineScore = 100;
      else if (numLinesCleared === 3) lineScore = 300;
      else if (numLinesCleared >= 4) lineScore = 1200;
      setScore(prev => prev + lineScore * level);
      
      const newLevel = Math.floor(newLinesClearedTotal / 10) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setGameSpeed(calculateGameSpeed(newLevel));
      }

      setTimeout(() => {
        const { board: boardAfterActualClear } = performLineClear(boardWithPiece, clearedIndices);
        setBoard(boardAfterActualClear);
        setAnimatingRows([]);
        spawnNewPiece();
        setCanHold(true);
      }, LINE_CLEAR_ANIMATION_DURATION);
    } else {
      setBoard(boardWithPiece);
      spawnNewPiece();
      setCanHold(true);
    }
  }, [board, linesCleared, level, score, spawnNewPiece, internalGetRandomPiece]); 

  const processMoveDown = useCallback(() => {
    if (!currentPiece || gameState !== "playing" || animatingRows.length > 0) return;

    if (!checkCollision(currentPiece, board, { yOffset: 1 })) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
    } else {
      lockPieceAndSpawnNew(currentPiece);
    }
  }, [currentPiece, board, gameState, lockPieceAndSpawnNew, animatingRows]);

  const holdPiece = useCallback(() => {
    if (!currentPiece || gameState !== "playing" || !canHold || animatingRows.length > 0) return;

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
  }, [currentPiece, heldPiece, gameState, canHold, spawnNewPiece, animatingRows]);


  useEffect(() => {
    if (gameState === "playing" && !isSoftDropping && animatingRows.length === 0) {
      const gameInterval = setInterval(processMoveDown, gameSpeed);
      return () => clearInterval(gameInterval);
    }
  }, [gameState, processMoveDown, gameSpeed, isSoftDropping, animatingRows]);

  useEffect(() => {
    if (currentPiece && gameState === "playing") {
      setGhostPiece(getGhostPieceLogic(currentPiece, board));
    } else {
      setGhostPiece(null);
    }
  }, [currentPiece, board, gameState]);

  const moveLeft = () => {
    if (!currentPiece || gameState !== "playing" || animatingRows.length > 0 || checkCollision(currentPiece, board, { xOffset: -1 })) return;
    setCurrentPiece(prev => prev ? { ...prev, x: prev.x - 1 } : null);
  };

  const moveRight = () => {
    if (!currentPiece || gameState !== "playing" || animatingRows.length > 0 || checkCollision(currentPiece, board, { xOffset: 1 })) return;
    setCurrentPiece(prev => prev ? { ...prev, x: prev.x + 1 } : null);
  };

  const rotatePieceInternal = (direction: 'cw' | 'ccw') => {
    if (!currentPiece || gameState !== "playing" || animatingRows.length > 0) return;
    const rotated = rotatePieceLogic(currentPiece, board, emojiSet, direction);
    setCurrentPiece(rotated);
  };
  
  const softDrop = () => {
    if (!currentPiece || gameState !== "playing" || animatingRows.length > 0) return;
    setIsSoftDropping(true); 
    processMoveDown();
    setTimeout(() => setIsSoftDropping(false), 50); 
  };

  const hardDrop = () => {
    if (!currentPiece || gameState !== "playing" || animatingRows.length > 0) return;
    let finalLandedPiece = { ...currentPiece };
    while (!checkCollision(finalLandedPiece, board, { yOffset: 1 })) {
      finalLandedPiece.y += 1;
    }
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
      board, currentPiece, nextPiece, ghostPiece, heldPiece, canHold, score, level, linesCleared, gameState, emojiSet, isSoftDropping, animatingRows,
      keyboardMappings, gamepadMappings,
      startGame, pauseGame, resumeGame, moveLeft, moveRight, rotatePiece: rotatePieceInternal, softDrop, hardDrop, holdPiece, setEmojiSet, getCurrentGameStateForAI,
      updateKeyboardMapping, updateGamepadMapping, resetControlMappings
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
