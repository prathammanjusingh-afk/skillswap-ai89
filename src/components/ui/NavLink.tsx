import React from "react";

interface NavLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const NavLink: React.FC<NavLinkProps> = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`py-2.5 px-4 text-center rounded-full duration-150 font-medium text-sm ${className}`}
  >
    {children}
  </button>
);

export default NavLink;
