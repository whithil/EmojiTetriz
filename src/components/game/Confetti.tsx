
"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const NUM_CONFETTI = 50; // Number of confetti pieces
const CONFETTI_DURATION = 1500; // ms, should match GameContext

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

export function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < NUM_CONFETTI; i++) {
      const angle = Math.random() * 360; // Angle for initial spread
      const distance = Math.random() * 40 + 20; // Distance from center (vw/vh)
      const initialX = 50 + distance * Math.cos(angle * Math.PI / 180);
      const initialY = 50 + distance * Math.sin(angle * Math.PI / 180);
      
      newPieces.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        style: {
          left: `${initialX}vw`,
          top: `${initialY}vh`,
          transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`,
          animationDelay: `${Math.random() * 0.2}s`, // Stagger start
        },
      });
    }
    setPieces(newPieces);

    // No need to clear pieces here, as the parent component controls visibility.
  }, []); // Trigger once on mount

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            ...piece.style,
            backgroundColor: piece.color,
          }}
        />
      ))}
    </div>
  );
}

    