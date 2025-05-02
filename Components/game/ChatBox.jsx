import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle } from 'lucide-react';

const InstructionPanel = ({ isOpen, text, isRtl }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded bg-[#f9f0f4] backdrop-blur-sm border-2 border-black rounded-t-xl shadow-lg p-4 space-y-4 m-1 mb-[-3px]`}
      >
        {text.gameInstruction}
      </motion.div>
    )}
  </AnimatePresence>
);

const ChatBox = ({ 
  messages, 
  onSendMessage, 
  creatureName, 
  translations, 
  isRtl,
  availableMessages,
  moodLevel 
}) => {
  const [input, setInput] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const messagesEndRef = useRef(null);
  const t = translations;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && availableMessages > 0) {
      onSendMessage(input);
      setInput('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMoodColor = () => {
    if (moodLevel <= 2) return '#F87171'; // angry
    if (moodLevel <= 4) return '#FBBF24'; // sad
    if (moodLevel <= 6) return '#FF9D9D'; // neutral
    return '#6EE7B7'; // happy
  };

  const getUserColor = (text) => {
    if (text.includes('?')) return '#FFFACD';
    if (text.length > 80) return '#D1FAE5';
    return '#C5FAD5';
  };

  return (
    <div
      className="chat-box flex flex-col h-full border-4 border-black bg-[#FFF8F0] rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="chat-header bg-gradient-to-r from-[#FF6B6B] to-[#FFA07A] p-3 border-b-4 border-black">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-black">
            {t.chatWith} {creatureName}
          </h3>
          <div className={`px-2 py-1 rounded-full text-sm font-bold ${
            availableMessages > 0 ? 'bg-white/20' : 'bg-red-400'
          }`}>
            {availableMessages}{' '}
            {availableMessages === 1
              ? t.messageLeft || 'message left'
              : t.messagesLeft || 'messages left'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages flex-1 p-4 overflow-y-auto bg-[#FFFDF8]">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-3 ${
                msg.sender === 'creature'
                  ? (isRtl ? 'ml-auto' : 'mr-auto')
                  : (isRtl ? 'mr-auto' : 'ml-auto')
              }`}
            >
              {msg.sender === 'creature' ? (
                <div className="relative max-w-[85%]">
                  <div
                    className={`absolute ${
                      isRtl ? '-right-3' : '-left-3'
                    } top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-black ${
                      isRtl ? 'border-t-2 border-r-2' : 'border-l-2 border-b-2'
                    }`}
                    style={{ backgroundColor: getMoodColor() }}
                  />
                  <div
                    className="p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
                    style={{ backgroundColor: getMoodColor(), color: '#6B0F1A' }}
                  >
                    <p className={`${isRtl ? 'text-right' : 'text-left'} text-sm sm:text-base`}>
                      {!msg.built ? `[ ${msg.text} ]` : msg.text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative max-w-[85%]">
                  <div
                    className={`absolute ${
                      isRtl ? '-left-0' : '-right-3'
                    } top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-black ${
                      isRtl ? 'border-l-2 border-b-2' : 'border-t-2 border-r-2'
                    }`}
                    style={{ backgroundColor: getUserColor(msg.text) }}
                  />
                  <div
                    className="p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
                    style={{ backgroundColor: getUserColor(msg.text), color: '#064420' }}
                  >
                    <p className={`${isRtl ? 'text-right' : 'text-left'} text-sm sm:text-base`}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Instruction Panel & Input */}
      <InstructionPanel isOpen={showInstructions} text={t} isRtl />

      <div className="relative">
        {/* Help Button */}
        <Button
          type="button"
          variant="ghost"
          className={`absolute ${
            isRtl ? 'left-3' : 'right-3'
          } w-6 h-10 -top-[60] rounded-full flex items-center justify-center border-2 border-black ${
            showInstructions
              ? 'bg-indigo-100 text-indigo-900'
              : 'bg-white hover:bg-gray-100'
          } hover:translate-x-[2px] hover:translate-y-[2px] transition-all`}
          onClick={() => setShowInstructions(!showInstructions)}
        >
          ❓
        </Button>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t-4 border-black bg-[#F0F0F0]">
          <div className="flex gap-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={availableMessages > 0 ? t.messagePlaceholder : t.noMessagePlaceholder}
              className="flex-1 border-2 border-black rounded-lg text-sm sm:text-base bg-white focus:ring-2 focus:ring-[#4FACFE]"
              dir={isRtl ? 'rtl' : 'ltr'}
              disabled={availableMessages <= 0}
            />
            <Button
              type="submit"
              className={`border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] font-bold whitespace-nowrap text-sm sm:text-base ${
                availableMessages > 0
                  ? 'text-white'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
              style={{
                backgroundColor: availableMessages > 0 ? '#4FACFE' : undefined,
              }}
              disabled={availableMessages <= 0}
            >
              {t.sendMessage}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
