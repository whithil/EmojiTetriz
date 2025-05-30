
"use client";
import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Board, CurrentPiece, EmojiSet, GameState, TetrominoType, KeyboardMapping, GamepadMapping, GameAction, CustomMinoData } from "@/lib/tetris-constants";
import {
  createEmptyBoard,
  getRandomPieceLogic,
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
  TETROMINOES,
  TETROMINO_TYPES,
  DEFAULT_KEYBOARD_MAPPINGS,
  DEFAULT_GAMEPAD_MAPPINGS,
  GAME_ACTIONS,
  INITIAL_CUSTOM_MINOES_DATA,
} from "@/lib/tetris-constants";
import { useLocalization } from "./LocalizationContext";
import { useToast } from "@/hooks/use-toast";

const LINE_CLEAR_ANIMATION_DURATION = 300; // ms
const LEVEL_UP_CONFETTI_DURATION = 1500; // ms, should match Confetti.tsx
const LINE_CLEAR_CONFETTI_EFFECT_DURATION = 800; // ms for line clear burst

const LOCAL_STORAGE_KEYBOARD_MAPPINGS_KEY = "tetrisKeyboardMappings";
const LOCAL_STORAGE_GAMEPAD_MAPPINGS_KEY = "tetrisGamepadMappings";
const LOCAL_STORAGE_EMOJI_SET_KEY = "emojiSet";
const LOCAL_STORAGE_CONFETTI_LINE_CLEAR_ENABLED_KEY = "confettiLineClearEnabled";
const LOCAL_STORAGE_CONFETTI_LEVEL_UP_ENABLED_KEY = "confettiLevelUpEnabled";
const LOCAL_STORAGE_CUSTOM_MINOES_ENABLED_KEY = "customMinoesEnabled";
const LOCAL_STORAGE_CUSTOM_MINOES_DATA_KEY = "customMinoesData";


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

  confettiOnLineClearEnabled: boolean;
  setConfettiOnLineClearEnabled: (enabled: boolean) => void;
  showLineClearConfetti: boolean;

  confettiOnLevelUpEnabled: boolean;
  setConfettiOnLevelUpEnabled: (enabled: boolean) => void;
  showLevelUpConfetti: boolean;

  customMinoesEnabled: boolean;
  setCustomMinoesEnabled: (enabled: boolean) => void;
  customMinoesData: CustomMinoData[];
  addCustomMino: (minoData: Omit<CustomMinoData, 'id'>) => void;
  removeCustomMino: (id: string) => void;

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
  const [pieceBag, setPieceBag] = useState<Array<TetrominoType | string>>([]);
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

  const [confettiOnLineClearEnabledInternal, setConfettiOnLineClearEnabledInternalState] = useState<boolean>(false);
  const [showLineClearConfetti, setShowLineClearConfetti] = useState<boolean>(false);
  const [confettiOnLevelUpEnabledInternal, setConfettiOnLevelUpEnabledInternalState] = useState<boolean>(false);
  const [showLevelUpConfetti, setShowLevelUpConfetti] = useState<boolean>(false);

  const [customMinoesEnabledInternal, setCustomMinoesEnabledInternalState] = useState<boolean>(false);
  const [customMinoesDataInternal, setCustomMinoesDataInternal] = useState<CustomMinoData[]>(INITIAL_CUSTOM_MINOES_DATA);

  const { t } = useLocalization();
  const { toast } = useToast();

  useEffect(() => {
    const loadFromLocalStorage = <T,>(key: string, defaultValue: T, parser?: (val: string) => T): T => {
      if (typeof window === 'undefined') return defaultValue;
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        try {
          return parser ? parser(storedValue) : JSON.parse(storedValue) as T;
        } catch (e) {
          console.error(`Failed to parse ${key} from localStorage`, e);
          return defaultValue;
        }
      }
      return defaultValue;
    };

    setKeyboardMappingsInternal(loadFromLocalStorage(LOCAL_STORAGE_KEYBOARD_MAPPINGS_KEY, DEFAULT_KEYBOARD_MAPPINGS));
    setGamepadMappingsInternal(loadFromLocalStorage(LOCAL_STORAGE_GAMEPAD_MAPPINGS_KEY, DEFAULT_GAMEPAD_MAPPINGS));

    const parsedEmojiSet = loadFromLocalStorage<EmojiSet>(LOCAL_STORAGE_EMOJI_SET_KEY, DEFAULT_EMOJI_SET, (val) => {
        const parsed = JSON.parse(val) as EmojiSet;
        let valid = true;
        for(const type of TETROMINO_TYPES) { if(!parsed[type]) { valid = false; break; }}
        return valid ? parsed : DEFAULT_EMOJI_SET;
    });
    setEmojiSetState(parsedEmojiSet);

    setConfettiOnLineClearEnabledInternalState(loadFromLocalStorage(LOCAL_STORAGE_CONFETTI_LINE_CLEAR_ENABLED_KEY, false));
    setConfettiOnLevelUpEnabledInternalState(loadFromLocalStorage(LOCAL_STORAGE_CONFETTI_LEVEL_UP_ENABLED_KEY, false));
    setCustomMinoesEnabledInternalState(loadFromLocalStorage(LOCAL_STORAGE_CUSTOM_MINOES_ENABLED_KEY, false));
    
    let loadedCustomMinoes = loadFromLocalStorage<CustomMinoData[]>(
      LOCAL_STORAGE_CUSTOM_MINOES_DATA_KEY,
      INITIAL_CUSTOM_MINOES_DATA
    );

    if (loadedCustomMinoes.length === 0) {
      const defaultJorgeMino: CustomMinoData = {
        id: "default-jorge-mino",
        name: "Jorge",
        emoji: "🈂️",
        shape: [
          [0,0,0,1],
          [0,0,0,1],
          [0,1,0,1],
          [0,1,1,1]
        ]
      };
      loadedCustomMinoes = [defaultJorgeMino];
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_MINOES_DATA_KEY, JSON.stringify(loadedCustomMinoes));
      }
    }
    setCustomMinoesDataInternal(loadedCustomMinoes);

  }, []);

  const updateKeyboardMapping = useCallback((action: GameAction, newKey: string) => {
    setKeyboardMappingsInternal(prev => {
      const newMappings = { ...prev, [action]: newKey.toLowerCase() };
      GAME_ACTIONS.forEach(act => {
        if (act !== action && newMappings[act] === newKey.toLowerCase()) {
          delete newMappings[act];
        }
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEYBOARD_MAPPINGS_KEY, JSON.stringify(newMappings));
      }
      return newMappings;
    });
  }, []);

  const updateGamepadMapping = useCallback((action: GameAction, newButtonIndex: number) => {
    setGamepadMappingsInternal(prev => {
      const newMappings = { ...prev, [action]: newButtonIndex };
      GAME_ACTIONS.forEach(act => {
        if (act !== action && newMappings[act] === newButtonIndex) {
           delete newMappings[act];
        }
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_GAMEPAD_MAPPINGS_KEY, JSON.stringify(newMappings));
      }
      return newMappings;
    });
  }, []);

  const resetControlMappings = useCallback(() => {
    setKeyboardMappingsInternal(DEFAULT_KEYBOARD_MAPPINGS);
    setGamepadMappingsInternal(DEFAULT_GAMEPAD_MAPPINGS);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYBOARD_MAPPINGS_KEY, JSON.stringify(DEFAULT_KEYBOARD_MAPPINGS));
      localStorage.setItem(LOCAL_STORAGE_GAMEPAD_MAPPINGS_KEY, JSON.stringify(DEFAULT_GAMEPAD_MAPPINGS));
    }
  }, []);


  const setEmojiSet = useCallback((newEmojiSet: EmojiSet) => {
    setEmojiSetState(newEmojiSet);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_EMOJI_SET_KEY, JSON.stringify(newEmojiSet));
    }
  }, []);

  const setConfettiOnLineClearEnabled = useCallback((enabled: boolean) => {
    setConfettiOnLineClearEnabledInternalState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_CONFETTI_LINE_CLEAR_ENABLED_KEY, JSON.stringify(enabled));
    }
  }, []);

  const setConfettiOnLevelUpEnabled = useCallback((enabled: boolean) => {
    setConfettiOnLevelUpEnabledInternalState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_CONFETTI_LEVEL_UP_ENABLED_KEY, JSON.stringify(enabled));
    }
  }, []);

  const setCustomMinoesEnabled = useCallback((enabled: boolean) => {
    setCustomMinoesEnabledInternalState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_MINOES_ENABLED_KEY, JSON.stringify(enabled));
    }
  }, []);

  const addCustomMino = useCallback((minoData: Omit<CustomMinoData, 'id'>) => {
    setCustomMinoesDataInternal(prev => {
      const newMino = { ...minoData, id: Date.now().toString() }; 
      const newData = [...prev, newMino];
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_MINOES_DATA_KEY, JSON.stringify(newData));
      }
      toast({ title: t("customMinoAdded"), description: t("customMinoAddedDesc", { name: newMino.name }) });
      return newData;
    });
  }, [t, toast]);

  const removeCustomMino = useCallback((id: string) => {
    setCustomMinoesDataInternal(prev => {
      const minoToRemove = prev.find(m => m.id === id);
      const newData = prev.filter(mino => mino.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_MINOES_DATA_KEY, JSON.stringify(newData));
      }
      setPieceBag(currentBag => currentBag.filter(bagItemId => bagItemId !== id)); 
      if (minoToRemove) {
        toast({ title: t("customMinoRemoved"), description: t("customMinoRemovedDesc", { name: minoToRemove.name }), variant: "destructive" });
      }
      return newData;
    });
  }, [t, toast]);

  const internalGetRandomPiece = useCallback(() => {
    return getRandomPieceLogic(emojiSet, pieceBag, customMinoesDataInternal, customMinoesEnabledInternal);
  }, [emojiSet, pieceBag, customMinoesDataInternal, customMinoesEnabledInternal]);

  const spawnNewPiece = useCallback((pieceToSpawnInsteadOfNext?: CurrentPiece) => {
    const pieceForCurrent = pieceToSpawnInsteadOfNext || nextPiece;
    const { piece: newNextPieceVal, newBag } = internalGetRandomPiece();

    setPieceBag(newBag);
    setNextPiece(newNextPieceVal);

    if (pieceForCurrent) {
      const positionedPiece: CurrentPiece = {
        ...pieceForCurrent,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor((pieceForCurrent.shape[0]?.length || 1) / 2),
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
         x: Math.floor(BOARD_WIDTH / 2) - Math.floor((firstPiece.shape[0]?.length || 1) / 2),
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
    setShowLineClearConfetti(false);
    setShowLevelUpConfetti(false);

    setHeldPiece(null);
    setCanHold(true);
    
    const initialBagForGameStart: Array<TetrominoType | string> = [];
    const { piece: firstPieceVal, newBag: bagAfterFirst } = getRandomPieceLogic(emojiSet, initialBagForGameStart, customMinoesDataInternal, customMinoesEnabledInternal);
    const { piece: secondPieceVal, newBag: bagAfterSecond } = getRandomPieceLogic(emojiSet, bagAfterFirst, customMinoesDataInternal, customMinoesEnabledInternal);

    const positionedFirstPiece: CurrentPiece = {
        ...firstPieceVal,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor((firstPieceVal.shape[0]?.length || 1) / 2),
        y: 0,
    };
    setCurrentPiece(positionedFirstPiece);
    setNextPiece(secondPieceVal);
    setPieceBag(bagAfterSecond);

  }, [emojiSet, customMinoesDataInternal, customMinoesEnabledInternal]);

  const lockPieceAndSpawnNew = useCallback((pieceToLock: CurrentPiece) => {
    const boardWithPiece = mergePieceToBoard(pieceToLock, board);
    const clearedIndices = getClearedRowIndices(boardWithPiece);

    if (clearedIndices.length > 0) {
      setBoard(boardWithPiece);
      setAnimatingRows(clearedIndices);

      if (confettiOnLineClearEnabledInternal) {
        setShowLineClearConfetti(true);
        setTimeout(() => setShowLineClearConfetti(false), LINE_CLEAR_CONFETTI_EFFECT_DURATION);
      }

      const numLinesCleared = clearedIndices.length;
      const newLinesClearedTotal = linesCleared + numLinesCleared;
      setLinesCleared(newLinesClearedTotal);
      let lineScore = 0;
      let toastMessageKey: keyof Translations | null = null;

      if (numLinesCleared === 1) { lineScore = 40; toastMessageKey = "toastLineClearSingle"; }
      else if (numLinesCleared === 2) { lineScore = 100; toastMessageKey = "toastLineClearDouble"; }
      else if (numLinesCleared === 3) { lineScore = 300; toastMessageKey = "toastLineClearTriple"; }
      else if (numLinesCleared >= 4) { lineScore = 1200; toastMessageKey = "toastLineClearTetris"; }

      if (toastMessageKey && t) {
        toast({ title: t(toastMessageKey) });
      }
      setScore(prev => prev + lineScore * level);

      const newLevel = Math.floor(newLinesClearedTotal / 10) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setGameSpeed(calculateGameSpeed(newLevel));
        if (confettiOnLevelUpEnabledInternal) {
          setShowLevelUpConfetti(true);
          setTimeout(() => setShowLevelUpConfetti(false), LEVEL_UP_CONFETTI_DURATION);
        }
        if (t) {
          toast({ title: t("toastLevelUp", { levelNumber: newLevel.toString() }) });
        }
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
  }, [board, linesCleared, level, confettiOnLineClearEnabledInternal, confettiOnLevelUpEnabledInternal, t, toast, spawnNewPiece]);

  const processMoveDown = useCallback(() => {
    if (!currentPiece || gameState !== "playing" || animatingRows.length > 0 || showLineClearConfetti || showLevelUpConfetti) return;

    if (!checkCollision(currentPiece, board, { yOffset: 1 })) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
    } else {
      lockPieceAndSpawnNew(currentPiece);
    }
  }, [currentPiece, board, gameState, lockPieceAndSpawnNew, animatingRows, showLineClearConfetti, showLevelUpConfetti]);

 const holdPiece = useCallback(() => {
    if (!currentPiece || gameState !== "playing" || !canHold || animatingRows.length > 0) return;

    let shapeForHold: number[][];
    let typeForHold: TetrominoType | "custom" = currentPiece.type;
    let idForHold: string | undefined = currentPiece.id;
    let emojiForHold: string = currentPiece.emoji;

    if (currentPiece.type !== "custom") {
      shapeForHold = TETROMINOES[currentPiece.type].shapes[0]; 
      emojiForHold = emojiSet[currentPiece.type] || TETROMINOES[currentPiece.type].emoji;
    } else {
      const customMinoDefinition = customMinoesDataInternal.find(m => m.id === currentPiece.id);
      if (customMinoDefinition) {
        shapeForHold = customMinoDefinition.shape;
        emojiForHold = customMinoDefinition.emoji;
      } else {
        shapeForHold = currentPiece.shape; 
        emojiForHold = currentPiece.emoji;
        console.warn(`Custom mino definition not found for ID ${currentPiece.id} during hold. Using current shape.`);
      }
    }

    const pieceToStoreInHold: CurrentPiece = {
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor((shapeForHold[0]?.length || 1) / 2),
        y: 0,
        rotation: 0, 
        shape: shapeForHold,
        emoji: emojiForHold,
        type: typeForHold,
        id: idForHold,
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
  }, [currentPiece, heldPiece, gameState, canHold, spawnNewPiece, animatingRows, board, emojiSet, customMinoesDataInternal, TETROMINOES]); 


  useEffect(() => {
    if (gameState === "playing" && !isSoftDropping && animatingRows.length === 0 && !showLineClearConfetti && !showLevelUpConfetti) {
      const gameInterval = setInterval(processMoveDown, gameSpeed);
      return () => clearInterval(gameInterval);
    }
  }, [gameState, processMoveDown, gameSpeed, isSoftDropping, animatingRows, showLineClearConfetti, showLevelUpConfetti]);

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
    const rotated = rotatePieceLogic(currentPiece, board, emojiSet, direction, customMinoesDataInternal);
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
      confettiOnLineClearEnabled: confettiOnLineClearEnabledInternal, setConfettiOnLineClearEnabled, showLineClearConfetti,
      confettiOnLevelUpEnabled: confettiOnLevelUpEnabledInternal, setConfettiOnLevelUpEnabled, showLevelUpConfetti,
      customMinoesEnabled: customMinoesEnabledInternal, setCustomMinoesEnabled,
      customMinoesData: customMinoesDataInternal, addCustomMino, removeCustomMino,
      startGame, pauseGame, resumeGame, moveLeft, moveRight, rotatePiece: rotatePieceInternal, softDrop, hardDrop, holdPiece,
      setEmojiSet,
      getCurrentGameStateForAI,
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

export type Translations = typeof import("@/locales/en-US.json");
declare module "./LocalizationContext" {
  interface LocalizationContextType {
    t_type: Translations;
    t: (key: keyof Translations, params?: Record<string, string | number>) => string;
  }
}
    
