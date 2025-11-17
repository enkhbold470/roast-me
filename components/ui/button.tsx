"use client";

import * as React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <button ref={ref} className={["btn", className].filter(Boolean).join(" ")} {...props} />
    );
  },
);

Button.displayName = "Button";

