import React from 'react';
import { Tab } from "@headlessui/react";
import { motion } from 'framer-motion';

const EmojiTabs = ({ allEmojis, onSelectEmoji, remainingEmojis, language }) => {
  const categories = language === 'he'
  ? {
      food:         "🍔 אוכל",
      flowers:      "🌸 פרחים",
      celebrations: "🎉 חגיגות",
      animals:      "🐶 חיות",
      things:       "⚽ חפצים",
    }
  : {
      food:         "🍔 Food",
      flowers:      "🌸 Flowers",
      celebrations: "🎉 Celebrations",
      animals:      "🐶 Animals",
      things:       "⚽ Things",
    }

  return (
    <Tab.Group>
      <div className="flex flex-col h-full w-full">
        {/* Tabs List */}
        <div className="bg-gradient-to-r from-green-300 to-green-400 border-b-4 border-black p-2">
          <Tab.List className="grid grid-cols-5 bg-green-50 p-1 border-2 border-black">
            {Object.entries(categories).map(([key, label]) => (
              <Tab
                key={key}
                className={({ selected }) =>
                  `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium border border-black ${
                    selected ? 'bg-green-500 text-white shadow-inner' : 'bg-white'
                  }`
                }
              >
                {label}
              </Tab>
            ))}
          </Tab.List>
        </div>

        {/* Tabs Content */}
        <div className="flex-1 overflow-y-hidden p-2 relative min-h-[100px]">
          <Tab.Panels className="relative h-full">
            {Object.entries(allEmojis).map(([category, emojis]) => (
              <Tab.Panel key={category} className="absolute m-0 h-full flex flex-wrap items-center gap-2 justify-center min-h-[100px] flex w-full pl-8 pr-8">
                {emojis.map((emoji, index) => (
                  <motion.button
                    key={`${category}-${index}`}
                    className={`w-12 h-12 p-2 flex items-center justify-center text-xl 
                      border-4 border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.8)] bg-white 
                      ${remainingEmojis > 0 ? 'hover:scale-110 cursor-grab' : 'opacity-50 cursor-not-allowed'}
                    `}
                    whileHover={remainingEmojis > 0 ? { scale: 1.1 } : {}}
                    whileTap={remainingEmojis > 0 ? { scale: 0.95 } : {}}
                    draggable={remainingEmojis > 0}
                    onDragStart={(e) => {
                      if (remainingEmojis > 0) {
                        e.dataTransfer.setData('text/plain', emoji);
                      }
                    }}
                    onClick={() => remainingEmojis > 0 && onSelectEmoji(emoji)}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </div>
      </div>
    </Tab.Group>
  );
};

export default EmojiTabs;
