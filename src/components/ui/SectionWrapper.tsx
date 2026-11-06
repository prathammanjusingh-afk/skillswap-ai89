import React from "react";

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  className = "",
  ...props
}) => (
  <section {...props} className={`py-16 lg:py-24 ${className}`}>
    {children}
  </section>
);

export default SectionWrapper;
