import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StartGameModal = ({ 
  isOpen, 
  onStartGame, 
  translations = {}, 
  language, 
  onLanguageChange,
  apiKey,
  onApiKeyChange,
  setIsUsingGPT
}) => {
  const getDefaultName = (language) => (language === 'he' ? 'קובי' : 'Kobi');
  const [creatureName, setCreatureName] = useState(getDefaultName(language));
  const [emojiCount, setEmojiCount] = useState(15);
  // const [selectedLanguage, setSelectedLanguage] = useState(language || 'en');
  // const isRtl = language === 'he';
  const isRtl = language === 'he';
  // Use fallback translations
  const t = translations || {};
  const defaultT = {
    startTitle: "The Blob",
    nameLabel: "Name your Blob",
    namePlaceholder: "Enter a name...",
    emojiCountLabel: "Choose emoji count",
    hardDifficulty: "Hard",
    mediumDifficulty: "Medium",
    easyDifficulty: "Easy",
    startButton: "START GAME",
    helpText: "You'll have {count} emojis to use. Choose wisely!",
    blobDescription: "Help {name} find a specific emoji!",
    apiKeyLabel: "OpenAI API Key (optional)",
    apiKeyPlaceholder: "Enter your API key for ChatGPT interaction"
  };

  // Sound effects
  React.useEffect(() => {
    if (isOpen) {
      const welcomeSound = new Audio('/static/sounds/welcome-sound.mp3');
      welcomeSound.volume = 0.4;
      welcomeSound.play().catch(err => console.log("Audio play error:", err));
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (creatureName.trim()) {
      setIsUsingGPT(!!apiKey);
      onStartGame(creatureName, emojiCount, language);
      
      const startSound = new Audio('/static/sounds/start-game-sound.mp3');
      startSound.volume = 0.5;
      startSound.play().catch(err => console.log("Audio play error:", err));
    }
  };

  // Safe text replacement function
  const safeReplace = (text, placeholder, value) => {
    if (!text) return '';
    return text.replace(placeholder, value);
  };
  window.__onLanguageChange = onLanguageChange;
  return (
    <Dialog open={isOpen} onOpenChange={() => {}} dir={isRtl ? 'rtl' : 'ltr'}>
      <DialogContent asChild className="sm:max-w-md border-4 border-black bg-gradient-to-b from-yellow-100 to-[#FFDE59] shadow-[16px_16px_0px_rgba(0,0,0,1)] p-0 max-h-[90vh] overflow-y-auto">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-gradient-to-b from-yellow-100 to-[#FFDE59] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg sm:max-w-md border-4 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)] p-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-[#FF6B6B] to-red-400 border-b-4 border-black p-6">
          <div className="flex justify-between items-center pb-0 p-6">
            <DialogTitle className={`text-3xl font-bold text-white ${isRtl ? 'text-right' : 'text-left'}`}>
              {t.startTitle || defaultT.startTitle}
            </DialogTitle>
            
            {/* Language Selector */}
            <Tabs 
              value={language} 
              onValueChange={(value) => {
                console.log('[StartGameModal] Language selected:', value);
                setSelectedLanguage(value);
                onLanguageChange?.(value);
              }}
              className="w-20"
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="he" >עברית</TabsTrigger>
              </TabsList>
              {/* {console.log('[StartGameModal] rendered with language:', language)} */}
            </Tabs>
          </div>
        </DialogHeader>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
            <div className="space-y-2 flex justify-between">
              <div>
              <Label htmlFor="creatureName" className="text-lg font-bold">{t.nameLabel || defaultT.nameLabel}</Label>
              <Input
                id="creatureName"
                value={creatureName}
                onChange={(e) => setCreatureName(e.target.value)}
                placeholder={t.namePlaceholder || defaultT.namePlaceholder}
                className="text-lg border-2 border-black"
                required
                dir={isRtl ? 'rtl' : 'ltr'}
                />
              {/* API Key Input */}
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-lg font-bold">
                  {t.apiKeyLabel || defaultT.apiKeyLabel}
                </Label>
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  placeholder={t.apiKeyPlaceholder || defaultT.apiKeyPlaceholder}
                  className="text-lg border-2 border-black"
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
              </div>
              </div>
            {/* Blob animation */}
            <div className="text-center my-6 mx-50">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3 
                }}
                className="mx-auto w-40 h-40"
              >
                <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="50" cy="95" rx="30" ry="5" fill="rgba(0,0,0,0.2)" />
                  <path 
                    d="M25 50C25 30 40 20 50 20C60 20 75 30 75 50C75 70 65 80 50 80C35 80 25 70 25 50Z" 
                    fill="#FF6B6B" 
                    stroke="#000000" 
                    strokeWidth="4"
                  />
                  <circle cx="40" cy="45" r="5" fill="#333333" />
                  <circle cx="60" cy="45" r="5" fill="#333333" />
                  <path 
                    d="M40 65C45 70 55 70 60 65" 
                    fill="none" 
                    stroke="#333333" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M50 20C50 10 45 5 50 0" 
                    fill="none" 
                    stroke="#000000" 
                    strokeWidth="2"
                  />
                  <circle cx="50" cy="0" r="4" fill="#FF6B6B" stroke="#000000" strokeWidth="2" />
                </svg>
              </motion.div>
            </div>
            </div>
            <p className="text-lg font-bold mt-4">
              {safeReplace(t.blobDescription || defaultT.blobDescription, '{name}', creatureName || 'Blob')}
            </p>
            <p className="text-sm mt-2">
              {safeReplace(t.helpText || defaultT.helpText, '{count}', emojiCount)}
            </p>
            
            {/* Emoji count selection */}
            <div className="space-y-2">
              <Label className="text-lg font-bold">{t.emojiCountLabel || defaultT.emojiCountLabel}</Label>
              <div className="flex justify-center">
                <div className="flex flex-wrap gap-6 w-full">
                  <button
                    type="button"
                    className={`relative w-33-gap-15 border-4 border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 h-24 flex flex-col items-center justify-center transition-transform ${emojiCount === 5 ? 'bg-blue-500 text-white transform scale-105' : 'bg-blue-300'}`}
                    onClick={() => setEmojiCount(5)}
                  >
                    <span className="text-2xl font-bold">5</span>
                    <span className="text-sm">{t.hardDifficulty || defaultT.hardDifficulty}</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`relative w-33-gap-15 border-4 border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 h-24 flex flex-col items-center justify-center transition-transform ${emojiCount === 10 ? 'bg-green-500 text-white transform scale-105' : 'bg-green-300'}`}
                    onClick={() => setEmojiCount(10)}
                  >
                    <span className="text-2xl font-bold">10</span>
                    <span className="text-sm">{t.mediumDifficulty || defaultT.mediumDifficulty}</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`relative w-33-gap-15 border-4 border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 h-24 flex flex-col items-center justify-center transition-transform ${emojiCount === 15 ? 'bg-purple-500 text-white transform scale-105' : 'bg-purple-300'}`}
                    onClick={() => setEmojiCount(15)}
                  >
                    <span className="text-2xl font-bold">15</span>
                    <span className="text-sm">{t.easyDifficulty || defaultT.easyDifficulty}</span>
                  </button>
                </div>
              </div>
            </div>            
            
            <Button 
              type="submit" 
              className="w-full text-xl bg-[#43E97B] hover:bg-[#32C866] text-black border-3 border-black py-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-bold"
            >
              {t.startButton || defaultT.startButton}
            </Button>
          </form>
        </div></div>
      </DialogContent>
    </Dialog>
  );
};

export default StartGameModal;