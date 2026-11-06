"use client";

import { useInView } from "framer-motion";
import React, { cloneElement, useRef } from "react";

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
  isInviewState = { trueState: "", falseState: "" },
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return cloneElement(children, {
    ref,
    className: `${children.props.className || ""} ${className} ${
      isInView ? isInviewState.trueState : isInviewState.falseState
    }`,
  });
};

export default LayoutEffect;
