
"use client";
import { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, ArrowRight, ArrowDown, Zap, Play, PauseIcon, RotateCwSquare, RotateCw } from "lucide-react";
import { useGameContext } from "@/contexts/GameContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import type { GameAction } from "@/lib/tetris-constants";
import { GP_AXIS_LEFT_HORIZONTAL, GP_AXIS_LEFT_VERTICAL, AXIS_THRESHOLD } from "@/lib/tetris-constants";

export function GameControls() {
  const { 
    gameState, startGame, pauseGame, resumeGame, 
    moveLeft, moveRight, rotatePiece, softDrop, hardDrop, holdPiece, canHold,
    keyboardMappings, gamepadMappings
  } = useGameContext();
  const { t } = useLocalization();

  const prevGamepadButtons = useRef<boolean[]>([]);
  const activeGamepadIndex = useRef<number | null>(null);
  const lastMoveTime = useRef(0);
  const moveRepeatDelay = 120; 
  const initialMoveDelay = 200; 
  const moveActionHeldTime = useRef(0);

  const executeAction = useCallback((action: GameAction) => {
    switch (action) {
      case "moveLeft": moveLeft(); break;
      case "moveRight": moveRight(); break;
      case "softDrop": softDrop(); break;
      case "hardDrop": hardDrop(); break;
      case "rotateCW": rotatePiece('cw'); break;
      case "rotateCCW": rotatePiece('ccw'); break;
      case "holdPiece": if (canHold) holdPiece(); break;
      case "pauseResume":
        if (gameState === "gameOver") startGame();
        else if (gameState === "playing") pauseGame();
        else if (gameState === "paused") resumeGame();
        break;
    }
  }, [gameState, moveLeft, moveRight, softDrop, hardDrop, rotatePiece, holdPiece, canHold, pauseGame, resumeGame, startGame]);

  const getActionForKey = (key: string): GameAction | null => {
    for (const action in keyboardMappings) {
      if (keyboardMappings[action as GameAction] === key) {
        return action as GameAction;
      }
    }
    return null;
  };

  const getActionForGamepadButton = (buttonIndex: number): GameAction | null => {
     for (const action in gamepadMappings) {
      if (gamepadMappings[action as GameAction] === buttonIndex) {
        return action as GameAction;
      }
    }
    return null;
  };

  // Keyboard Input Handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState === "gameOver" && event.key.toLowerCase() !== keyboardMappings.pauseResume) {
        const action = getActionForKey(event.key.toLowerCase());
        if (action === "pauseResume") executeAction(action);
        return;
      }
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      
      const action = getActionForKey(event.key.toLowerCase());
      if (action) {
        if (action === 'hardDrop' || action === 'pauseResume') { 
             event.preventDefault();
        }
        executeAction(action);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, executeAction, keyboardMappings]);

  // Gamepad Connection/Disconnection Handlers
  useEffect(() => {
    const handleGamepadConnected = (event: GamepadEvent) => {
      if (activeGamepadIndex.current === null) {
        activeGamepadIndex.current = event.gamepad.index;
        prevGamepadButtons.current = Array(event.gamepad.buttons.length).fill(false);
      }
    };
    const handleGamepadDisconnected = (event: GamepadEvent) => {
      if (activeGamepadIndex.current === event.gamepad.index) {
        activeGamepadIndex.current = null;
        prevGamepadButtons.current = [];
      }
    };
    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (gp) {
        handleGamepadConnected({ gamepad: gp } as GamepadEvent);
        break; 
      }
    }

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
    };
  }, []);

  // Gamepad Input Loop
  useEffect(() => {
    if (activeGamepadIndex.current === null) return;

    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      if (activeGamepadIndex.current === null) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }
      const gamepad = navigator.getGamepads()[activeGamepadIndex.current];
      if (!gamepad) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const nowButtons = gamepad.buttons.map(b => b.pressed);
      const nowAxes = gamepad.axes;

      const pauseResumeActionGamepad = getActionForGamepadButton(gamepadMappings.pauseResume!);
      if (pauseResumeActionGamepad && gamepadMappings.pauseResume !== undefined && nowButtons[gamepadMappings.pauseResume] && !prevGamepadButtons.current[gamepadMappings.pauseResume]) {
          executeAction(pauseResumeActionGamepad);
      }
      
      if (gameState === "playing") {
        const processMove = (actionType: GameAction) => {
          const currentTime = performance.now();
          if (moveActionHeldTime.current === 0) { 
            executeAction(actionType);
            lastMoveTime.current = currentTime;
            moveActionHeldTime.current = currentTime; 
          } else if (currentTime - moveActionHeldTime.current > initialMoveDelay && currentTime - lastMoveTime.current > moveRepeatDelay) {
            executeAction(actionType);
            lastMoveTime.current = currentTime;
          }
        };
        
        const moveLeftAction = getActionForGamepadButton(gamepadMappings.moveLeft!);
        const moveRightAction = getActionForGamepadButton(gamepadMappings.moveRight!);
        const softDropAction = getActionForGamepadButton(gamepadMappings.softDrop!);

        const dpadLeft = moveLeftAction && gamepadMappings.moveLeft !== undefined && nowButtons[gamepadMappings.moveLeft];
        const dpadRight = moveRightAction && gamepadMappings.moveRight !== undefined && nowButtons[gamepadMappings.moveRight];
        const dpadDown = softDropAction && gamepadMappings.softDrop !== undefined && nowButtons[gamepadMappings.softDrop];
        
        const stickLeft = nowAxes[GP_AXIS_LEFT_HORIZONTAL] < -AXIS_THRESHOLD;
        const stickRight = nowAxes[GP_AXIS_LEFT_HORIZONTAL] > AXIS_THRESHOLD;
        const stickDown = nowAxes[GP_AXIS_LEFT_VERTICAL] > AXIS_THRESHOLD;

        if ((dpadLeft || stickLeft) && moveLeftAction) {
          processMove(moveLeftAction);
        } else if ((dpadRight || stickRight) && moveRightAction) {
          processMove(moveRightAction);
        }

        if ((dpadDown || stickDown) && softDropAction) {
          processMove(softDropAction);
        }
        
        if (!dpadLeft && !stickLeft && !dpadRight && !stickRight && !dpadDown && !stickDown) {
             moveActionHeldTime.current = 0;
        }

        nowButtons.forEach((isPressed, buttonIndex) => {
          if (isPressed && !prevGamepadButtons.current[buttonIndex]) {
            const action = getActionForGamepadButton(buttonIndex);
            if (action && action !== "moveLeft" && action !== "moveRight" && action !== "softDrop" && action !== "pauseResume") {
              executeAction(action);
            }
          }
        });
      } else if (gameState === "gameOver") {
        const pauseResumeAction = getActionForGamepadButton(gamepadMappings.pauseResume!);
        if (pauseResumeAction && gamepadMappings.pauseResume !== undefined && nowButtons[gamepadMappings.pauseResume] && !prevGamepadButtons.current[gamepadMappings.pauseResume]) {
            executeAction(pauseResumeAction);
        }
      }

      prevGamepadButtons.current = nowButtons;
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, executeAction, gamepadMappings]);


  const mainAction = () => {
    executeAction("pauseResume");
  };

  const getMainActionIcon = () => {
    if (gameState === "gameOver") return <Play className="mr-2 h-6 w-6" />;
    if (gameState === "playing") return <PauseIcon className="mr-2 h-6 w-6" />;
    return <Play className="mr-2 h-6 w-6" />;
  };

  const getMainActionText = () => {
    if (gameState === "gameOver") return t("play");
    if (gameState === "playing") return t("pause");
    return t("resume");
  };

  return (
    <div className="space-y-3 mt-4">
      <Button onClick={mainAction} className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
        {getMainActionIcon()}
        {getMainActionText()}
      </Button>
      {gameState !== "gameOver" && (
         <div className="grid grid-cols-3 gap-2">
           <Button variant="outline" onClick={() => executeAction("rotateCW")} disabled={gameState !== 'playing'} aria-label={t("rotateCW")} className="py-5"><RotateCw className="h-6 w-6"/></Button>
           <Button variant="outline" onClick={() => executeAction("rotateCCW")} disabled={gameState !== 'playing'} aria-label={t("rotateCCW")} className="py-5"><RotateCcw className="h-6 w-6"/></Button>
           <Button variant="outline" onClick={() => executeAction("holdPiece")} disabled={!canHold || gameState !== 'playing'} aria-label={t("holdButton")} className="py-5 col-span-1">
             <RotateCwSquare className="mr-1 h-6 w-6"/> {t("holdButton")}
           </Button>
           
           <Button variant="outline" onClick={() => executeAction("moveLeft")} disabled={gameState !== 'playing'} aria-label={t("moveLeft")} className="py-5"><ArrowLeft className="h-6 w-6"/></Button>
           <Button variant="outline" onClick={() => executeAction("hardDrop")} disabled={gameState !== 'playing'} aria-label={t("hardDrop")} className="py-5"><Zap className="h-6 w-6"/></Button>
           <Button variant="outline" onClick={() => executeAction("moveRight")} disabled={gameState !== 'playing'} aria-label={t("moveRight")} className="py-5"><ArrowRight className="h-6 w-6"/></Button>

            <div className="col-start-2 flex justify-center">
                <Button variant="outline" onClick={() => executeAction("softDrop")} disabled={gameState !== 'playing'} aria-label={t("moveDown")} className="py-5 w-full"><ArrowDown className="h-6 w-6"/></Button>
            </div>
         </div>
      )}
    </div>
  );
}
