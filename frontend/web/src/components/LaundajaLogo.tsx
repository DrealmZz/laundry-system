import React from 'react';

interface LaundajaLogoProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export default function LaundajaLogo({ 
  className = "text-teal", 
  size = 40,
  strokeWidth = 7
}: LaundajaLogoProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size}
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* 
        This path represents the continuous cursive "L" with:
        - A hanger hook at the top (M 54 28 ...)
        - Shoulder line sweeping left and forming the left wing
        - The teardrop cursive loop at the upper-right
        - The diagonal main stem flowing down-left
        - The bottom-left cursive loop
        - The elegant baseline swooping to the right
      */}
      <path 
        d="M 54 25 
           C 54 13, 62 10, 58 6 
           C 53 2, 46 6, 46 13 
           C 46 20, 54 23, 54 28
           C 54 28, 44 33, 38 37
           C 25 45, 16 54, 24 58
           C 32 62, 48 56, 58 45
           C 65 38, 64 30, 56 30
           C 48 30, 42 42, 34 62
           C 28 78, 22 88, 16 92
           C 9 96, 6 91, 10 83
           C 14 74, 26 73, 40 78
           C 54 83, 70 91, 84 91
           C 92 91, 95 86, 91 80" 
      />

      {/* The separate wave accent at the bottom right */}
      <path 
        d="M 48 74 
           C 54 70, 62 69, 70 75
           C 78 81, 86 81, 92 75" 
        strokeWidth={strokeWidth * 0.9}
      />
    </svg>
  );
}
