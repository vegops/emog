import React, { useMemo } from 'react';
import { motion, transform } from 'framer-motion';

const AnimatedBackground = () => {
  const circles = useMemo(() =>
    [...Array(6)].map((_, i) => {
      const rand = () => Math.floor(Math.random() * 255);
      return {
        key: i,
        r: 8 + Math.random() * 10, // מותאם ל־viewBox קטן
        fill: `rgba(${rand()}, ${rand()}, ${rand()}, 0.15)`,
        cx: Math.random() * 100,
        cy: Math.random() * 100,
        borderRadius: Math.random() * 100,
        animCX: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
        ],
        animCY: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
        ],
        animR: [
          Math.random() * 10,
          Math.random() * 150,
          Math.random() * 75,
        ],
        duration: 100 + Math.random() * 15,
      };
    }), []
  );
  

  const particles = useMemo(() =>
    [...Array(15)].map((_, i) => {
      const gray = Math.floor(200 + Math.random() * 40); // בין 200 ל־240, אפור בהיר
      return {
        key: i,
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        delay: Math.random() * 4,
        duration: 5 + Math.random() * 5,
        baseColor: `rgb(${gray}, ${gray}, ${gray})`
      };
    }), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-game-bg bg-contain" />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="softBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          <radialGradient id="gradient1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            {/* <stop offset="0%" stopColor="rgba(147, 197, 253, 0.15)" />
            <stop offset="100%" stopColor="rgba(147, 197, 253, 0)" /> */}
          </radialGradient>
          </filter>
          <radialGradient id="gradient2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            {/* <stop offset="0%" stopColor="rgba(167, 139, 250, 0.15)" />
            <stop offset="100%" stopColor="rgba(167, 139, 250, 0)" /> */}
          </radialGradient>
        </defs>

        {/* {circles.map((c) => (
          <motion.circle
            key={c.key}
            r={c.r}
            fill={c.fill}
            cx={c.cx}
            cy={c.cy}
            filter="url(#softBlur)"
            animate={{
              cx: c.animCX,
              cy: c.animCY,
              r: c.animR
            }}
            transition={{
              duration: c.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))} */}
      </svg>

      <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {particles.map((p) => (
        <motion.div
          key={p.key}
          className="absolute w-10 h-20 rounded-full skew-90"
          style={{
            left: p.left,
            top: p.top,
            backgroundColor: p.baseColor,
            filter: 'blur(10px)',
            scale: 20
          }}
          animate={{
            y: [0, -20, 0],
            transform: ['rotate(45deg)', 'rotate(270deg)', 'rotate(145deg)'],
            opacity: [0.1, 0.7, 0.1],
            backgroundColor: [
              p.baseColor,
              'rgb(180, 180, 180)',
              p.baseColor
            ],
          }}
          transition={{
            duration: p.duration ,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}

    </div>
  );
};

export default AnimatedBackground;
