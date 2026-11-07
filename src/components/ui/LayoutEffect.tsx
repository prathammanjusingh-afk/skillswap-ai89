"use client";

import React from "react";

interface LayoutEffectProps {
  children: React.ReactElement;
  className?: string;
  isInviewState?: {
    trueState?: string;
    falseState?: string;
  };
}

export const LayoutEffect: React.FC<LayoutEffectProps> = ({
  children,
  className = "",
}) => {
  return React.cloneElement(children, {
    className: `${children.props.className || ""} ${className} opacity-100 translate-y-0 transition-all duration-700`,
  });
};

export default LayoutEffect;
