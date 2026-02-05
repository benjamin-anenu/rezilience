import { useState } from 'react';
import { ExternalLink, Loader2, AlertCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WebsitePreviewProps {
  url: string;
  className?: string;
}

export const WebsitePreview = ({ url, className }: WebsitePreviewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://'));

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  if (!isValidUrl) {
    return (
      <div className={cn('flex h-48 items-center justify-center rounded-sm border border-border bg-muted/30', className)}>
        <div className="text-center text-muted-foreground">
          <Globe className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-xs">Enter a URL to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative h-48 overflow-hidden rounded-sm border border-border bg-muted/30">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/50">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/50">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="mx-auto mb-2 h-6 w-6" />
              <p className="text-xs">Preview unavailable</p>
            </div>
          </div>
        )}
        <iframe
          src={url}
          className="h-full w-full scale-50 origin-top-left"
          style={{ width: '200%', height: '200%' }}
          sandbox="allow-scripts allow-same-origin"
          onLoad={handleLoad}
          onError={handleError}
          title="Website Preview"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full font-display text-xs uppercase tracking-wider"
        onClick={() => window.open(url, '_blank')}
      >
        <ExternalLink className="mr-2 h-3 w-3" />
        Launch External Site
      </Button>
    </div>
  );
};
