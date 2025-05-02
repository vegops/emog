import React from "react";

export const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`border border-black rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${className}`}
      {...props}
    />
  );
});

Input.displayName = "Input";
