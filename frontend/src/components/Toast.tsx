import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export const Toast = ({ toast, onDismiss }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast.id]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.touches[0].clientY - touchStart;
    if (diff < 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (translateY < -50) {
      handleDismiss();
    } else {
      setTranslateY(0);
    }
    setTouchStart(null);
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
        bg-card text-card-foreground border-border
        ${isExiting ? 'animate-slide-up' : 'animate-slide-down'}
        transition-transform duration-150 ease-out
      `}
      style={{ transform: `translateY(${translateY}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {toast.type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
      )}
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={handleDismiss}
        className="ml-2 p-1 rounded-md hover:bg-muted transition-colors duration-150"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
