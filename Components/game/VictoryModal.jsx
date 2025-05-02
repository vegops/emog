import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const VictoryModal = ({ isOpen, onNewGame, creatureName, translations = {} }) => {
  // Add default translations
  const defaultT = {
    victoryTitle: "Victory!",
    victoryText: "{name} is full and happy!",
    victorySubtext: "You successfully figured out what {name} wanted to eat!",
    playAgain: "Play Again",
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
      // Play victory sound
      const victorySound = new Audio('/static/sounds/victory-sound.mp3');
      victorySound.volume = 0.6;
      victorySound.play().catch(err => console.log("Audio play error:", err));
      
      // Launch confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Run confetti twice for a more dense effect
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} dir={isRtl ? 'rtl' : 'ltr'}>
      <DialogContent className="sm:max-w-md border-4 border-black bg-[#FFDE59] shadow-[16px_16px_0px_rgba(0,0,0,1)] p-0">
        <DialogHeader className="bg-[#43E97B] border-b-4 border-black p-6">
          <DialogTitle className="text-3xl font-bold text-white">{t.victoryTitle || defaultT.victoryTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0],
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
              <circle cx="40" cy="45" r="5" fill="#333333" />
              <circle cx="60" cy="45" r="5" fill="#333333" />
              
              {/* Happy mouth */}
              <path d="M40 65C45 72 55 72 60 65" 
                fill="none" 
                stroke="#333333" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
              
              <path d="M50 20C50 10 45 5 50 0" 
                fill="none" 
                stroke="#000000" 
                strokeWidth="2"
              />
              <circle cx="50" cy="0" r="4" fill="#FF6B6B" stroke="#000000" strokeWidth="2" />
              
              {/* Party hat */}
              <path d="M30 30L50 5L70 30" fill="#4FACFE" stroke="#000" strokeWidth="2" />
              <circle cx="50" cy="5" r="3" fill="#FFDE59" />
            </svg>
          </motion.div>
          
          <h2 className="text-2xl font-bold mt-4">
            {safeReplace(t.victoryText || defaultT.victoryText, '{name}', creatureName || 'Blob')}
          </h2>
          <p className="text-lg mt-2 mb-6">
            {safeReplace(t.victorySubtext || defaultT.victorySubtext, '{name}', creatureName || 'Blob')}
          </p>
          
          <Button 
            onClick={onNewGame} 
            className="w-full text-xl bg-[#4FACFE] hover:bg-[#2D8EFA] text-white border-3 border-black py-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-bold"
          >
            {t.playAgain || defaultT.playAgain}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VictoryModal;