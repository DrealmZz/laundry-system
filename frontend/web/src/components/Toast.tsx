import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let listeners: ((msg: ToastMessage) => void)[] = [];

export function showToast(message: string, type: ToastType = 'success') {
  const msg: ToastMessage = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(msg));
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
};

const BG_COLORS: Record<ToastType, string> = {
  success: 'bg-green-900/90 border-green-500/30',
  error: 'bg-red-900/90 border-red-500/30',
  info: 'bg-blue-900/90 border-blue-500/30',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 3000);
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter((fn) => fn !== handler); };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg text-sm font-semibold text-white animate-[slideIn_0.2s_ease-out] ${BG_COLORS[t.type]}`}
        >
          {ICONS[t.type]}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-white/50 hover:text-white transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
