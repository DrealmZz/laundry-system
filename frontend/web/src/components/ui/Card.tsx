import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export default function Card({ children, className = '', padding = 'md', onClick }: CardProps) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className={`glass-card ${paddingMap[padding]} ${className}`}
    >
      {children}
    </Component>
  );
}
