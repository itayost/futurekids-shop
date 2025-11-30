'use client';

import { useEffect } from 'react';
import { Check, X, Undo2 } from 'lucide-react';
import { Toast as ToastType } from '@/types';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (toast.type !== 'undo') {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, 3000);
      return () => clearTimeout(timer);
    }
    // For undo toasts, auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.type, onDismiss]);

  return (
    <div className="animate-slide-up bg-white border-4 border-black rounded-xl p-4 hard-shadow flex items-center gap-3 min-w-[280px]">
      {toast.type === 'success' && (
        <div className="w-8 h-8 bg-emerald-100 border-2 border-black rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
        </div>
      )}
      {toast.type === 'undo' && (
        <div className="w-8 h-8 bg-gray-100 border-2 border-black rounded-full flex items-center justify-center flex-shrink-0">
          <X className="w-4 h-4 text-gray-600" strokeWidth={3} />
        </div>
      )}
      <div className="flex-1">
        {toast.productName && (
          <p className="font-bold text-sm text-gray-900">{toast.productName}</p>
        )}
        <p className="text-sm text-gray-600">{toast.message}</p>
      </div>
      {toast.type === 'undo' && toast.undoAction && (
        <button
          onClick={() => {
            toast.undoAction?.();
            onDismiss(toast.id);
          }}
          className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition"
        >
          <Undo2 className="w-3 h-3" />
          בטל
        </button>
      )}
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 hover:bg-gray-100 rounded transition"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
