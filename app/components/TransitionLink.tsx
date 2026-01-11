"use client";

import React from "react";
import { useTransitionNav } from "./TransitionProvider";

export default function TransitionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { go } = useTransitionNav();

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        go(href);
      }}
    >
      {children}
    </a>
  );
}
