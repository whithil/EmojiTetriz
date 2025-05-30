
"use client";

import React, { useEffect, useState } from 'react';
// import { cn } from '@/lib/utils'; // Not used in the current version

const NUM_CONFETTI = 50;
// Durations are now controlled by CSS animation and GameContext timeouts.

interface ConfettiPiece {
  id: number;
  style: React.CSSProperties;
  color: string;
}

const colors = [
  'hsl(var(--primary))', 
  'hsl(var(--accent))', 
  '#FFD700', // Gold
  '#FF69B4', // HotPink
  '#00CED1'  // DarkTurquoise
];

export function Confetti({ animationType }: { animationType: 'lineClear' | 'levelUp' }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < NUM_CONFETTI; i++) {
      let initialX = '50vw'; 
      let initialY = '50vh';
      let endX = `${Math.random() * 150 - 75}vw`; 
      let endY = `${Math.random() * 150 - 75}vh`;
      let animationDelay = `${Math.random() * 0.1}s`; 

      if (animationType === 'levelUp') {
        initialX = `${Math.random() * 100}vw`; 
        initialY = '-10vh'; 
        animationDelay = `${Math.random() * 0.4}s`; 
      }
      
      newPieces.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        style: {
          left: initialX,
          top: initialY,
          transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`,
          animationDelay: animationDelay,
          // CSS variables for lineClearConfettiAnimation's end state
          '--confetti-end-x': endX, 
          '--confetti-end-y': endY,
          // CSS variables for lineClearConfettiAnimation's start state, relative to initial left/top
          '--confetti-start-x': '0%', 
          '--confetti-start-y': '0%',
        } as React.CSSProperties,
      });
    }
    setPieces(newPieces);
  }, [animationType]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"> {/* Increased z-index */}
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          data-animation-type={animationType}
          style={{
            ...piece.style,
            backgroundColor: piece.color,
          }}
        />
      ))}
    </div>
  );
}
