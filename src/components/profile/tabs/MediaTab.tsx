import { useState } from 'react';
import { Plus, Trash2, Image, Youtube, Video, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import type { ClaimedProfile, MediaAsset } from '@/types';

interface MediaTabProps {
  profile: ClaimedProfile;
  xUserId: string;
}

const MAX_ASSETS = 5;

export function MediaTab({ profile, xUserId }: MediaTabProps) {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(profile.mediaAssets || []);
  const [newAssetType, setNewAssetType] = useState<'image' | 'youtube' | 'video'>('image');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetTitle, setNewAssetTitle] = useState('');

  const updateProfile = useUpdateProfile();

  const handleAddAsset = () => {
    if (!newAssetUrl.trim() || mediaAssets.length >= MAX_ASSETS) return;

    const newAsset: MediaAsset = {
      id: `media_${Date.now()}`,
      type: newAssetType,
      url: newAssetUrl,
      title: newAssetTitle || undefined,
      order: mediaAssets.length,
    };

    const updatedAssets = [...mediaAssets, newAsset];
    setMediaAssets(updatedAssets);
    setNewAssetUrl('');
    setNewAssetTitle('');

    // Auto-save
    updateProfile.mutate({
      profileId: profile.id,
      xUserId,
      updates: { media_assets: updatedAssets },
    });
  };

  const handleRemoveAsset = (id: string) => {
    const filtered = mediaAssets.filter((a) => a.id !== id);
    const reordered = filtered.map((a, idx) => ({ ...a, order: idx }));
    setMediaAssets(reordered);

    // Auto-save
    updateProfile.mutate({
      profileId: profile.id,
      xUserId,
      updates: { media_assets: reordered },
    });
  };

  const handleMoveAsset = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === mediaAssets.length - 1)
    ) {
      return;
    }

    const newAssets = [...mediaAssets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newAssets[index], newAssets[targetIndex]] = [newAssets[targetIndex], newAssets[index]];
    
    const reordered = newAssets.map((a, idx) => ({ ...a, order: idx }));
    setMediaAssets(reordered);

    // Auto-save
    updateProfile.mutate({
      profileId: profile.id,
      xUserId,
      updates: { media_assets: reordered },
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg uppercase tracking-tight">
            Media Gallery
          </CardTitle>
          <CardDescription>
            Add screenshots, YouTube demos, or video recordings to showcase your project. 
            These appear on your public About page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Current Assets */}
          {mediaAssets.length > 0 && (
            <div className="mb-6 space-y-2">
              {mediaAssets
                .sort((a, b) => a.order - b.order)
                .map((asset, index) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-2 rounded-sm border border-border bg-muted/30 p-2"
                  >
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveAsset(index, 'up')}
                        disabled={index === 0 || updateProfile.isPending}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveAsset(index, 'down')}
                        disabled={index === mediaAssets.length - 1 || updateProfile.isPending}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                    
                    <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-muted">
                      {asset.type === 'image' ? (
                        <img
                          src={asset.url}
                          alt={asset.title || 'Preview'}
                          className="h-full w-full rounded-sm object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        getTypeIcon(asset.type)
                      )}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-mono text-xs">
                        {asset.title || asset.url}
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        {asset.type}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveAsset(asset.id)}
                      disabled={updateProfile.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          )}

          {/* Add New Asset */}
          {mediaAssets.length < MAX_ASSETS && (
            <div className="space-y-3 rounded-sm border border-dashed border-border p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Select value={newAssetType} onValueChange={(v) => setNewAssetType(v as 'image' | 'youtube' | 'video')}>
                  <SelectTrigger className="font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">
                      <div className="flex items-center gap-2">
                        <Image className="h-3 w-3" /> Image
                      </div>
                    </SelectItem>
                    <SelectItem value="youtube">
                      <div className="flex items-center gap-2">
                        <Youtube className="h-3 w-3" /> YouTube
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-3 w-3" /> Video
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Title (optional)"
                  value={newAssetTitle}
                  onChange={(e) => setNewAssetTitle(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder={
                    newAssetType === 'youtube'
                      ? 'https://youtube.com/watch?v=...'
                      : 'https://example.com/media.png'
                  }
                  value={newAssetUrl}
                  onChange={(e) => setNewAssetUrl(e.target.value)}
                  className="flex-1 font-mono text-xs"
                />
                <Button
                  onClick={handleAddAsset}
                  disabled={!newAssetUrl.trim() || updateProfile.isPending}
                  size="sm"
                  className="font-display text-xs uppercase tracking-wider"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="mr-1 h-3 w-3" /> Add
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-[10px] text-muted-foreground">
                {MAX_ASSETS - mediaAssets.length} slots remaining
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
