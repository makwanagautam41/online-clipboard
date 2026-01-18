import { useState, useRef } from "react";
import {
  Copy,
  Upload,
  FileText,
  Image as ImageIcon,
  Check,
  Loader2,
} from "lucide-react";
import { saveText, uploadImage } from "@/services/api";
import { ToastData } from "./Toast";
import { QuickRetrieve } from "./QuickRetrieve";

type TabType = "text" | "image";

interface ShareSectionProps {
  onToast: (toast: Omit<ToastData, "id">) => void;
}

export const ShareSection = ({ onToast }: ShareSectionProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("text");
  const [textContent, setTextContent] = useState("");
  const [imageContent, setImageContent] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [requestTimeMs, setRequestTimeMs] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitDisabled =
    activeTab === "text" ? !textContent.trim() : !imageContent;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onToast({ type: "error", message: "Please select an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onToast({ type: "error", message: "Image must be less than 5MB" });
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
    setRequestTimeMs(null);

    const startTime = performance.now();

    try {
      let code: string;

      if (activeTab === "text") {
        code = await saveText(textContent);
      } else {
        if (!imageFile) throw new Error("No image file selected");
        const result = await uploadImage(imageFile);
        code = result.code;
      }

      const endTime = performance.now();

      setGeneratedCode(String(code));
      setRequestTimeMs(Math.round(endTime - startTime));

      onToast({ type: "success", message: "Content shared successfully!" });
    } catch {
      onToast({
        type: "error",
        message: "Failed to share content. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!generatedCode) return;

    try {
      await navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      onToast({ type: "success", message: "Code copied to clipboard" });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      onToast({ type: "error", message: "Failed to copy code" });
    }
  };

  const handleReset = () => {
    setTextContent("");
    setImageContent(null);
    setImageName(null);
    setImageFile(null);
    setGeneratedCode(null);
    setRequestTimeMs(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
            setActiveTab("text");
            setGeneratedCode(null);
            setRequestTimeMs(null);
          }}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium ${
            activeTab === "text"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Text
        </button>
        <button
          onClick={() => {
            setActiveTab("image");
            setGeneratedCode(null);
            setRequestTimeMs(null);
          }}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium ${
            activeTab === "image"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ImageIcon className="w-4 h-4 inline mr-2" />
          Image
        </button>
      </div>

      {/* Content */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        {activeTab === "text" ? (
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste or type your text here..."
            className="w-full h-40 bg-transparent resize-none text-sm focus:outline-none"
          />
        ) : (
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              Click to upload an image
            </span>
          </label>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled || isLoading}
        className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
      >
        {isLoading ? (
          <span className="flex justify-center items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating code…
          </span>
        ) : (
          "Generate Share Code"
        )}
      </button>

      {/* Generated Code */}
      {generatedCode && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            {generatedCode.split("").map((d, i) => (
              <span
                key={i}
                className="px-2 py-1 text-sm font-semibold rounded bg-muted"
              >
                {d}
              </span>
            ))}
            <button onClick={handleCopyCode} className="ml-2">
              {isCopied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-muted-foreground ml-2"
            >
              Reset
            </button>
          </div>

          {requestTimeMs !== null && (
            <p className="text-xs text-muted-foreground mt-1">
              Completed in {requestTimeMs} ms
            </p>
          )}
        </div>
      )}

      <QuickRetrieve onToast={onToast} />
    </div>
  );
};
