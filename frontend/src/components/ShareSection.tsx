import { useState, useRef } from 'react';
import { Copy, Upload, FileText, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { saveText, uploadImage } from '@/services/api';
import { ToastData } from './Toast';
import { QuickRetrieve } from './QuickRetrieve';

type TabType = 'text' | 'image';

interface ShareSectionProps {
  onToast: (toast: Omit<ToastData, 'id'>) => void;
}

export const ShareSection = ({ onToast }: ShareSectionProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('text');
  const [textContent, setTextContent] = useState('');
  const [imageContent, setImageContent] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitDisabled = activeTab === 'text' ? !textContent.trim() : !imageContent;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onToast({ type: 'error', message: 'Please select an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onToast({ type: 'error', message: 'Image must be less than 5MB' });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageContent(event.target?.result as string);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setGeneratedCode(null);

    try {
      let code: string;

      if (activeTab === 'text') {
        code = await saveText(textContent);
      } else {
        if (!imageFile) {
          throw new Error('No image file selected');
        }
        const result = await uploadImage(imageFile);
        code = result.code;
      }

      setGeneratedCode(code);
      onToast({ type: 'success', message: 'Content shared successfully!' });
    } catch (error) {
      onToast({ type: 'error', message: 'Failed to share content. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!generatedCode) return;

    try {
      await navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      onToast({ type: 'success', message: 'Code copied to clipboard' });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      onToast({ type: 'error', message: 'Failed to copy code' });
    }
  };

  const handleReset = () => {
    setTextContent('');
    setImageContent(null);
    setImageName(null);
    setImageFile(null);
    setGeneratedCode(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Share Content</h1>
      <p className="text-muted-foreground mb-6">
        Upload text or an image to get a 4-digit sharing code
      </p>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6">
        <button
          onClick={() => {
            setActiveTab('text');
            setGeneratedCode(null);
          }}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md
            text-sm font-medium transition-all duration-150
            ${activeTab === 'text'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <FileText className="w-4 h-4" />
          Text
        </button>
        <button
          onClick={() => {
            setActiveTab('image');
            setGeneratedCode(null);
          }}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md
            text-sm font-medium transition-all duration-150
            ${activeTab === 'image'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <ImageIcon className="w-4 h-4" />
          Image
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        {activeTab === 'text' ? (
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste or type your text here..."
            className="w-full h-40 bg-transparent resize-none text-sm placeholder:text-muted-foreground focus:outline-none"
          />
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            {imageContent ? (
              <div className="space-y-3">
                <img
                  src={imageContent}
                  alt="Preview"
                  className="max-h-48 rounded-lg mx-auto object-contain"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {imageName}
                  </span>
                  <button
                    onClick={() => {
                      setImageContent(null);
                      setImageName(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-sm text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors duration-150"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload an image
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Max 5MB
                </span>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled || isLoading}
        className={`
          w-full py-3 px-4 rounded-lg font-medium text-sm
          flex items-center justify-center gap-2
          transition-all duration-150
          ${isSubmitDisabled || isLoading
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:opacity-90'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating code...
          </>
        ) : (
          'Generate Share Code'
        )}
      </button>

      {/* Generated Code Display */}
      {/* Quick Retrieve Section */}
      <QuickRetrieve onToast={onToast} />

      {generatedCode && (
        <div className="mt-6 p-5 bg-card rounded-xl border border-border animate-fade-in">
          <p className="text-sm text-muted-foreground mb-3 text-center">
            Your sharing code
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="flex gap-2">
              {generatedCode.split('').map((digit, i) => (
                <div
                  key={i}
                  className="w-12 h-14 flex items-center justify-center bg-muted rounded-lg text-2xl font-semibold"
                >
                  {digit}
                </div>
              ))}
            </div>
            <button
              onClick={handleCopyCode}
              className="p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-150"
              title="Copy code"
            >
              {isCopied ? (
                <Check className="w-5 h-5 text-success" />
              ) : (
                <Copy className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
          <button
            onClick={handleReset}
            className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Share something else
          </button>
        </div>
      )}
    </div>
  );
};
