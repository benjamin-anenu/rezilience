import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LogoUploaderProps {
  profileId?: string;
  currentLogoUrl?: string;
  onLogoUploaded: (url: string) => void;
  compact?: boolean;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

export function LogoUploader({ profileId, currentLogoUrl, onLogoUploaded, compact = false }: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Use PNG, JPG, WEBP, or SVG.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 2MB.');
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    if (!profileId) {
      // During claim flow, we just store the preview; actual upload happens on submit
      onLogoUploaded(objectUrl);
      return;
    }

    // Upload to storage
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const filePath = `${profileId}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('project-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-logos')
        .getPublicUrl(filePath);

      // Append cache-busting param
      const finalUrl = `${publicUrl}?t=${Date.now()}`;
      setPreview(finalUrl);
      onLogoUploaded(finalUrl);
      toast.success('Logo uploaded successfully');
    } catch (err) {
      console.error('Logo upload error:', err);
      toast.error('Failed to upload logo');
      setPreview(currentLogoUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onLogoUploaded('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border-2 border-dashed border-border bg-muted/50 cursor-pointer transition-colors hover:border-primary/50 overflow-hidden',
            isUploading && 'opacity-50'
          )}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : preview ? (
            <img src={preview} alt="Logo" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-1 h-3 w-3" />
            {preview ? 'Change' : 'Upload Logo'}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
            >
              <X className="mr-1 h-3 w-3" />
              Remove
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.svg"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-border bg-muted/30 p-6 cursor-pointer transition-colors hover:border-primary/50',
          isUploading && 'opacity-50 pointer-events-none'
        )}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
        ) : preview ? (
          <div className="relative group">
            <img src={preview} alt="Logo preview" className="h-20 w-20 rounded-sm object-cover" />
            <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="h-5 w-5 text-foreground" />
            </div>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click or drag to upload logo</p>
          </>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground">PNG, JPG, WEBP, SVG · Max 2MB</p>
      </div>

      {preview && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); handleRemove(); }}
        >
          <X className="mr-1 h-3 w-3" />
          Remove logo
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
