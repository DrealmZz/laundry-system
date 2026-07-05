import React from 'react';

type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  status?: BadgeStatus;
  className?: string;
}

const statusStyles: Record<BadgeStatus, string> = {
  success: 'bg-success/10 text-success border-success/15',
  warning: 'bg-gold/10 text-gold border-gold/15',
  error: 'bg-error/10 text-error border-error/15',
  info: 'bg-teal/10 text-teal border-teal/15',
  neutral: 'bg-white/30 text-ink-secondary border-white/30',
};

export default function Badge({ children, status = 'neutral', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border backdrop-blur-sm ${statusStyles[status]} ${className}`}>
      {children}
    </span>
  );
}
