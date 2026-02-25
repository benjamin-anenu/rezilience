import { useState, useEffect } from 'react';
import { Globe, MessageCircle, Send, Loader2, Check, ImageIcon, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { LogoUploader } from '@/components/profile/LogoUploader';
import type { ClaimedProfile } from '@/types';

interface SettingsTabProps {
  profile: ClaimedProfile;
  xUserId: string;
}

export function SettingsTab({ profile, xUserId }: SettingsTabProps) {
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl || '');
  const [discordUrl, setDiscordUrl] = useState(profile.socials.discordUrl || '');
  const [telegramUrl, setTelegramUrl] = useState(profile.socials.telegramUrl || '');
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl || '');
  const [realmsDaoAddress, setRealmsDaoAddress] = useState((profile as any).realmsDaoAddress || '');
  const [hasChanges, setHasChanges] = useState(false);

  const updateProfile = useUpdateProfile();

  // Detect changes
  useEffect(() => {
    const changed =
      websiteUrl !== (profile.websiteUrl || '') ||
      discordUrl !== (profile.socials.discordUrl || '') ||
      telegramUrl !== (profile.socials.telegramUrl || '') ||
      logoUrl !== (profile.logoUrl || '') ||
      realmsDaoAddress !== ((profile as any).realmsDaoAddress || '');
    setHasChanges(changed);
  }, [websiteUrl, discordUrl, telegramUrl, logoUrl, realmsDaoAddress, profile]);

  const handleSave = () => {
    updateProfile.mutate({
      profileId: profile.id,
      xUserId,
      updates: {
        website_url: websiteUrl || undefined,
        discord_url: discordUrl || undefined,
        telegram_url: telegramUrl || undefined,
        logo_url: logoUrl || undefined,
        realms_dao_address: realmsDaoAddress || undefined,
      },
    });
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isWebsiteValid = validateUrl(websiteUrl);
  const isDiscordValid = validateUrl(discordUrl);
  const isTelegramValid = validateUrl(telegramUrl);
  const isRealmsValid = !realmsDaoAddress || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(realmsDaoAddress);
  const canSave = hasChanges && isWebsiteValid && isDiscordValid && isTelegramValid && isRealmsValid;

  return (
    <div className="space-y-6">
      {/* Project Logo */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg uppercase tracking-tight">
            <ImageIcon className="h-5 w-5 text-primary" />
            Project Logo
          </CardTitle>
          <CardDescription>
            Upload your project's logo. This appears in the explorer and on your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogoUploader
            profileId={profile.id}
            currentLogoUrl={profile.logoUrl}
            onLogoUploaded={setLogoUrl}
          />
        </CardContent>
      </Card>

      {/* Website URL */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg uppercase tracking-tight">
            <Globe className="h-5 w-5 text-primary" />
            Website URL
          </CardTitle>
          <CardDescription>
            Your project's official website. This is displayed on your public profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://yourproject.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className={!isWebsiteValid ? 'border-destructive' : ''}
            />
            {!isWebsiteValid && (
              <p className="text-xs text-destructive">Please enter a valid URL</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg uppercase tracking-tight">
            Social Links
          </CardTitle>
          <CardDescription>
            Connect your community channels. These appear on your public profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Discord */}
          <div className="space-y-2">
            <Label htmlFor="discord" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#5865F2]" />
              Discord Invite URL
            </Label>
            <Input
              id="discord"
              type="url"
              placeholder="https://discord.gg/yourserver"
              value={discordUrl}
              onChange={(e) => setDiscordUrl(e.target.value)}
              className={!isDiscordValid ? 'border-destructive' : ''}
            />
            {!isDiscordValid && (
              <p className="text-xs text-destructive">Please enter a valid URL</p>
            )}
          </div>

          {/* Telegram */}
          <div className="space-y-2">
            <Label htmlFor="telegram" className="flex items-center gap-2">
              <Send className="h-4 w-4 text-[#0088cc]" />
              Telegram Group URL
            </Label>
            <Input
              id="telegram"
              type="url"
              placeholder="https://t.me/yourgroup"
              value={telegramUrl}
              onChange={(e) => setTelegramUrl(e.target.value)}
              className={!isTelegramValid ? 'border-destructive' : ''}
            />
            {!isTelegramValid && (
              <p className="text-xs text-destructive">Please enter a valid URL</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Realms DAO Address */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg uppercase tracking-tight">
            <Heart className="h-5 w-5 text-chart-4" />
            Realms DAO Address
          </CardTitle>
          <CardDescription>
            Link your Realms governance DAO to track proposal delivery rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="realmsDao">DAO Address</Label>
            <Input
              id="realmsDao"
              placeholder="e.g. GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw"
              value={realmsDaoAddress}
              onChange={(e) => setRealmsDaoAddress(e.target.value)}
              className={`font-mono ${!isRealmsValid ? 'border-destructive' : ''}`}
            />
            {!isRealmsValid && (
              <p className="text-xs text-destructive">Invalid Solana address format</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!canSave || updateProfile.isPending}
          className="font-display uppercase tracking-wider"
        >
          {updateProfile.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : updateProfile.isSuccess && !hasChanges ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
