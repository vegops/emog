import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

// Use default parameter to avoid undefined translations
const GameControls = ({ 
  onClearEmojis, 
  onRestartGame, 
  remainingEmojis, 
  allEmojis, 
  onSelectEmoji,
  clearButtonText = "Clear Vomit",
  newGameButtonText = "New Game",
  selectEmojiText = "Select Emoji"
}) => {
  return (
    <div className="space-y-4 bg-gradient-to-r from-yellow-50 to-yellow-100 p-5 rounded-xl border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,0.8)]">
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={() => setIsCleanUpMode(true)}
          className="flex-1 bg-[#F6416C] hover:bg-[#E32B52] text-white border-3 border-black py-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold"
        >
          {clearButtonText}
        </Button>
        <Button 
          onClick={onRestartGame}
          className="flex-1 bg-[#A259FF] hover:bg-[#8A41E8] text-white border-3 border-black py-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold"
        >
          {newGameButtonText}
        </Button>
      </div>
    </div>
  );
};

export default GameControls;