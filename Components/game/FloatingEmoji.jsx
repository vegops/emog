import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const FloatingEmoji = ({ emoji, position, onPositionUpdate, onRemove, gameAreaBounds }) => {
  const emojiRef = useRef(null);
  
  // Render emoji without drag functionality - it's now placed permanently
  return (
    <motion.div
      ref={emojiRef}
      className="absolute select-none"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        fontSize: '40px',
        zIndex: 10,
        userSelect: 'none',
        filter: 'drop-shadow(0px 2px 5px rgba(0,0,0,0.15))'
      }}
      animate={{
        y: [0, 10, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut"
      }}
      whileHover={{ scale: 1.1 }}
    >
      {emoji.symbol}
    </motion.div>
  );
};

export default FloatingEmoji;