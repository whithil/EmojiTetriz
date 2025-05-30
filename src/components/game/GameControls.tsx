
"use client";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Zap, Play, PauseIcon, RotateCwSquare, RotateCw } from "lucide-react";
import { useGameContext } from "@/contexts/GameContext";
import { useLocalization } from "@/contexts/LocalizationContext";

// Standard Gamepad Button Mappings (indices)
const GP_BUTTON_A_CROSS = 0; // Rotate Piece CW
const GP_BUTTON_B_CIRCLE = 1; // Rotate Piece CCW
// const GP_BUTTON_X_SQUARE = 2; // Was Hard Drop, now unused for primary action
const GP_BUTTON_Y_TRIANGLE = 3; // Hold Piece
// const GP_BUTTON_L1_LB = 4;
// const GP_BUTTON_R1_RB = 5;
// const GP_BUTTON_L2_LT = 6;
// const GP_BUTTON_R2_RT = 7;
// const GP_BUTTON_SELECT_BACK = 8;
const GP_BUTTON_START_OPTIONS = 9; // Pause/Resume/Start
// const GP_BUTTON_L3_STICK = 10;
// const GP_BUTTON_R3_STICK = 11;
const GP_DPAD_UP = 12; // Hard Drop
const GP_DPAD_DOWN = 13; // Soft Drop
const GP_DPAD_LEFT = 14; // Move Left
const GP_DPAD_RIGHT = 15; // Move Right

// Analog Stick Axes
const GP_AXIS_LEFT_HORIZONTAL = 0;
const GP_AXIS_LEFT_VERTICAL = 1;
const AXIS_THRESHOLD = 0.5; // Minimum deflection to register as input

