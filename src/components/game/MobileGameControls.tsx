
"use client";

import React, { useRef, useCallback } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { PauseIcon, PlayIcon, DownloadCloudIcon } from 'lucide-react'; // DownloadCloudIcon for Hold
import { useLocalization } from '@/contexts/LocalizationContext';

const DRAG_THRESHOLD_X = 50; // Min horizontal pixels to count as a drag for L/R move
const DRAG_THRESHOLD_Y_SOFT = 50; // Min vertical pixels (down) for soft drop
const DRAG_THRESHOLD_Y_HARD = -50; // Min vertical pixels (up) for hard drop (negative deltaY)
const TAP_DURATION_THRESHOLD = 300; // Max ms to count as a tap
const TAP_MOVE_THRESHOLD = 20; // Max pixels moved to count as a tap

export function MobileGameControls() {
  const { 
    gameState, pauseGame, resumeGame, 
    moveLeft, moveRight, rotatePiece, softDrop, hardDrop, holdPiece, canHold
  } = useGameContext();
  const { t } = useLocalization();

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const gameBoardTouchAreaRef = useRef<HTMLDivElement>(null); 

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (gameState !== 'playing' || e.touches.length === 0) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, [gameState]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (gameState !== 'playing' || !touchStartRef.current || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // If vertical movement is more significant than horizontal, prevent default scroll
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      e.preventDefault();
    }
  }, [gameState, touchStartRef]);

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

    // Check for Tap first
    if (duration < TAP_DURATION_THRESHOLD && absDeltaX < TAP_MOVE_THRESHOLD && absDeltaY < TAP_MOVE_THRESHOLD) {
      // It's a tap
      const boardRect = gameBoardTouchAreaRef.current?.getBoundingClientRect();
      if (boardRect) {
        const tapXRelativeToBoard = endX - boardRect.left;
        if (tapXRelativeToBoard < boardRect.width / 2) {
          rotatePiece('ccw'); // Tap left side
        } else {
          rotatePiece('cw'); // Tap right side
        }
      }
    } else {
      // It's a drag/swipe
      if (absDeltaY > absDeltaX) { // Prioritize vertical swipe
        if (deltaY < DRAG_THRESHOLD_Y_HARD) { // Swipe Up
          hardDrop();
        } else if (deltaY > DRAG_THRESHOLD_Y_SOFT) { // Swipe Down
          softDrop();
        }
      } else if (absDeltaX > DRAG_THRESHOLD_X) { // Horizontal swipe
        if (deltaX < -DRAG_THRESHOLD_X) { // Swipe Left
          moveLeft();
        } else if (deltaX > DRAG_THRESHOLD_X) { // Swipe Right
          moveRight();
        }
      }
    }
    touchStartRef.current = null;
  }, [gameState, moveLeft, moveRight, softDrop, hardDrop, rotatePiece]);
  
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
      {/* Touch Overlay for gestures - Covers the game board area */}
      <div 
        ref={gameBoardTouchAreaRef}
        className="absolute inset-0 z-20" 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}
      />

      {/* Floating Buttons */}
      <div className="absolute top-3 right-3 z-30"> {/* Increased distance from edge */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMainAction}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full w-14 h-14 shadow-xl" // Larger, more contrast
          aria-label={gameState === 'playing' ? t('pause') : t('resume')}
        >
          {gameState === 'playing' ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7" />}
        </Button>
      </div>

      <div className="absolute top-3 left-3 z-30"> {/* Increased distance from edge */}
         <Button
          variant="ghost"
          size="icon"
          onClick={handleHoldAction}
          disabled={!canHold || gameState !== 'playing'}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full w-14 h-14 shadow-xl disabled:opacity-60" // Larger, more contrast
          aria-label={t('holdButton')}
        >
          <DownloadCloudIcon className="w-7 h-7" /> {/* Using DownloadCloud as a "store" icon */}
        </Button>
      </div>
    </>
  );
}

