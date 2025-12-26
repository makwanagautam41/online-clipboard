import { useState, useCallback } from 'react';
import { ShareSection } from '@/components/ShareSection';
import { ToastContainer, ToastData } from '@/components/Toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeProvider } from '@/hooks/useTheme';

const IndexContent = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="min-h-screen w-full">
      {/* Fixed Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="min-h-screen px-4 py-8">
        <ShareSection onToast={addToast} />
      </main>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

const Index = () => {
  return (
    <ThemeProvider>
      <IndexContent />
    </ThemeProvider>
  );
};

export default Index;