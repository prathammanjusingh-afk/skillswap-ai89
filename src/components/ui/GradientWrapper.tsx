import React from "react";

interface GradientWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  wrapperClassName?: string;
}

export const GradientWrapper: React.FC<GradientWrapperProps> = ({
  children,
  wrapperClassName,
  className = "",
  ...props
}) => (
  <div {...props} className={`relative ${className}`}>
    <div
      className={`absolute m-auto blur-[160px] pointer-events-none ${wrapperClassName || ""}`}
      style={{
        background:
          "linear-gradient(180deg, #7C3AED 0%, rgba(152, 103, 240, 0.984375) 0.01%, rgba(237, 78, 80, 0.2) 100%)",
      }}
    />
    <div className="relative">{children}</div>
  </div>
);

export default GradientWrapper;
