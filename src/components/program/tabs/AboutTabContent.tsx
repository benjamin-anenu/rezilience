import { useState } from 'react';
import { ExternalLink, Globe, Maximize2, MapPin, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { getCountryLabel } from '@/lib/countries';
import type { MediaAsset } from '@/types';

interface AboutTabContentProps {
  description?: string;
  category?: string | null;
  country?: string | null;
  getCategoryLabel: (value: string) => string;
  websiteUrl?: string;
  mediaAssets?: MediaAsset[];
  isVerified?: boolean;
}

const getEmbedUrl = (url: string, type: string) => {
  if (type === 'youtube') {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

export function AboutTabContent({
  description,
  category,
  country,
  getCategoryLabel,
  websiteUrl,
  mediaAssets,
  isVerified,
}: AboutTabContentProps) {
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const isHtml = description ? /<[^>]+>/.test(description) : false;
  const countryLabel = getCountryLabel(country);

  return (
    <div className="space-y-6">
      {/* Description Card - Full Rich Text */}
      {description && (
        <Card className="card-premium border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
              About This Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isHtml ? (
              <div 
                className="prose prose-sm max-w-none text-foreground prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-strong:text-foreground prose-ul:text-foreground/90 prose-ol:text-foreground/90 prose-li:marker:text-primary"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            )}
            
            {/* Category and Country badges */}
            {(category || countryLabel) && (
              <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center gap-4">
                {category && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Category:</span>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {getCategoryLabel(category)}
                    </Badge>
                  </div>
                )}
                {countryLabel && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-foreground">{countryLabel}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Website Preview with Browser Chrome */}
      {isVerified && websiteUrl && (
        <Card className="card-premium border-border bg-card overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-display text-sm uppercase tracking-wider text-muted-foreground">
                <Globe className="h-4 w-4 text-primary" />
                Website Preview
              </CardTitle>
              <div className="flex items-center gap-2">
                {!isPreviewActive && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => setIsPreviewActive(true)}
                  >
                    <Play className="h-4 w-4" />
                    Launch Preview
                  </Button>
                )}
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            {/* Browser Chrome Frame - Compact */}
            <div className="overflow-hidden rounded-sm border border-border">
              {/* Browser Header - Slim */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-2.5 py-1.5">
                {/* Traffic lights - Smaller */}
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                </div>
                {/* URL Bar - Compact */}
                <div className="flex-1 mx-1.5">
                  <div className="flex items-center gap-1.5 rounded-sm bg-background px-2 py-1 text-[11px] text-muted-foreground">
                    <Globe className="h-2.5 w-2.5" />
                    <span className="truncate">{websiteUrl}</span>
                  </div>
                </div>
                {/* Actions */}
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" asChild>
                  <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Maximize2 className="h-2.5 w-2.5" />
                  </a>
                </Button>
              </div>
              {/* Iframe or Placeholder - 16:9 aspect ratio */}
              <div className="aspect-video bg-muted/30">
                {isPreviewActive ? (
                  <iframe
                    src={websiteUrl}
                    className="h-full w-full bg-background"
                    title="Website preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                    <Globe className="h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Click "Launch Preview" to load the website</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsPreviewActive(true)}
                      className="gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Launch Preview
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Gallery */}
      {isVerified && mediaAssets && mediaAssets.length > 0 && (
        <Card className="card-premium border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
              Media Gallery
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Grid on desktop, Carousel on mobile */}
            <div className="hidden md:grid md:grid-cols-3 gap-4">
              {mediaAssets.sort((a, b) => a.order - b.order).map((asset, index) => (
                <div
                  key={asset.id}
                  className="group relative aspect-video overflow-hidden rounded-sm border border-border bg-muted card-lift transition-all hover:border-primary/30"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {asset.type === 'image' ? (
                    <img
                      src={asset.url}
                      alt="Project media"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : asset.type === 'youtube' ? (
                    <iframe
                      src={getEmbedUrl(asset.url, 'youtube')}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="YouTube video"
                    />
                  ) : (
                    <video
                      src={asset.url}
                      controls
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden">
              <Carousel className="w-full">
                <CarouselContent>
                  {mediaAssets.sort((a, b) => a.order - b.order).map((asset) => (
                    <CarouselItem key={asset.id}>
                      <div className="aspect-video overflow-hidden rounded-sm border border-border bg-muted">
                        {asset.type === 'image' ? (
                          <img
                            src={asset.url}
                            alt="Project media"
                            className="h-full w-full object-cover"
                          />
                        ) : asset.type === 'youtube' ? (
                          <iframe
                            src={getEmbedUrl(asset.url, 'youtube')}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="YouTube video"
                          />
                        ) : (
                          <video
                            src={asset.url}
                            controls
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {mediaAssets.length > 1 && (
                  <>
                    <CarouselPrevious className="-left-4" />
                    <CarouselNext className="-right-4" />
                  </>
                )}
              </Carousel>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!description && !websiteUrl && (!mediaAssets || mediaAssets.length === 0) && (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Globe className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No about information available yet.</p>
            <p className="text-sm text-muted-foreground/70">Check back soon for project details.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
