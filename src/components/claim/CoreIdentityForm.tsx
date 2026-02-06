import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { WebsitePreview } from './WebsitePreview';
import { PROJECT_CATEGORIES, type ProjectCategory } from '@/types';

interface CoreIdentityFormProps {
  projectName: string;
  setProjectName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  category: ProjectCategory | '';
  setCategory: (value: ProjectCategory) => void;
  websiteUrl: string;
  setWebsiteUrl: (value: string) => void;
}

export const CoreIdentityForm = ({
  projectName,
  setProjectName,
  description,
  setDescription,
  category,
  setCategory,
  websiteUrl,
  setWebsiteUrl,
}: CoreIdentityFormProps) => {

  return (
    <div className="space-y-6">
      {/* Project Information */}
      <Card className="border-primary/30 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="font-display text-lg uppercase tracking-tight">
              Project Information
            </span>
            <span className="rounded-sm bg-primary/20 px-2 py-0.5 text-[10px] font-mono uppercase text-primary">
              REQUIRED
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="font-display text-xs uppercase tracking-wider">
              Project Name *
            </Label>
            <Input
              id="projectName"
              placeholder="My Awesome Protocol"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-display text-xs uppercase tracking-wider">
              Description
            </Label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Describe your project in detail..."
              className="min-h-[200px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="font-display text-xs uppercase tracking-wider">
              Category *
            </Label>
            <Select value={category} onValueChange={(val) => setCategory(val as ProjectCategory)}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="font-mono">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* The Digital Office */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="font-display text-lg uppercase tracking-tight">
              The Digital Office
            </span>
            <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
              OPTIONAL
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="font-display text-xs uppercase tracking-wider">
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://yourproject.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="font-mono"
            />
          </div>

          <WebsitePreview url={websiteUrl} />
        </CardContent>
      </Card>
    </div>
  );
};
