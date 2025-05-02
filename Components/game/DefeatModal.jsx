import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

const DefeatModal = ({ isOpen, onNewGame, creatureName, translations = {}, targetEmoji }) => {
  // Add default translations
  const defaultT = {
    defeatTitle: "Game Over!",
    defeatText: "{name} is still hungry!",
    defeatSubtext: "You ran out of emojis before {name} could find what it was looking for.",
    tryAgain: "Try Again",
    wantedEmoji: "Just wanted some"
  };
  
  const t = translations || {};
  const isRtl = t && t.gameTitle === 'הבלוב';

  // Safe text replacement function
  const safeReplace = (text, placeholder, value) => {
    if (!text) return '';
    return text.replace(placeholder, value);
  };

  React.useEffect(() => {
    if (isOpen) {
      // Play defeat sound
      const defeatSound = new Audio('/static/sounds/defeat-sound.mp3');
      defeatSound.volume = 0.6;
      defeatSound.play().catch(err => console.log("Audio play error:", err));
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} dir={isRtl ? 'rtl' : 'ltr'}>
      <DialogContent className="sm:max-w-md border-4 border-black bg-[#FFDE59] shadow-[16px_16px_0px_rgba(0,0,0,1)] p-0">
        <DialogHeader className="bg-[#F6416C] border-b-4 border-black p-6">
          <DialogTitle className="text-3xl font-bold text-white">{t.defeatTitle || defaultT.defeatTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 text-center">
          <motion.div
            animate={{ 
              y: [0, 5, 0],
              scale: [1, 0.95, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2 
            }}
            className="mx-auto w-40 h-40"
          >
            <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="50" cy="95" rx="30" ry="5" fill="rgba(0,0,0,0.2)" />
              <path d="M25 50C25 30 40 20 50 20C60 20 75 30 75 50C75 70 65 80 50 80C35 80 25 70 25 50Z" 
                fill="#FF6B6B" 
                stroke="#000000" 
                strokeWidth="4"
              />
              
              {/* Sad eyes */}
              <ellipse cx="40" cy="45" rx="5" ry="3" fill="#333333" />
              <ellipse cx="60" cy="45" rx="5" ry="3" fill="#333333" />
              <path d="M35 34 L 45 40" stroke="#333333" strokeWidth="2" fill="none" />
              <path d="M55 40 L 65 34" stroke="#333333" strokeWidth="2" fill="none" />
              
              {/* Crying tears */}
              <path d="M38 50 C 38 55, 36 60, 34 65" stroke="#4FACFE" strokeWidth="2" fill="none" />
              <path d="M62 50 C 62 55, 64 60, 66 65" stroke="#4FACFE" strokeWidth="2" fill="none" />
              <circle cx="34" cy="65" r="2" fill="#4FACFE" />
              <circle cx="66" cy="65" r="2" fill="#4FACFE" />
              
              {/* Sad mouth */}
              <path d="M40 70C45 65 55 65 60 70" 
                fill="none" 
                stroke="#333333" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
              
              {/* Drooping antenna */}
              <path d="M50 20C50 10 45 5 50 0" 
                fill="none" 
                stroke="#000000" 
                strokeWidth="2"
                transform="rotate(-15, 50, 20)"
              />
              <circle cx="50" cy="0" r="4" fill="#FF6B6B" stroke="#000000" strokeWidth="2" transform="rotate(-15, 50, 20)" />
            </svg>
          </motion.div>
          
          <h2 className="text-2xl font-bold mt-4">
            {safeReplace(t.defeatText || defaultT.defeatText, '{name}', creatureName || 'Blob')}
          </h2>
          <p className="text-lg mt-2 mb-6">
            {safeReplace(t.defeatSubtext || defaultT.defeatSubtext, '{name}', creatureName || 'Blob')}
          </p>
          
          {/* Show what the creature wanted */}
          {targetEmoji && (
            <div className="mb-4">
              <p className="mb-2">{creatureName || 'Blob'} {t.wantedEmoji || defaultT.wantedEmoji}</p>
              <div className="text-5xl mb-2">{targetEmoji}</div>
            </div>
          )}
          
          <Button 
            onClick={onNewGame} 
            className="w-full text-xl bg-[#4FACFE] hover:bg-[#2D8EFA] text-white border-3 border-black py-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-bold"
          >
            {t.tryAgain || defaultT.tryAgain}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DefeatModal;