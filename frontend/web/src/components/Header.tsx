import React, { useState, useEffect } from 'react';
import { Bell, HelpCircle, UserCircle } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentRole: 'kasir' | 'admin' | 'owner';
  user: User;
}

const roleDisplayNames: Record<string, string> = {
  kasir: 'Kasir Dashboard',
  admin: 'Admin Panel',
  owner: 'Owner Executive Dashboard',
};

export default function Header({ currentRole, user }: HeaderProps) {
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDate(now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-card border-b border-white/30 px-8 py-4 flex items-center justify-between sticky top-0 z-30 h-20 select-none" style={{ borderRadius: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
      
      {/* Left side: Page Title */}
      <div className="flex items-center gap-4">
        <h2 className="font-display font-black text-xl text-ink tracking-tight">
          {roleDisplayNames[currentRole]}
        </h2>
        <span className="bg-white/30 text-navy-deep text-[11px] font-black tracking-widest px-3 py-1 rounded-full uppercase border border-white/40 backdrop-blur-sm">
          SHIFT: PAGI
        </span>
      </div>

      {/* Right side: Time/Date, Action Icons, and Profile */}
      <div className="flex items-center gap-6">
        
        {/* Date */}
        <div className="text-right hidden md:block">
          <p className="text-xs font-extrabold text-ink tracking-tight leading-none">
            {date || '—'}
          </p>
          <p className="text-[11px] text-ink-muted font-bold font-mono uppercase tracking-widest mt-1">
            Operational Time
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 border-l border-white/30 pl-4">
          <button className="p-2 text-ink-muted hover:text-ink-secondary hover:bg-white/20 rounded-[var(--radius-md)] transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white/80" />
          </button>
          <button className="p-2 text-ink-muted hover:text-ink-secondary hover:bg-white/20 rounded-[var(--radius-md)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-white/30 pl-4">
          <div className="relative w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-teal to-navy-medium flex items-center justify-center shadow-md shadow-teal/15">
            <UserCircle className="w-6 h-6 text-white" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-white/80 shadow-subtle" />
          </div>

          <div className="text-left hidden sm:block">
            <p className="text-xs font-black text-ink leading-none">{user.name}</p>
            <p className="text-[11px] text-ink-muted font-bold mt-1">{user.title}</p>
          </div>
        </div>

      </div>
    </header>
  );
}
