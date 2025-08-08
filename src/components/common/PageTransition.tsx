"use client";

import React from "react";
// import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {

  return <div className="page-content">{children}</div>;
};

export default PageTransition;
