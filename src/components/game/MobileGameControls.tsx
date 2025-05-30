
"use client";

import React, { useRef, useCallback } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { PauseIcon, PlayIcon, DownloadCloudIcon } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';

const TAP_DURATION_THRESHOLD = 300; // Max ms to count as a tap
const TAP_MOVE_THRESHOLD = 20;    // Max pixels moved to count as a tap
const HORIZONTAL_PIXELS_PER_MOVE = 40; // Pixels of horizontal drag for one piece move
const VERTICAL_PIXELS_PER_SOFT_DROP = 30; // Pixels of vertical drag for one soft drop

export function MobileGameControls() {
  const { 
    gameState, pauseGame, resumeGame, 
    moveLeft, moveRight, rotatePiece, softDrop, hardDrop, holdPiece, canHold
  } = useGameContext();
  const { t } = useLocalization();

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const gameBoardTouchAreaRef = useRef<HTMLDivElement>(null); 
  const accumulatedHorizontalDragRef = useRef<number>(0);
  const accumulatedVerticalDragRef = useRef<number>(0);
  const lastProcessedTouchXRef = useRef<number | null>(null);
  const lastProcessedTouchYRef = useRef<number | null>(null);
  const gestureIntentRef = useRef<'horizontal' | 'vertical' | 'tap' | null>(null);


  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (gameState !== 'playing' || e.touches.length === 0) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    accumulatedHorizontalDragRef.current = 0;
    accumulatedVerticalDragRef.current = 0;
    lastProcessedTouchXRef.current = touch.clientX;
    lastProcessedTouchYRef.current = touch.clientY;
    gestureIntentRef.current = null; 
  }, [gameState]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (gameState !== 'playing' || !touchStartRef.current || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;

    const overallDeltaX = currentX - touchStartRef.current.x;
    const overallDeltaY = currentY - touchStartRef.current.y;

    // Gesture disambiguation: Determine intent early if not already set
    if (!gestureIntentRef.current) {
      if (Math.abs(overallDeltaX) > TAP_MOVE_THRESHOLD || Math.abs(overallDeltaY) > TAP_MOVE_THRESHOLD) {
        if (Math.abs(overallDeltaX) > Math.abs(overallDeltaY) * 1.2) { 
          gestureIntentRef.current = 'horizontal';
        } else if (Math.abs(overallDeltaY) > Math.abs(overallDeltaX) * 1.2) { 
          gestureIntentRef.current = 'vertical';
        }
      }
    }
    
    if (gestureIntentRef.current === 'horizontal' && lastProcessedTouchXRef.current) {
        const moveDeltaX = currentX - lastProcessedTouchXRef.current;
        accumulatedHorizontalDragRef.current += moveDeltaX;

        while (accumulatedHorizontalDragRef.current >= HORIZONTAL_PIXELS_PER_MOVE) {
            moveRight();
            accumulatedHorizontalDragRef.current -= HORIZONTAL_PIXELS_PER_MOVE;
        }
        while (accumulatedHorizontalDragRef.current <= -HORIZONTAL_PIXELS_PER_MOVE) {
            moveLeft();
            accumulatedHorizontalDragRef.current += HORIZONTAL_PIXELS_PER_MOVE;
        }
    } else if (gestureIntentRef.current === 'vertical' && lastProcessedTouchYRef.current) {
        const moveDeltaY = currentY - lastProcessedTouchYRef.current;
        if (moveDeltaY > 0) { // Only accumulate for downward drag
            accumulatedVerticalDragRef.current += moveDeltaY;
            while (accumulatedVerticalDragRef.current >= VERTICAL_PIXELS_PER_SOFT_DROP) {
                softDrop();
                accumulatedVerticalDragRef.current -= VERTICAL_PIXELS_PER_SOFT_DROP;
            }
        }
    }
    lastProcessedTouchXRef.current = currentX;
    lastProcessedTouchYRef.current = currentY;

  }, [gameState, moveLeft, moveRight, softDrop]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (gameState !== 'playing' || !touchStartRef.current || e.changedTouches.length === 0) return;

    const touch = e.changedTouches[0];
    const { x: startX, y: startY, time: startTime } = touchStartRef.current;
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const duration = endTime - startTime;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (gestureIntentRef.current === 'vertical') {
        if (deltaY < -TAP_MOVE_THRESHOLD * 2) { 
          hardDrop();
        } else if (deltaY > TAP_MOVE_THRESHOLD * 2 && accumulatedVerticalDragRef.current < VERTICAL_PIXELS_PER_SOFT_DROP) {
          // If it was a clear vertical swipe down, but not enough accumulated for continuous,
          // treat it as a single soft drop.
          softDrop();
        }
    } else if (gestureIntentRef.current !== 'horizontal') { 
      if (duration < TAP_DURATION_THRESHOLD && absDeltaX < TAP_MOVE_THRESHOLD && absDeltaY < TAP_MOVE_THRESHOLD) {
        const boardRect = gameBoardTouchAreaRef.current?.getBoundingClientRect();
        if (boardRect) {
          const tapXRelativeToBoard = endX - boardRect.left;
          if (tapXRelativeToBoard < boardRect.width / 2) {
            rotatePiece('ccw'); 
          } else {
            rotatePiece('cw'); 
          }
        }
      }
    }
    
    touchStartRef.current = null;
    lastProcessedTouchXRef.current = null;
    lastProcessedTouchYRef.current = null;
    accumulatedHorizontalDragRef.current = 0;
    accumulatedVerticalDragRef.current = 0;
    gestureIntentRef.current = null;

  }, [gameState, hardDrop, softDrop, rotatePiece]);
  
  const handleMainAction = () => {
    if (gameState === "playing") pauseGame();
    else if (gameState === "paused") resumeGame();
  };

  const handleHoldAction = () => {
    if (canHold && gameState === 'playing') {
      holdPiece();
    }
  };

  return (
    <>
      <div 
        ref={gameBoardTouchAreaRef}
        className="absolute inset-0 z-20"
        style={{ touchAction: 'none' }} 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}
      />

      <div className="absolute top-3 right-3 z-30">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMainAction}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full w-14 h-14 shadow-xl"
          aria-label={gameState === 'playing' ? t('pause') : t('resume')}
        >
          {gameState === 'playing' ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7" />}
        </Button>
      </div>

      <div className="absolute top-3 left-3 z-30">
         <Button
          variant="ghost"
          size="icon"
          onClick={handleHoldAction}
          disabled={!canHold || gameState !== 'playing'}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full w-14 h-14 shadow-xl disabled:opacity-60"
          aria-label={t('holdButton')}
        >
          <DownloadCloudIcon className="w-7 h-7" />
        </Button>
      </div>
    </>
  );
}
