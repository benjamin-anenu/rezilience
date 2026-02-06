import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MAX_DESCRIPTION_LENGTH = 150;

interface DescriptionSectionProps {
  description: string;
  category?: string | null;
  getCategoryLabel: (value: string) => string;
}

export function DescriptionSection({ description, category, getCategoryLabel }: DescriptionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Strip HTML tags for length calculation but preserve for display
  const plainText = description.replace(/<[^>]*>/g, '');
  const shouldTruncate = plainText.length > MAX_DESCRIPTION_LENGTH;
  
  // For truncation, work with plain text to avoid cutting in the middle of HTML tags
  const displayText = shouldTruncate && !isExpanded
    ? plainText.slice(0, MAX_DESCRIPTION_LENGTH) + '...'
    : description;
  
  // Check if description contains HTML
  const isHtml = /<[^>]+>/.test(description);

  return (
    <div className="mb-6">
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            About
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isHtml && isExpanded ? (
            <div 
              className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="text-foreground">
              {displayText}
            </p>
          )}
          
          {shouldTruncate && (
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0 text-primary"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </Button>
          )}
          
          {category && (
            <Badge variant="outline" className="mt-3 block w-fit">
              {getCategoryLabel(category)}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
