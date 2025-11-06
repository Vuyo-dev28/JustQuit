"use client";

import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  onComplete?: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({ onComplete }) => {
  const animationEnd = useRef(Date.now() + (2 * 1000));
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#77B5FE', '#9D7DFE', '#FFFFFF']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#77B5FE', '#9D7DFE', '#FFFFFF']
      });

      if (Date.now() < animationEnd.current) {
        requestAnimationFrame(frame);
      } else {
        if (onComplete) {
            onComplete();
        }
      }
    };

    frame();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [onComplete]);

  return null;
};

export default Confetti;
