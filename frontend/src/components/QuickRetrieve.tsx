import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Copy, Check, AlertCircle } from 'lucide-react';
import { retrieveText, retrieveImage } from '@/services/api';
import { ToastData } from './Toast';

interface QuickRetrieveProps {
  onToast: (toast: Omit<ToastData, 'id'>) => void;
}

export const QuickRetrieve = ({ onToast }: QuickRetrieveProps) => {
  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'text' | 'image'; content: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullCode = code.join('');
  const isCodeComplete = fullCode.length === 4;

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];

    if (value.length > 1) {
      const digits = value.slice(0, 4 - index).split('');
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 3);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    setResult(null);
    setError(null);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFetch = async () => {
    if (!isCodeComplete) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      // Try to retrieve as text first
      try {
        const text = await retrieveText(fullCode);
        setResult({ type: 'text', content: text });
        onToast({ type: 'success', message: 'Content retrieved successfully!' });
      } catch (textError) {
        // If text retrieval fails, try image
        try {
          const imageUrl = await retrieveImage(fullCode);
          setResult({ type: 'image', content: imageUrl });
          onToast({ type: 'success', message: 'Content retrieved successfully!' });
        } catch (imageError) {
          throw new Error('No content found with this code');
        }
      }
    } catch (error) {
      setError('No content found with this code');
      onToast({ type: 'error', message: 'Code not found' });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch when code is complete
  useEffect(() => {
    if (isCodeComplete && !isLoading && !result) {
      handleFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCodeComplete, fullCode]);

  const handleCopyContent = async () => {
    if (!result || result.type !== 'text') return;

    try {
      await navigator.clipboard.writeText(result.content);
      setIsCopied(true);
      onToast({ type: 'success', message: 'Content copied to clipboard' });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      onToast({ type: 'error', message: 'Failed to copy content' });
    }
  };

  const handleReset = () => {
    setCode(['', '', '', '']);
    setResult(null);
    setError(null);
  };

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="flex items-center gap-2 text-sm font-medium mb-4">
        <Search className="w-4 h-4" />
        <span>Retrieve Content</span>
      </div>

      <div className="bg-muted/50 rounded-xl p-5">
        <p className="text-sm text-muted-foreground mb-4">
          Enter a 4-digit code to retrieve shared content
        </p>

        {/* Code Input */}
        <div className="flex justify-center gap-2 mb-4">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={digit}
              onChange={(e) => handleInputChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center text-lg font-semibold bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-150"
            />
          ))}
        </div>

        {/* Fetch Button */}
        <button
          onClick={handleFetch}
          disabled={!isCodeComplete || isLoading}
          className={`
            w-full py-2.5 px-4 rounded-lg font-medium text-sm
            flex items-center justify-center gap-2
            transition-all duration-150
            ${!isCodeComplete || isLoading
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-secondary text-secondary-foreground hover:opacity-90'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Retrieve
            </>
          )}
        </button>

        {/* Error State */}
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/30 animate-fade-in">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-4 p-4 bg-card rounded-lg border border-border animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                {result.type === 'text' ? 'Shared Text' : 'Shared Image'}
              </span>
              {result.type === 'text' && (
                <button
                  onClick={handleCopyContent}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted hover:bg-muted/80 transition-colors duration-150"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-success" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>

            {result.type === 'text' ? (
              <p className="text-sm whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                {result.content}
              </p>
            ) : (
              <img
                src={result.content}
                alt="Shared content"
                className="max-h-32 rounded mx-auto object-contain"
              />
            )}

            <button
              onClick={handleReset}
              className="w-full mt-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};