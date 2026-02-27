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
import { LogoUploader } from '@/components/profile/LogoUploader';
import { PROJECT_CATEGORIES, type ProjectCategory } from '@/types';
import { COUNTRIES } from '@/lib/countries';

interface CoreIdentityFormProps {
  projectName: string;
  setProjectName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  category: ProjectCategory | '';
  setCategory: (value: ProjectCategory) => void;
  country: string;
  setCountry: (value: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (value: string) => void;
  logoUrl?: string;
  setLogoUrl?: (value: string) => void;
  realmsDaoAddress?: string;
  setRealmsDaoAddress?: (value: string) => void;
}

export const CoreIdentityForm = ({
  projectName,
  setProjectName,
  description,
  setDescription,
  category,
  setCategory,
  country,
  setCountry,
  websiteUrl,
  setWebsiteUrl,
  logoUrl,
  setLogoUrl,
  realmsDaoAddress,
  setRealmsDaoAddress,
}: CoreIdentityFormProps) => {

  const isRealmsRelevant = !!category; // Any project type can have a Realm DAO
  const isValidSolanaAddress = (addr: string) => !addr || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);

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

          {setLogoUrl && (
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-wider">
                Project Logo
              </Label>
              <LogoUploader
                currentLogoUrl={logoUrl}
                onLogoUploaded={setLogoUrl}
                compact
              />
            </div>
          )}

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

          <div className="grid gap-4 md:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="country" className="font-display text-xs uppercase tracking-wider">
                Country / Region *
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Select country..." />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="font-mono">
                      {c.flag} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          {/* Realms DAO Address — shown for DAO/DeFi categories */}
          {isRealmsRelevant && setRealmsDaoAddress && (
            <div className="space-y-2">
              <Label htmlFor="realmsDaoAddress" className="font-display text-xs uppercase tracking-wider">
                Realms DAO Address
              </Label>
              <Input
                id="realmsDaoAddress"
                placeholder="e.g. GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw"
                value={realmsDaoAddress || ''}
                onChange={(e) => setRealmsDaoAddress(e.target.value)}
                className={`font-mono ${realmsDaoAddress && !isValidSolanaAddress(realmsDaoAddress) ? 'border-destructive' : ''}`}
              />
              {realmsDaoAddress && !isValidSolanaAddress(realmsDaoAddress) && (
                <p className="text-xs text-destructive">Invalid Solana address format</p>
              )}
              <p className="text-xs text-muted-foreground">
                Link your Realms governance to track proposal delivery rates.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
