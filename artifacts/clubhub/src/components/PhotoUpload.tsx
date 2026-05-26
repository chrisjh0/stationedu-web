import { useRef, useState } from "react";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/gif", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 800 * 1024;

async function uploadToStorage(file: File): Promise<string> {
  const token = localStorage.getItem("clubhub_token");
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/storage/uploads", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || "Upload failed");
  }

  const { url } = await res.json() as { url: string };
  return url;
}

interface PhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function PhotoUpload({ value, onChange, label = "Profile Photo (Optional)" }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const displaySrc = localPreview || value;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please choose a JPG, GIF, PNG, or WebP file");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Image must be under 800 KB");
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl);

    setIsUploading(true);
    try {
      const servedUrl = await uploadToStorage(file);
      onChange(servedUrl);
    } catch {
      toast.error("Upload failed — please try again");
      setLocalPreview("");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setLocalPreview("");
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-secondary">{label}</label>

      <div className="flex items-center gap-4">
        {/* Preview / placeholder */}
        <div className="relative w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant/30">
          {displaySrc ? (
            <>
              <img src={displaySrc} alt="Club photo" className="w-full h-full object-cover" />
              {!isUploading && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-error/10 transition-colors"
                  title="Remove photo"
                >
                  <span className="material-symbols-outlined text-[12px] text-secondary">close</span>
                </button>
              )}
            </>
          ) : (
            <span className="material-symbols-outlined text-[28px] text-outline-variant">image</span>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Upload trigger */}
        <div className="flex flex-col gap-1">
          <input
            ref={inputRef}
            id="photo-upload-input"
            type="file"
            accept=".jpg,.jpeg,.gif,.png,.webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label
            htmlFor="photo-upload-input"
            className={`inline-flex items-center gap-1.5 cursor-pointer h-9 px-4 rounded-xl text-sm font-medium border border-outline-variant/40 bg-white hover:bg-surface-container transition-colors select-none ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">upload</span>
            {isUploading ? "Uploading…" : displaySrc ? "Change Photo" : "Upload Photo"}
          </label>
          <p className="text-xs text-outline-variant">JPG, GIF, PNG or WebP · max 800 KB</p>
        </div>
      </div>
    </div>
  );
}
