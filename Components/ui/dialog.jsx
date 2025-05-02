import React from "react";

export function Dialog({ open, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {children}
    </div>
  );
}

export function DialogContent({ children }) {
  return (
    <div className="bg-white border-4 border-black rounded-2xl shadow-lg p-6 max-w-md w-full relative">
      {children}
    </div>
  );
}

export function DialogHeader({ children }) {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
}

export function DialogTitle({ children }) {
  return (
    <h2 className="text-2xl font-bold text-center">
      {children}
    </h2>
  );
}
