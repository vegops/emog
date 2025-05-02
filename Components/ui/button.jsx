import React from "react";

export function Button({ children, onClick, className = "", ...props }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-bold transition-all border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.8)] hover:brightness-95 active:translate-y-[1px] active:shadow-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