export function GameControls() {
  const { 
    gameState, startGame, pauseGame, resumeGame, 
    moveLeft, moveRight, rotatePiece, softDrop, hardDrop, holdPiece, canHold
  } = useGameContext();
  const { t } = useLocalization();

  const prevGamepadButtons = useRef<boolean[]>([]);
  const activeGamepadIndex = useRef<number | null>(null);
  const lastMoveTime = useRef(0);
  const moveRepeatDelay = 120; // ms, how fast piece moves when holding direction
  const initialMoveDelay = 200; // ms, delay before repeat starts
  const moveActionHeldTime = useRef(0);


  // Keyboard Input Handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState === "gameOver" || (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) return;

      switch (event.key.toLowerCase()) {
        case "arrowleft": moveLeft(); break;
        case "arrowright": moveRight(); break;
        case "arrowdown": softDrop(); break;
        case "arrowup": rotatePiece('cw'); break;
        case "z": rotatePiece('ccw'); break; 
        case " ": event.preventDefault(); hardDrop(); break;
        case "p":
          if (gameState === "playing") pauseGame();
          else if (gameState === "paused") resumeGame();
          break;
        case "c": if (gameState === "playing") holdPiece(); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, moveLeft, moveRight, rotatePiece, softDrop, hardDrop, pauseGame, resumeGame, holdPiece]);

  // Gamepad Connection/Disconnection Handlers
  useEffect(() => {
    const handleGamepadConnected = (event: GamepadEvent) => {
      console.log("Gamepad connected:", event.gamepad.id, "at index", event.gamepad.index);
      if (activeGamepadIndex.current === null) {
        activeGamepadIndex.current = event.gamepad.index;
        prevGamepadButtons.current = Array(event.gamepad.buttons.length).fill(false);
      }
    };
    const handleGamepadDisconnected = (event: GamepadEvent) => {
      console.log("Gamepad disconnected:", event.gamepad.id);
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
      if (activeGamepadIndex.current === null) return;
      const gamepad = navigator.getGamepads()[activeGamepadIndex.current];
      if (!gamepad) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const nowButtons = gamepad.buttons.map(b => b.pressed);
      const nowAxes = gamepad.axes;

      if (nowButtons[GP_BUTTON_START_OPTIONS] && !prevGamepadButtons.current[GP_BUTTON_START_OPTIONS]) {
        if (gameState === "gameOver") startGame();
        else if (gameState === "playing") pauseGame();
        else if (gameState === "paused") resumeGame();
      }
      
      if (gameState === "playing") {
        const processMove = (action: () => void) => {
          const currentTime = performance.now();
          if (moveActionHeldTime.current === 0) { 
            action();
            lastMoveTime.current = currentTime;
            moveActionHeldTime.current = currentTime; 
          } else if (currentTime - moveActionHeldTime.current > initialMoveDelay && currentTime - lastMoveTime.current > moveRepeatDelay) {
            action();
            lastMoveTime.current = currentTime;
          }
        };
        
        const dpadLeft = nowButtons[GP_DPAD_LEFT];
        const dpadRight = nowButtons[GP_DPAD_RIGHT];
        const dpadDown = nowButtons[GP_DPAD_DOWN];
        const stickLeft = nowAxes[GP_AXIS_LEFT_HORIZONTAL] < -AXIS_THRESHOLD;
        const stickRight = nowAxes[GP_AXIS_LEFT_HORIZONTAL] > AXIS_THRESHOLD;
        const stickDown = nowAxes[GP_AXIS_LEFT_VERTICAL] > AXIS_THRESHOLD;

        if (dpadLeft || stickLeft) {
          processMove(moveLeft);
        } else if (dpadRight || stickRight) {
          processMove(moveRight);
        }

        if (dpadDown || stickDown) {
          processMove(softDrop);
        }
        
        if (!dpadLeft && !stickLeft && !dpadRight && !stickRight && !dpadDown && !stickDown) {
             moveActionHeldTime.current = 0;
        }

        // Single Press Actions
        if (nowButtons[GP_DPAD_UP] && !prevGamepadButtons.current[GP_DPAD_UP]) { // D-Pad Up for Hard Drop
            hardDrop();
        }
        if (nowButtons[GP_BUTTON_A_CROSS] && !prevGamepadButtons.current[GP_BUTTON_A_CROSS]) { 
          rotatePiece('cw');
        }
        if (nowButtons[GP_BUTTON_B_CIRCLE] && !prevGamepadButtons.current[GP_BUTTON_B_CIRCLE]) { 
          rotatePiece('ccw');
        }
        // if (nowButtons[GP_BUTTON_X_SQUARE] && !prevGamepadButtons.current[GP_BUTTON_X_SQUARE]) { 
          // GP_BUTTON_X_SQUARE is now unassigned for a primary action
        // }
        if (nowButtons[GP_BUTTON_Y_TRIANGLE] && !prevGamepadButtons.current[GP_BUTTON_Y_TRIANGLE]) {
          if (canHold) holdPiece();
        }
      }

      prevGamepadButtons.current = nowButtons;
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, startGame, pauseGame, resumeGame, moveLeft, moveRight, rotatePiece, softDrop, hardDrop, holdPiece, canHold]);


  const mainAction = () => {
    if (gameState === "gameOver") startGame();
    else if (gameState === "playing") pauseGame();
    else if (gameState === "paused") resumeGame();
  };

  const getMainActionIcon = () => {
    if (gameState === "gameOver") return <Play className="mr-2 h-5 w-5" />;
    if (gameState === "playing") return <PauseIcon className="mr-2 h-5 w-5" />;
    return <Play className="mr-2 h-5 w-5" />;
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
            {/* Row 1 */}
           <Button variant="outline" onClick={() => rotatePiece('cw')} disabled={gameState !== 'playing'} aria-label={t("rotateCW")} className="py-4"><RotateCw /></Button>
           <Button variant="outline" onClick={() => rotatePiece('ccw')} disabled={gameState !== 'playing'} aria-label={t("rotateCCW")} className="py-4"><RotateCcw /></Button>
           <Button variant="outline" onClick={holdPiece} disabled={!canHold || gameState !== 'playing'} aria-label={t("holdButton")} className="py-4 col-span-1">
             <RotateCwSquare className="mr-1 h-5 w-5"/> {t("holdButton")}
           </Button>
           
            {/* Row 2 */}
           <Button variant="outline" onClick={moveLeft} disabled={gameState !== 'playing'} aria-label={t("moveLeft")} className="py-4"><ArrowLeft /></Button>
           <Button variant="outline" onClick={hardDrop} disabled={gameState !== 'playing'} aria-label={t("hardDrop")} className="py-4"><Zap/></Button>
           <Button variant="outline" onClick={moveRight} disabled={gameState !== 'playing'} aria-label={t("moveRight")} className="py-4"><ArrowRight /></Button>

            {/* Row 3 - Soft drop centered */}
            <div className="col-start-2 flex justify-center">
                <Button variant="outline" onClick={softDrop} disabled={gameState !== 'playing'} aria-label={t("moveDown")} className="py-4 w-full"><ArrowDown /></Button>
            </div>
         </div>
      )}
    </div>
  );
}
