import React from 'react';
import { motion } from 'framer-motion';

const EmojiPanel = ({ position, index = 0, onSelectEmoji, remainingEmojis, allEmojis }) => {
  const [category] = POSITION_EMOJI_MAP[position];
  
  // Get emojis from the appropriate category with offset
  const getEmojisForPanel = () => {
    if (!allEmojis) return ['🌸', '🍔', '🎉', '🐶'];
    
    const categoryEmojis = allEmojis[category] || [];
    // Use index to select different emojis from the category
    const startIdx = (index * 2) % Math.max(categoryEmojis.length - 1, 1);
    return categoryEmojis.slice(startIdx, startIdx + 2);
  };

  const emojis = getEmojisForPanel();

  const handleDragStart = (e, emoji) => {
    if (remainingEmojis <= 0) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', emoji);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const isVertical = position === 'left' || position === 'right';
  const containerClass = isVertical
    ? 'flex flex-col gap-3 mb-3'
    : 'flex gap-3';

  return (
    <div className={containerClass}>
      {emojis.map((emoji, idx) => (
        <motion.div
          key={`${position}-${index}-${idx}`}
          className={`emoji-item h-14 w-14 flex items-center justify-center text-2xl bg-white border-2 border-black rounded-lg ${
            remainingEmojis > 0 ? 'cursor-grab hover:scale-110' : 'cursor-not-allowed opacity-50'
          } shadow-[4px_4px_0px_rgba(0,0,0,1)]`}
          draggable={remainingEmojis > 0}
          onDragStart={(e) => handleDragStart(e, emoji)}
          onClick={() => remainingEmojis > 0 && onSelectEmoji(emoji)}
          whileHover={remainingEmojis > 0 ? { scale: 1.1 } : {}}
          whileTap={remainingEmojis > 0 ? { scale: 0.95 } : {}}
          animate={{
            y: [0, 5, 0],
            rotate: [0, 1, -1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: index * 0.1 + idx * 0.2,
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default EmojiPanel;