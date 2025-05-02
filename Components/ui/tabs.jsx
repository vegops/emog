import React, { useState, createContext, useContext } from "react";

// 1. יצירת Context
const TabsContext = createContext();

export function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }) {
  return <div className="flex gap-2 mb-2">{children}</div>;
}

export function TabsTrigger({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => {
        setActiveTab(value);
        // נעדכן גם את השפה חיצונית אם קיימת פונקציה
        if (typeof window !== 'undefined' && window.__onLanguageChange) {
          window.__onLanguageChange(value);
        }
      }}
      className={`px-3 py-1 border-2 border-black font-bold rounded-xl shadow ${
        isActive ? "bg-yellow-300" : "bg-white"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  if (value !== activeTab) return null;
  return <div>{children}</div>;
}
