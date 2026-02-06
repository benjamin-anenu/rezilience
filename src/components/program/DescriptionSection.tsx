import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DescriptionSectionProps {
  description: string;
  category?: string | null;
  getCategoryLabel: (value: string) => string;
}

// Extract first paragraph from HTML or plain text
function extractFirstParagraph(content: string): { firstParagraph: string; hasMore: boolean } {
  const isHtml = /<[^>]+>/.test(content);
  
  if (isHtml) {
    // Match first <p>...</p> block or content before first </p>
    const pMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) {
      const firstP = pMatch[0];
      const remainingContent = content.slice(content.indexOf(firstP) + firstP.length).trim();
      // Check if there's more content after the first paragraph
      const hasMore = remainingContent.length > 0 && /<[^>]+>/.test(remainingContent);
      return { firstParagraph: firstP, hasMore };
    }
    // Fallback: return full content if no <p> tags
    return { firstParagraph: content, hasMore: false };
  } else {
    // Plain text: split by double newlines or single newlines
    const paragraphs = content.split(/\n\n|\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) {
      return { firstParagraph: paragraphs[0], hasMore: true };
    }
    return { firstParagraph: content, hasMore: false };
  }
}

export function DescriptionSection({ description, category, getCategoryLabel }: DescriptionSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const isHtml = /<[^>]+>/.test(description);
  const { firstParagraph, hasMore } = extractFirstParagraph(description);

  const FullDescription = () => (
    <>
      {isHtml ? (
        <div 
          className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : (
        <p className="text-foreground leading-relaxed">
          {description}
        </p>
      )}
      
      {category && (
        <Badge variant="outline" className="mt-6 block w-fit">
          {getCategoryLabel(category)}
        </Badge>
      )}
    </>
  );

  return (
    <div className="mb-6">
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            About
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isHtml ? (
            <div 
              className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
              dangerouslySetInnerHTML={{ __html: firstParagraph }}
            />
          ) : (
            <p className="text-foreground leading-relaxed">
              {firstParagraph}
            </p>
          )}
          
          {hasMore && (
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0 text-primary"
              onClick={() => setIsOpen(true)}
            >
              Read More
            </Button>
          )}
          
          {category && (
            <Badge variant="outline" className="mt-3 block w-fit">
              {getCategoryLabel(category)}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Mobile: Bottom Drawer */}
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="flex items-center justify-between border-b border-border pb-4">
              <DrawerTitle className="font-display text-lg uppercase tracking-wider">
                About
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            
            <div className="overflow-y-auto px-4 py-6">
              <FullDescription />
            </div>
            
            <DrawerFooter className="border-t border-border pt-4">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full font-display uppercase tracking-wider">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        /* Desktop: Side Sheet */
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="right" className="w-[400px] overflow-y-auto sm:w-[540px]">
            <SheetHeader className="border-b border-border pb-4">
              <SheetTitle className="font-display text-lg uppercase tracking-wider">
                About
              </SheetTitle>
            </SheetHeader>
            
            <div className="py-6">
              <FullDescription />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
